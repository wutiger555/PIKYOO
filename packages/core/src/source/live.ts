import { createClient } from "@supabase/supabase-js";
import type {
  BookingMethod, Coach, CoachPhoto, CourtKind, Court, DayGroup, Game, LessonType, Level, PayMethod, PlayProfile, Plan,
  TimelineItem, Weekday,
} from "../types";
import type { Database, Enums, Tables } from "./db.types";
import type { Catalog, DataSource } from "./types";

// Supabase → the types the screens already use, so the screens don't change (docs/BACKEND.md §3).
// B1 reads as a visitor with the publishable key; B2 switches to the signed-in user's session.
// No framework code here: the caller passes the URL and key (web: NEXT_PUBLIC_*, app: EXPO_PUBLIC_*)
// and decides about caching (web forces a fresh read per request).

export interface LiveConfig { url: string; publishableKey: string }

const ok = <T,>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(`Supabase: ${r.error.message}`);
  return r.data!;
};

const KIND: Record<Enums<"court_kind">, CourtKind> = { indoor: "室內", outdoor: "室外", covered: "風雨" };
const BOOKING: Record<Enums<"booking_method">, BookingMethod> = {
  public_system: "公立預約系統", website: "官網預約", line: "LINE 預約", phone: "電話預約", walk_in: "免預約",
};
const PAY: Record<Enums<"pay_method">, PayMethod> = { line_pay: "LINE Pay", bank_transfer: "銀行轉帳", cash: "現場付現" };
const LESSON: Record<Enums<"lesson_kind">, LessonType> = { trial: "體驗課", private: "一對一", small: "小班", group: "團體" };
const UNIT: Record<Enums<"plan_unit">, Plan["unit"]> = { per_person: "/人", per_lesson: "/堂", per_pack: "/10 堂" };

/** Demo photos live in web/public (path starts with /); uploaded ones in a public Storage bucket. */
const photoUrl = (url: string) => (bucket: string, path: string) => (path.startsWith("/") ? path : `${url}/storage/v1/object/public/${bucket}/${path}`);
const initial = (name: string) => (name.trim()[0] ?? "?").toUpperCase();

// — Taipei calendar (UTC+8 all year) —

const WD: Weekday[] = ["日", "一", "二", "三", "四", "五", "六"];
const tpe = (t: string | number | Date) => {
  const d = new Date(new Date(t).getTime() + 8 * 3600e3);
  return { day: Math.floor(d.getTime() / 864e5), md: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`, wd: WD[d.getUTCDay()], hhmm: d.toISOString().slice(11, 16) };
};

/** The list shows today, tomorrow and the coming weekend (2–8 days out), as the demo does. */
function calendar(now: number) {
  const at = (n: number) => tpe(now + n * 864e5);
  const next = (wd: Weekday) => [2, 3, 4, 5, 6, 7, 8].find((n) => at(n).wd === wd)!;
  const offset: Record<DayGroup, number> = { today: 0, tomorrow: 1, sat: next("六"), sun: next("日") };
  const labels: Record<DayGroup, string> = {
    today: `今天 ${at(0).md}（${at(0).wd}）`, tomorrow: `明天 ${at(1).md}（${at(1).wd}）`,
    sat: `週六 ${at(offset.sat).md}`, sun: `週日 ${at(offset.sun).md}`,
  };
  const groupOf = (iso: string) => (Object.keys(offset) as DayGroup[]).find((k) => tpe(iso).day - at(0).day === offset[k]);
  return { labels, groupOf, at };
}

type Photo = ReturnType<typeof photoUrl>;

const DAY_LABEL: Record<DayGroup, string> = { today: "今天", tomorrow: "明天", sat: "週六", sun: "週日" };

// — rows —

type CoachCard = Tables<"coaches"> & { price_from: number | null; kinds: Enums<"lesson_kind">[]; students: number };
type GameCard = Tables<"games"> & {
  host_name: string; court_slug: string | null; court_name: string | null; court_kind: Enums<"court_kind"> | null; court_count: number | null;
  joined_count: number; waitlist_count: number; host_game_count: number;
};

function toCourt(photo: Photo, c: Tables<"courts">, i: number): Court {
  const p = (c.photos as { path: string; alt: string }[])[0];
  return {
    id: c.slug, name: c.name, district: c.district, address: c.address, kind: KIND[c.kind], courtCount: c.court_count, surface: c.surface,
    free: c.is_free, priceNote: c.price_note, hours: c.hours_note, amenities: c.amenities, aircon: c.has_aircon, lights: c.has_lights,
    booking: BOOKING[c.booking_method], bookingNote: c.booking_note, rules: c.rules,
    verified: c.verified_at ? c.verified_at.slice(0, 7).replace("-", "/") : undefined,
    // no "near me" yet; pins sit on a rough 雙北 box when the court has coordinates, else spread out
    distance: "",
    map: c.lat != null && c.lng != null
      ? [Math.round(((c.lng - 121.42) / 0.24) * 100), Math.round(((25.13 - c.lat) / 0.16) * 100)]
      : [15 + ((i * 37) % 70), 20 + ((i * 23) % 60)],
    photo: p && { src: photo("court-photos", p.path), alt: p.alt },
  };
}

function toCoach(photo: Photo, c: CoachCard, creds: Tables<"credentials">[], plans: Tables<"coach_plans">[], at: (n: number) => ReturnType<typeof tpe>): Coach {
  const availability = c.availability as Coach["profile"]["availability"];
  const now = at(0);
  // 最近可約: the first weekly slot still ahead of now in the next 7 days
  let nextSlot = "尚未開放時段";
  for (let n = 0; n < 8 && nextSlot === "尚未開放時段"; n++) {
    const d = at(n);
    const t = (availability[d.wd] ?? []).find((x) => n > 0 || x > now.hhmm);
    if (t) nextSlot = `週${d.wd} ${d.md} ${t}`;
  }
  return {
    id: c.slug, name: c.name, initial: initial(c.name),
    creds: creds.map((x) => ({ issuer: x.issuer, level: x.level, verified: x.status === "verified" })),
    areas: c.areas, levelMin: c.level_min as Level, levelMax: c.level_max as Level,
    types: (Object.keys(LESSON) as Enums<"lesson_kind">[]).filter((k) => c.kinds.includes(k)).map((k) => LESSON[k]),
    priceFrom: c.price_from ?? 0, nextSlot, style: c.style, beginnerFriendly: c.beginner_friendly,
    years: c.coaching_since ? Math.max(1, new Date().getFullYear() - c.coaching_since) : 0,
    students: c.students, rating: null, reviews: 0, tagline: c.tagline,
    profile: {
      slug: `pikyoo.tw/c/${c.slug}`, reply: c.reply_note, bio: c.bio,
      photos: (c.photos as { path: string; alt: string; caption: string | null }[])
        .map((x): CoachPhoto => ({ src: photo("coach-photos", x.path), alt: x.alt, caption: x.caption ?? undefined })),
      play: c.play as unknown as PlayProfile, audience: c.audience, languages: c.languages, availability,
      plans: plans.map((p) => ({
        id: p.key, name: p.name, durationMin: p.duration_min, size: p.size_label, price: p.price, unit: UNIT[p.unit], note: p.note,
        tag: p.tag ?? undefined, group: p.group_min != null && p.group_max != null ? { min: p.group_min, max: p.group_max } : undefined,
      })),
      timeline: c.timeline as unknown as TimelineItem[],
      venues: (c.venues as { name: string; sub: string; court_slug: string | null }[]).map((v) => ({ name: v.name, sub: v.sub, courtId: v.court_slug ?? undefined })),
      steps: c.steps, pay: c.pay_methods.map((m) => PAY[m]), policy: c.policy,
      quotes: c.quotes as Coach["profile"]["quotes"],
    },
  };
}

function toGame(g: GameCard, group: DayGroup, roster: { name: string; host: boolean }[], viewerWaiting: boolean): Game {
  const s = tpe(g.starts_at);
  const name = (n: string) => ({ name: n, initial: initial(n) });
  return {
    id: g.id, group, dayLabel: DAY_LABEL[group], date: s.md, startsAt: s.hhmm, endsAt: tpe(g.ends_at).hhmm,
    venue: g.court_name ?? g.location_text, district: g.district,
    courtKind: g.court_kind ? `${KIND[g.court_kind]} ${g.court_count} 面` : "", address: g.address,
    levelMin: g.level_min as Level, levelMax: g.level_max as Level, capacity: g.capacity,
    // host first, then everyone else in sign-up order
    participants: [...roster.filter((p) => p.host), ...roster.filter((p) => !p.host)].map((p) => name(p.name)),
    host: { ...name(g.host_name), summary: `開過 ${g.host_game_count} 團` },
    fee: g.fee, payNote: g.fee_note, beginnerFriendly: g.beginner_friendly, waitlist: g.waitlist_count - (viewerWaiting ? 1 : 0), notes: g.notes,
    courtId: g.court_slug ?? undefined, cancelHours: g.cancel_hours,
  };
}

export const createLive = ({ url, publishableKey }: LiveConfig): DataSource => ({
  async catalog(viewer?: string): Promise<Catalog> {
    const photo = photoUrl(url);
    const now = Date.now();
    const cal = calendar(now);
    const sb = createClient<Database>(url, publishableKey, { auth: { persistSession: false } });
    const [courts, coaches, creds, plans, games] = await Promise.all([
      sb.from("courts").select("*").order("created_at").then(ok),
      sb.from("coach_cards").select("*").eq("status", "approved").order("approved_at").then(ok),
      sb.from("credentials").select("*").order("created_at").then(ok),
      sb.from("coach_plans").select("*").is("archived_at", null).order("sort").then(ok),
      sb.from("game_cards").select("*").is("cancelled_at", null).gt("ends_at", new Date(now).toISOString())
        .lt("starts_at", new Date(now + 9 * 864e5).toISOString()).order("starts_at").then(ok),
    ]);
    const shown = (games as GameCard[]).flatMap((g) => {
      const group = cal.groupOf(g.starts_at);
      return group ? [{ g, group }] : [];
    });
    const ids = shown.map((x) => x.g.id);
    const [roster, own] = ids.length
      ? await Promise.all([
          sb.from("game_participants").select("game_id, user_id, guest_name, profiles!game_participants_user_id_fkey(display_name)")
            .in("game_id", ids).eq("status", "joined").order("joined_at").then(ok),
          viewer
            ? sb.from("game_participants").select("game_id, status").in("game_id", ids).eq("user_id", viewer)
                .in("status", ["joined", "waitlisted"]).then(ok)
            : [],
        ])
      : [[], []];
    const mine = Object.fromEntries(own.map((p) => [p.game_id, p.status === "joined" ? ("joined" as const) : ("wait" as const)]));
    return {
      courts: courts.map((c, i) => toCourt(photo, c, i)),
      coaches: (coaches as CoachCard[]).map((c) =>
        toCoach(photo, c, creds.filter((x) => x.coach_id === c.id), plans.filter((p) => p.coach_id === c.id), cal.at)),
      games: shown.map(({ g, group }) => toGame(g, group, roster.filter((p) => p.game_id === g.id && (!viewer || p.user_id !== viewer))
        .map((p) => ({ name: p.guest_name ?? p.profiles?.display_name ?? "", host: p.user_id === g.host_id })), mine[g.id] === "wait")),
      dayGroups: cal.labels,
      mine,
    };
  },
});
