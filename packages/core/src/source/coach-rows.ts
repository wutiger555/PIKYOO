import type { Coach, LessonType, PayMethod, Plan } from "../types";
import type { Json } from "./db.types";

/** jsonb columns take plain data; the screen types are plain data too, just not index-signatured. */
const json = (x: unknown) => x as Json;

// Screen types → database columns for a coach and their plans. Plain data, no client: the seed generator
// (web/scripts/gen-seed.mts) and saveMyCoach both use it, so the demo seed and a saved page agree.

export const PAY_DB: Record<PayMethod, "line_pay" | "bank_transfer" | "cash"> = { "LINE Pay": "line_pay", 銀行轉帳: "bank_transfer", 現場付現: "cash" };
export const UNIT_DB: Record<Plan["unit"], "per_person" | "per_lesson" | "per_pack"> = { "/人": "per_person", "/堂": "per_lesson", "/10 堂": "per_pack" };
export const LESSON_DB: Record<LessonType, "trial" | "private" | "small" | "group"> = { 體驗課: "trial", 一對一: "private", 小班: "small", 團體: "group" };

/** The screens don't ask for a plan's kind; it follows from the name and whether friends can join. */
export const planKind = (p: Plan): LessonType =>
  p.name.includes("體驗") ? "體驗課" : p.name.includes("團體") ? "團體" : p.group ? "小班" : "一對一";

/** Stored photo path: uploads keep their bucket path, demo photos their /photos/… path; unsaved local files are dropped. */
const photoPath = (src: string, storagePrefix: string) =>
  src.startsWith(storagePrefix) ? src.slice(storagePrefix.length) : src.startsWith("/") ? src : null;

/** The coaches columns a coach may edit (not slug, status or approval). */
export function coachColumns(c: Coach, supabaseUrl: string) {
  const p = c.profile;
  const prefix = `${supabaseUrl}/storage/v1/object/public/coach-photos/`;
  return {
    name: c.name, tagline: c.tagline, bio: p.bio, areas: c.areas, level_min: c.levelMin, level_max: c.levelMax, style: c.style,
    beginner_friendly: c.beginnerFriendly, coaching_since: c.years ? new Date().getFullYear() - c.years : null, reply_note: p.reply,
    play: json(p.play), audience: p.audience, languages: p.languages, availability: json(p.availability),
    venues: json(p.venues.map((v) => ({ name: v.name, sub: v.sub, court_slug: v.courtId ?? null }))),
    steps: p.steps, pay_methods: p.pay.map((x) => PAY_DB[x]), policy: p.policy,
    photos: json(p.photos.flatMap((x) => {
      const path = photoPath(x.src, prefix);
      return path ? [{ path, alt: x.alt, caption: x.caption ?? null }] : [];
    })),
    timeline: json(p.timeline), quotes: json(p.quotes),
  };
}

/** One coach_plans row; capacity is the group's maximum, or 1 for a private lesson. */
export const planRow = (pl: Plan, sort: number) => ({
  key: pl.id, name: pl.name, kind: LESSON_DB[planKind(pl)], duration_min: pl.durationMin, size_label: pl.size,
  capacity: pl.group?.max ?? 1, group_min: pl.group?.min ?? null, group_max: pl.group?.max ?? null,
  price: pl.price, unit: UNIT_DB[pl.unit], note: pl.note, tag: pl.tag ?? null, sort, archived_at: null,
});
