import type { BookingStatus, PaymentRow } from "./types";

// The words a booking and a payment are called on screen, shared by the website and the app (2026-10-11 simplification):
// a student sees three — 等教練回覆, 去付款, 完成 — and a coach's payment row reads 還沒付, 學生說付好了, 已收到.
// Words that sound like the system talking (對帳, 已回報) stay out of what people read.

export type Tone = "almost" | "info" | "open";

/** What a student calls their booking. reported and paid both read 完成: once they've paid, their part is done. */
export const BOOKING_LABEL: Record<BookingStatus, { label: string; tone: Tone }> = {
  pending: { label: "等教練回覆", tone: "almost" },
  confirmed: { label: "去付款", tone: "info" },
  reported: { label: "完成", tone: "open" },
  paid: { label: "完成", tone: "open" },
};

/** The student's progress bar: 教練回覆 → 付款 → 完成, and which step is current (3 = every step done). */
export const BOOKING_STEPS = ["教練回覆", "付款", "完成"] as const;
export const bookingStep = (st: BookingStatus) => ({ pending: 0, confirmed: 1, reported: 3, paid: 3 })[st];

/** What a coach calls a payment row. */
export const PAY_LABEL: Record<PaymentRow["status"], { label: string; tone: Tone }> = {
  wait: { label: "還沒付", tone: "almost" },
  reported: { label: "學生說付好了", tone: "info" },
  paid: { label: "已收到", tone: "open" },
};
