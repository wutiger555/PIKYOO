import type { SupabaseClient } from "@supabase/supabase-js";
import { BOOKING_DAYS, slotsFor } from "../data/coaches";
import { LEVELS } from "../format";
import type { Booking, BookingDay, BookingRequest, Coach, Level, PayMethod, Slot, Weekday } from "../types";
import { PAY_DB } from "./coach-rows";
import type { Database, Enums } from "./db.types";

// 預約上課 (B5, simple first): 選方案與時段 → 送出 → 教練確認／婉拒 → 學生看到結果、可以取消.
// Seats, the 48-hour window and who may decide live in the database (request_booking, decide_booking, …).

type Sb = SupabaseClient<Database>;

/** The bookable days and, per plan and day, the open sessions with seats left. */
export interface BookingCalendar { days: BookingDay[]; slots: Record<string, Slot[]> }
export const slotKey = (planId: string, dayKey: string) => `${planId}|${dayKey}`;

/** The demo's fixed week and mock seats (every plan shares them). */
export function demoCalendar(c: Coach): BookingCalendar {
  const slots: BookingCalendar["slots"] = {};
  for (const pl of c.profile.plans) for (const d of BOOKING_DAYS) slots[slotKey(pl.id, d.key)] = slotsFor(c, d);
  return { days: BOOKING_DAYS, slots };
}

const WD: Weekday[] = ["日", "一", "二", "三", "四", "五", "六"];
/** Taipei calendar parts of an instant (UTC+8 all year). Day keys are YYYY-MM-DD. */
export function tpeParts(t: string | number | Date) {
  const d = new Date(new Date(t).getTime() + 8 * 3600e3);
  const iso = d.toISOString();
  return { key: iso.slice(0, 10), date: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`, weekday: WD[d.getUTCDay()], hhmm: iso.slice(11, 16) };
}

/** The coach's real week: the next `days` days from today (Taipei), sessions from open_sessions(). */
export async function liveCalendar(sb: Sb, coachSlug: string, days = 7): Promise<BookingCalendar> {
  const r = await sb.rpc("open_sessions", { p_coach_slug: coachSlug, p_days: days });
  if (r.error) throw new Error(`Supabase: ${r.error.message}`);
  const now = Date.now();
  const list: BookingDay[] = Array.from({ length: days }, (_, n) => {
    const p = tpeParts(now + n * 864e5);
    return { key: p.key, weekday: p.weekday, date: p.date };
  });
  const slots: BookingCalendar["slots"] = {};
  for (const s of r.data) {
    const p = tpeParts(s.starts_at);
    (slots[slotKey(s.plan_key, p.key)] ??= []).push([p.hhmm, s.seats_left]);
  }
  return { days: list, slots };
}

const MESSAGES: [RegExp, string][] = [
  [/sign in first|permission denied/, "請先登入"],
  [/not enough seats/, "這個時段的名額剛好被訂走了，換一個時段試試"],
  [/session already started/, "這個時段已經開始了"],
  [/no session at that time/, "教練這個時間沒有開課"],
  [/not bookable/, "這位教練目前還不能預約"],
  [/book themselves/, "不能預約自己的課"],
  [/payment method/, "教練不收這種付款方式"],
  [/no longer pending/, "這筆預約已經過了確認期限"],
  [/already closed/, "這筆預約已經結束了"],
  [/not your booking/, "找不到這筆預約"],
  [/plan not found/, "這個課程方案已經下架了"],
];
const explain = (message: string) => new Error(MESSAGES.find(([re]) => re.test(message))?.[1] ?? `沒有成功，請稍後再試（${message}）`);

/** 送出預約. b.coachId is the coach slug and b.planId the plan key, as on screen; b.dayKey is YYYY-MM-DD. */
export async function requestBooking(sb: Sb, b: Booking): Promise<string> {
  if (!b.slot) throw new Error("請先選時段");
  const plan = await sb.from("coach_plans").select("id, coaches!inner(slug)").eq("coaches.slug", b.coachId).eq("key", b.planId).is("archived_at", null).maybeSingle();
  if (plan.error) throw explain(plan.error.message);
  if (!plan.data) throw explain("plan not found");
  const r = await sb.rpc("request_booking", {
    p_plan: plan.data.id, p_starts_at: `${b.dayKey}T${b.slot}:00+08:00`, p_headcount: b.headcount, p_note: b.note, p_pay: PAY_DB[b.pay],
  });
  if (r.error) throw explain(r.error.message);
  return r.data;
}

export const decideBooking = async (sb: Sb, bookingId: string, accept: boolean) => {
  const r = await sb.rpc("decide_booking", { p_booking: bookingId, p_accept: accept });
  if (r.error) throw explain(r.error.message);
};

export const cancelBooking = async (sb: Sb, bookingId: string) => {
  const r = await sb.rpc("cancel_booking", { p_booking: bookingId });
  if (r.error) throw explain(r.error.message);
};

const PAY: Record<Enums<"pay_method">, PayMethod> = { line_pay: "LINE Pay", bank_transfer: "銀行轉帳", cash: "現場付現" };

/** Where a booking stands for the student. A pending request past its window is 已逾時 even before expire_stale(). */
export type MyBookingState = "pending" | "confirmed" | "declined" | "expired" | "cancelled" | "done";
export interface MyBooking { id: string; state: MyBookingState; booking: Booking; day: BookingDay; coachName: string; planName: string; amount: number }

export async function myBookings(sb: Sb, studentId: string): Promise<MyBooking[]> {
  const r = await sb.from("lesson_bookings")
    .select("id, status, starts_at, expires_at, headcount, note, pay_method, amount, coach_plans(key, name), coaches(slug, name)")
    .eq("student_id", studentId).is("group_id", null).order("starts_at", { ascending: false }).limit(50);
  if (r.error) throw explain(r.error.message);
  const now = Date.now();
  return r.data.map((x) => {
    const p = tpeParts(x.starts_at);
    const past = Date.parse(x.starts_at) <= now;
    const state: MyBookingState =
      x.status === "pending" ? (Date.parse(x.expires_at) <= now || past ? "expired" : "pending")
      : x.status === "confirmed" ? (past ? "done" : "confirmed")
      : x.status === "attended" || x.status === "no_show" ? "done"
      : x.status;
    return {
      id: x.id, state, coachName: x.coaches?.name ?? "", planName: x.coach_plans?.name ?? "", amount: x.amount,
      day: { key: p.key, weekday: p.weekday, date: p.date },
      booking: {
        coachId: x.coaches?.slug ?? "", planId: x.coach_plans?.key ?? "", dayKey: p.key, slot: p.hhmm, headcount: x.headcount, note: x.note,
        pay: PAY[x.pay_method], status: x.status === "confirmed" ? "confirmed" : "pending",
      },
    };
  });
}

/** 今天: requests waiting for this coach, in the shape the console cards already use. */
export async function coachRequests(sb: Sb, coachId: string): Promise<BookingRequest[]> {
  const now = new Date();
  const r = await sb.from("lesson_bookings")
    .select("id, student_id, starts_at, expires_at, headcount, note, pay_method, amount, coach_plans(name, unit), profiles!lesson_bookings_student_id_fkey(display_name, level)")
    .eq("coach_id", coachId).eq("status", "pending").gt("expires_at", now.toISOString()).is("group_id", null).order("expires_at");
  if (r.error) throw explain(r.error.message);
  const students = [...new Set(r.data.map((x) => x.student_id))];
  const past = students.length
    ? await sb.from("lesson_bookings").select("student_id").eq("coach_id", coachId).in("student_id", students).in("status", ["confirmed", "attended"]).lt("starts_at", now.toISOString())
    : { data: [], error: null };
  if (past.error) throw explain(past.error.message);
  return r.data.map((x): BookingRequest => {
    const p = tpeParts(x.starts_at);
    const name = x.profiles?.display_name || "學生";
    const times = past.data.filter((y) => y.student_id === x.student_id).length;
    const plan = x.coach_plans;
    return {
      id: x.id, initial: name.slice(0, 1), name, level: x.profiles?.level != null ? LEVELS[x.profiles.level as Level] : "未填程度",
      firstTime: times === 0, times, when: `${p.date}（${p.weekday}）${p.hhmm}`,
      plan: plan ? `${plan.name}${plan.unit === "per_person" ? ` ×${x.headcount}` : ""}` : "", amount: x.amount, note: x.note,
      expiresIn: `${Math.max(1, Math.ceil((Date.parse(x.expires_at) - now.getTime()) / 3600e3))} 小時`, pay: PAY[x.pay_method], status: "pending",
    };
  });
}
