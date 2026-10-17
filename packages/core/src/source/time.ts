import type { Weekday } from "../types";

const WD: Weekday[] = ["日", "一", "二", "三", "四", "五", "六"];

/** Taipei calendar parts of an instant (UTC+8 all year). Day keys are YYYY-MM-DD. Its own module so notes.ts and
 *  payments.ts don't pull bookings.ts in a cycle. */
export function tpeParts(t: string | number | Date) {
  const d = new Date(new Date(t).getTime() + 8 * 3600e3);
  const iso = d.toISOString();
  return { key: iso.slice(0, 10), date: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`, weekday: WD[d.getUTCDay()], hhmm: iso.slice(11, 16) };
}
