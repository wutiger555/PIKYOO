import type { BookingDay, Coach, CoachProfile, CoachVenue, Court } from "./types";

// 場地費 and where a lesson is (2026-10-17): the fee follows the venue, each weekly slot points at a venue, and the
// student always sees the coach's per-person fee next to the court's published price. The platform never collects it.

export const slotVenueKey = (weekday: string, hhmm: string) => `${weekday}|${hhmm}`;

/** The venue a weekly slot is held at, or null when the coach hasn't set one (地點未定). */
export function venueForSlot(p: CoachProfile, day: Pick<BookingDay, "weekday">, hhmm: string): CoachVenue | null {
  const name = p.slotVenues?.[slotVenueKey(day.weekday, hhmm)];
  return name ? p.venues.find((v) => v.name === name) ?? null : null;
}

/** 場地費 for `headcount` students at a venue (per person, on top of the lesson). */
export const venueFee = (v: CoachVenue | null | undefined, headcount = 1) => (v?.fee ?? 0) * headcount;

export const feeToText = (v: CoachVenue) => (v.feeTo === "venue" ? "上課時付給場館" : "跟學費一起付給教練");

/** "NT$400–800／小時／面（PIKYOO 2026/10 確認）" from a court's published price, for the comparison line. */
export function courtFeeText(ct: Court | undefined) {
  if (!ct) return null;
  if (ct.free) return "免費場地";
  if (!ct.fee) return ct.priceNote || null;
  const range = ct.fee.low === ct.fee.high ? `NT$${ct.fee.low}` : `NT$${ct.fee.low}–${ct.fee.high}`;
  return `${range}／小時／面（PIKYOO ${ct.fee.checked} 確認）`;
}

/** A rough per-person figure from the court's price, to hint the coach when they type a fee. */
export const courtFeePerHead = (ct: Court | undefined, headcount = 4) => (ct?.fee ? Math.round(((ct.fee.low + ct.fee.high) / 2) / headcount / 10) * 10 : null);

/** The court a coach venue points at, if it's in the court database. */
export const courtOf = (v: CoachVenue | null | undefined, courts: Court[]) => (v?.courtId ? courts.find((c) => c.id === v.courtId) : undefined);

export const isOutdoor = (ct: Court | undefined) => ct?.kind === "室外";

/** Lines for the booking summary: lesson, court fee (if any), where it's paid. */
export function feeLines(c: Coach, day: Pick<BookingDay, "weekday"> | null, slot: string | null, headcount: number) {
  const v = day && slot ? venueForSlot(c.profile, day, slot) : null;
  const fee = venueFee(v, headcount);
  return { venue: v, fee, feeTo: v ? feeToText(v) : null };
}
