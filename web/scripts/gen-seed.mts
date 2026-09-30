// Writes supabase/seed.sql from the demo's mock data, so a dev database starts with the same courts, coaches,
// games and Q&A the demo shows. Run from web/: `npm run db:seed` (Node 22.18+ runs TypeScript directly).
// Dates are stored relative to "today" in Taipei (the mock's today is 9/29), so the seed never goes stale.

import { writeFileSync } from "node:fs";
import { COACHES, initialGroups, initialRequests } from "../src/lib/data/coaches.ts";
import { COURTS } from "../src/lib/data/courts.ts";
import { GAMES } from "../src/lib/data/games.ts";
import { initialQuestions } from "../src/lib/data/questions.ts";
import type { LessonType, PayMethod, Plan } from "../src/lib/types.ts";

const MOCK_TODAY = { m: 9, d: 29 };

const q = (s: string | null | undefined) => (s == null ? "null" : `'${s.replace(/'/g, "''")}'`);
const json = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;
const arr = (xs: string[], type = "text") => (xs.length ? `array[${xs.map(q).join(", ")}]::${type}[]` : `'{}'::${type}[]`);
const uid = (name: string) => `md5(${q("pikyoo-seed:" + name)})::uuid`;
const coachId = (id: string) => `(select id from public.coaches where slug = ${q(id)})`;
const courtId = (slug?: string) => (slug ? `(select id from public.courts where slug = ${q(slug)})` : "null");
const planId = (coach: string, key: string) => `(select id from public.coach_plans where coach_id = ${coachId(coach)} and key = ${q(key)})`;

/** "10/4" + "19:30" → a timestamptz the same number of days after today (Taipei) as 10/4 is after 9/29. */
const at = (md: string, hhmi: string) => {
  const [m, d] = md.split("/").map(Number);
  const days = Math.round((Date.UTC(2026, m - 1, d) - Date.UTC(2026, MOCK_TODAY.m - 1, MOCK_TODAY.d)) / 864e5);
  return `((date_trunc('day', now() at time zone 'Asia/Taipei') + interval '${days} days' + time '${hhmi}') at time zone 'Asia/Taipei')`;
};
/** Question dates like 9/12 are in the past: keep them as fixed 2026 dates. */
const past = (label: string) => (/^\d+\/\d+$/.test(label) ? `timestamptz '2026-${label.replace("/", "-")} 12:00+08'` : "now()");

const PAY: Record<PayMethod, string> = { "LINE Pay": "line_pay", 銀行轉帳: "bank_transfer", 現場付現: "cash" };
const KIND: Record<string, string> = { 室內: "indoor", 室外: "outdoor", 風雨: "covered" };
const BOOKING: Record<string, string> = { 公立預約系統: "public_system", 官網預約: "website", "LINE 預約": "line", 電話預約: "phone", 免預約: "walk_in" };
const UNIT: Record<Plan["unit"], string> = { "/人": "per_person", "/堂": "per_lesson", "/10 堂": "per_pack" };
const planKind = (p: Plan): LessonType =>
  p.name.includes("體驗") ? "體驗課" : p.name.includes("團體") ? "團體" : p.group ? "小班" : "一對一";
const LESSON_KIND: Record<LessonType, string> = { 體驗課: "trial", 一對一: "private", 小班: "small", 團體: "group" };

const users = new Set<string>();
const person = (name: string) => users.add(name);

const out: string[] = [];
const emit = (s: string) => out.push(s);

// — courts —
for (const c of COURTS) {
  emit(`insert into public.courts (slug, name, city, district, address, kind, court_count, surface, is_free, price_note, hours_note,
  amenities, has_aircon, has_lights, booking_method, booking_note, rules, photos, verified_at) values (
  ${q(c.id)}, ${q(c.name)}, ${q(c.address.slice(0, 3))}, ${q(c.district)}, ${q(c.address)}, '${KIND[c.kind]}', ${c.courtCount}, ${q(c.surface)},
  ${c.free}, ${q(c.priceNote)}, ${q(c.hours)}, ${arr(c.amenities)}, ${c.aircon}, ${c.lights}, '${BOOKING[c.booking]}', ${q(c.bookingNote)},
  ${q(c.rules)}, ${json(c.photo ? [{ path: c.photo.src, alt: c.photo.alt }] : [])}, ${c.verified ? q(c.verified.replace("/", "-") + "-01") : "null"});`);
}

// — coaches —
for (const c of COACHES) {
  person(c.name);
  const p = c.profile;
  emit(`insert into public.coaches (profile_id, slug, name, status, tagline, bio, areas, level_min, level_max, style, beginner_friendly,
  coaching_since, reply_note, play, audience, languages, availability, venues, steps, pay_methods, policy, photos, timeline, quotes, approved_at) values (
  ${uid(c.name)}, ${q(c.id)}, ${q(c.name)}, 'approved', ${q(c.tagline)}, ${q(p.bio)}, ${arr(c.areas)}, ${c.levelMin}, ${c.levelMax}, ${arr(c.style)},
  ${c.beginnerFriendly}, ${2026 - c.years}, ${q(p.reply)}, ${json(p.play)}, ${arr(p.audience)}, ${arr(p.languages)}, ${json(p.availability)},
  ${json(p.venues.map((v) => ({ name: v.name, sub: v.sub, court_slug: v.courtId ?? null })))}, ${arr(p.steps)},
  ${arr(p.pay.map((x) => PAY[x]), "public.pay_method")}, ${q(p.policy)},
  ${json(p.photos.map((x) => ({ path: x.src, alt: x.alt, caption: x.caption ?? null })))}, ${json(p.timeline)}, ${json(p.quotes)}, now());`);
  for (const cr of c.creds) {
    const dupr = cr.issuer === "DUPR";
    emit(`insert into public.credentials (coach_id, type, issuer, level, status) values (${coachId(c.id)}, '${dupr ? "dupr" : "coach_cert"}', ${q(cr.issuer)}, ${q(cr.level)}, '${dupr ? "self_reported" : "verified"}');`);
  }
  p.plans.forEach((pl, i) =>
    emit(`insert into public.coach_plans (coach_id, key, name, kind, duration_min, size_label, capacity, group_min, group_max, price, unit, note, tag, sort) values (
  ${coachId(c.id)}, ${q(pl.id)}, ${q(pl.name)}, '${LESSON_KIND[planKind(pl)]}', ${pl.durationMin}, ${q(pl.size)}, ${pl.group?.max ?? 1},
  ${pl.group?.min ?? "null"}, ${pl.group?.max ?? "null"}, ${pl.price}, '${UNIT[pl.unit]}', ${q(pl.note)}, ${q(pl.tag)}, ${i});`));
}

// — games: the host takes a seat through the insert trigger, the rest join in order, then the waitlist —
for (const g of GAMES) {
  person(g.host.name);
  emit(`insert into public.games (id, host_id, court_id, location_text, address, district, starts_at, ends_at, level_min, level_max, capacity,
  fee, fee_note, cancel_hours, beginner_friendly, notes) values (
  md5(${q("pikyoo-seed-game:" + g.id)})::uuid, ${uid(g.host.name)}, ${courtId(g.courtId)}, ${q(g.courtId ? "" : g.venue)}, ${q(g.address)}, ${q(g.district)},
  ${at(g.date, g.startsAt)}, ${at(g.date, g.endsAt)}, ${g.levelMin}, ${g.levelMax}, ${g.capacity}, ${g.fee}, ${q(g.payNote)}, ${g.cancelHours ?? 12},
  ${g.beginnerFriendly}, ${q(g.notes)});`);
  const rest = [...g.participants.slice(1).map((p) => ({ name: p.name, status: "joined" })),
    ...Array.from({ length: g.waitlist }, (_, i) => ({ name: `候補${i + 1}`, status: "waitlisted" }))];
  rest.forEach((p, i) => {
    person(p.name);
    emit(`insert into public.game_participants (game_id, user_id, added_by, status, joined_at) values (md5(${q("pikyoo-seed-game:" + g.id)})::uuid, ${uid(p.name)}, ${uid(p.name)}, '${p.status}', now() - interval '${rest.length - i} hours');`);
  });
}

// — Q&A —
for (const x of initialQuestions()) {
  person(x.name);
  emit(`insert into public.questions (coach_id, asker_id, text, answer, answered_at, created_at) values (${coachId(x.coachId)}, ${uid(x.name)}, ${q(x.text)},
  ${q(x.answer?.text)}, ${x.answer ? past(x.answer.at) : "null"}, ${past(x.askedAt)});`);
}

// — Mia's console: two pending requests and a 揪團 gathering friends —
const mia = COACHES.find((c) => c.id === "mia")!;
for (const r of initialRequests()) {
  const [, md, hhmi] = r.when.match(/^(\d+\/\d+)（.）(\d\d:\d\d)$/)!;
  const plan = mia.profile.plans.find((p) => r.plan.startsWith(p.name.slice(0, 3)))!;
  person(r.name);
  emit(`insert into public.lesson_bookings (coach_id, plan_id, student_id, starts_at, headcount, note, pay_method, amount, expires_at) values (
  ${coachId("mia")}, ${planId("mia", plan.id)}, ${uid(r.name)}, ${at(md, hhmi)}, 1, ${q(r.note)}, '${PAY[r.pay]}', ${r.amount}, now() + interval '${parseInt(r.expiresIn)} hours');`);
}
const days: Record<string, string> = { d1: "9/30", d2: "10/1", d3: "10/2", d4: "10/3", d5: "10/4", d6: "10/5", d7: "10/6" };
for (const g of initialGroups()) {
  const gid = `md5(${q("pikyoo-seed-group:" + g.id)})::uuid`;
  const start = at(days[g.dayKey], g.slot);
  emit(`insert into public.lesson_groups (id, coach_id, plan_id, starts_at, organizer_id, invite_code, note, deadline_at) values (
  ${gid}, ${coachId(g.coachId)}, ${planId(g.coachId, g.planId)}, ${start}, ${uid(g.members[0].name)}, ${q("seed" + g.id)}, ${q(g.note)}, ${start} - interval '24 hours');`);
  for (const m of g.members) {
    person(m.name);
    emit(`insert into public.lesson_group_members (group_id, user_id) values (${gid}, ${uid(m.name)});`);
  }
}

const header = `-- Generated by web/scripts/gen-seed.ts from the demo's mock data. Do not edit; change the mock data and re-run.
-- Dev databases only: every person here is a made-up seed user (seed+…@pikyoo.test) and the photos are demo stock photos.

-- the token columns are '' rather than null because Supabase Auth can't read null there
insert into auth.users (id, aud, role, email, confirmation_token, recovery_token, email_change_token_new, email_change, raw_user_meta_data) values
${[...users].map((n, i) => `  (${uid(n)}, 'authenticated', 'authenticated', 'seed+${i + 1}@pikyoo.test', '', '', '', '', ${json({ name: n })})`).join(",\n")};
`;
writeFileSync(new URL("../../supabase/seed.sql", import.meta.url), header + "\n" + out.join("\n") + "\n");
console.log(`supabase/seed.sql: ${users.size} users, ${COURTS.length} courts, ${COACHES.length} coaches, ${GAMES.length} games`);
