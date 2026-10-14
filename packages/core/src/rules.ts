import type { Coach } from "./types";

// Platform rules that every coach follows (2026-10-14 coach interview: rules that involve money are the platform's,
// written down, and not customised per coach). The numbers are a first draft for the owner to confirm.

/** 取消與請假 for every lesson on PIKYOO. */
export const CANCEL_RULE = {
  freeHours: 24,
  lateFeePct: 50,
} as const;

/** One line for booking pages and coach pages. */
export const CANCEL_TEXT = `上課前 ${CANCEL_RULE.freeHours} 小時可免費取消或改期；${CANCEL_RULE.freeHours} 小時內取消，收課程費用 ${CANCEL_RULE.lateFeePct}%。教練臨時取消全額退款。`;

/** 教學專長: a fixed list so students can filter by it (a coach who builds players vs one who runs beginner groups).
 *  Stored in coaches.style; older free-form tags there are ignored. */
export const SPECIALTIES = ["零基礎入門", "團體帶氣氛", "技術細節", "比賽與選手", "親子兒童"] as const;
export type Specialty = (typeof SPECIALTIES)[number];

export const specialties = (c: Pick<Coach, "style">): Specialty[] =>
  SPECIALTIES.filter((s) => c.style.includes(s));
