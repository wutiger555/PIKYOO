import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentRow, PayMethod } from "../types";
import { tpeParts } from "./bookings";
import type { Database, Enums, Json } from "./db.types";

// 收款 (B5, simple first): money goes straight to the coach (LINE Pay link, bank transfer, cash).
// Confirming a booking creates the payment row (decide_booking); the student reports, the coach ticks it off.

type Sb = SupabaseClient<Database>;

/** Where students pay. Stored per method in coach_pay_details.details; a student sees only their method's entry. */
export interface PayoutDetails { line_pay?: { link: string }; bank_transfer?: { bank: string; account: string; name: string } }

const PAY: Record<Enums<"pay_method">, PayMethod> = { line_pay: "LINE Pay", bank_transfer: "銀行轉帳", cash: "現場付現" };
const STATUS: Record<Enums<"payment_status">, PaymentRow["status"]> = { waiting: "wait", reported: "reported", paid: "paid", refunded: "paid" };

const explain = (message: string) =>
  new Error(/not found/.test(message) ? "找不到這筆付款，或已經處理過了"
    : /ref_last5/.test(message) ? "末五碼請填 5 個數字"
    : /permission denied|row-level security/.test(message) ? "請先登入"
    : `沒有成功，請稍後再試（${message}）`);

/** 收款: payments for the coach's confirmed bookings, newest first, in the console row shape. */
export async function coachPayments(sb: Sb, coachId: string): Promise<PaymentRow[]> {
  const r = await sb.from("payments")
    .select("id, amount, method, status, ref_last5, reported_at, paid_at, lesson_bookings!inner(starts_at, coach_id, coach_plans(name)), profiles!payments_payer_id_fkey(display_name)")
    .eq("lesson_bookings.coach_id", coachId).order("created_at", { ascending: false }).limit(100);
  if (r.error) throw explain(r.error.message);
  return r.data.map((p) => {
    const lesson = tpeParts(p.lesson_bookings.starts_at);
    const name = p.profiles?.display_name || "學生";
    const st = STATUS[p.status];
    return {
      id: p.id, initial: name.slice(0, 1), name, what: `${p.lesson_bookings.coach_plans?.name ?? "課程"}・${lesson.date}（${lesson.weekday}）`,
      amount: p.amount, via: PAY[p.method], status: st, ref: p.ref_last5 ?? undefined,
      at: st === "paid" ? tpeParts(p.paid_at ?? Date.now()).date : st === "reported" ? `${tpeParts(p.reported_at ?? Date.now()).date} 回報` : "等學生付款",
    };
  });
}

/** 確認收到 (also for cash paid on the day, before any report). */
export const markPaid = async (sb: Sb, paymentId: string) => {
  const r = await sb.rpc("mark_payment_paid", { p_payment: paymentId });
  if (r.error) throw explain(r.error.message);
};

/** 還沒收到: the coach sends a report back to 待付款; the student is told (B6). */
export const rejectReport = async (sb: Sb, paymentId: string) => {
  const r = await sb.rpc("reject_payment_report", { p_payment: paymentId });
  if (r.error) throw explain(r.error.message);
};

/** 我已付款: last5 for a bank transfer, empty otherwise. */
export const reportPayment = async (sb: Sb, paymentId: string, last5: string) => {
  const r = await sb.rpc("report_payment", { p_payment: paymentId, p_last5: last5 });
  if (r.error) throw explain(r.error.message);
};

export async function readPayout(sb: Sb, coachId: string): Promise<PayoutDetails> {
  const r = await sb.from("coach_pay_details").select("details").eq("coach_id", coachId).maybeSingle();
  if (r.error) throw explain(r.error.message);
  return (r.data?.details ?? {}) as PayoutDetails;
}

export async function savePayout(sb: Sb, coachId: string, d: PayoutDetails): Promise<void> {
  const clean: PayoutDetails = {};
  const link = d.line_pay?.link.trim();
  if (link) {
    if (!/^https:\/\//.test(link)) throw new Error("LINE Pay 收款連結要是 https:// 開頭的網址");
    clean.line_pay = { link };
  }
  const b = d.bank_transfer;
  if (b && (b.bank.trim() || b.account.trim() || b.name.trim())) {
    if (!b.bank.trim() || !/^[\d-]{6,20}$/.test(b.account.trim()) || !b.name.trim()) throw new Error("銀行請填完整：銀行（含代碼）、帳號（數字）、戶名");
    clean.bank_transfer = { bank: b.bank.trim(), account: b.account.trim(), name: b.name.trim() };
  }
  const r = await sb.from("coach_pay_details").upsert({ coach_id: coachId, details: clean as Json, updated_at: new Date().toISOString() });
  if (r.error) throw explain(r.error.message);
}

/** The student's payment for one booking and how to pay it (payment_instructions shows only their method's details). */
export interface MyPayment { id: string; status: PaymentRow["status"]; amount: number; method: PayMethod; details: PayoutDetails[keyof PayoutDetails] | null; ref?: string }

export async function myPayment(sb: Sb, bookingId: string, payerId: string): Promise<MyPayment | null> {
  const p = await sb.from("payments").select("id, ref_last5").eq("booking_id", bookingId).eq("payer_id", payerId).maybeSingle();
  if (p.error) throw explain(p.error.message);
  if (!p.data) return null;
  const r = await sb.rpc("payment_instructions", { p_payment: p.data.id });
  if (r.error) throw explain(r.error.message);
  const x = r.data as { amount: number; method: Enums<"pay_method">; status: Enums<"payment_status">; details: Json } | null;
  if (!x) return null;
  return { id: p.data.id, status: STATUS[x.status], amount: x.amount, method: PAY[x.method], details: (x.details ?? null) as MyPayment["details"], ref: p.data.ref_last5 ?? undefined };
}
