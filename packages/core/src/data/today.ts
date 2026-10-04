import type { Weekday } from "../types";

// The demo's dates follow the real calendar (Taipei), so the demo site looks current whenever it is shown.
// Computed on every call: a server process lives for days. The seed generator pins the day
// (PIKYOO_DEMO_TODAY=2026-09-29) so supabase/seed.sql never changes.

const WD: Weekday[] = ["日", "一", "二", "三", "四", "五", "六"];
const pinned = () => (typeof process !== "undefined" && process.env?.PIKYOO_DEMO_TODAY) || "";

/** The demo day `offset` days from today: 9/29 and its weekday. */
export function demoDay(offset: number): { date: string; weekday: Weekday } {
  const base = pinned() ? Date.parse(`${pinned()}T12:00:00+08:00`) : Date.now();
  const d = new Date(base + 8 * 3600e3 + offset * 864e5);
  return { date: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`, weekday: WD[d.getUTCDay()] };
}

/** Days until the next `wd` at least `min` days ahead, as the games list's 週六／週日 groups. */
export function daysUntil(wd: Weekday, min = 2): number {
  for (let n = min; n < min + 7; n++) if (demoDay(n).weekday === wd) return n;
  return min;
}

/** 10/4（日）: a day offset in the format the console and lesson cards use. */
export const demoDate = (offset: number) => {
  const d = demoDay(offset);
  return `${d.date}（${d.weekday}）`;
};
