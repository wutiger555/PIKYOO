import type { SupabaseClient } from "@supabase/supabase-js";
import { tpeParts } from "./time";
import type { Database } from "./db.types";

// 課後筆記 (2026-10-14 interview). The coach writes after a lesson; a shared note is the student's too.
// Who may write and read lives in the database (write_lesson_note, lesson_notes RLS).

type Sb = SupabaseClient<Database>;
export interface LessonNote { id: string; body: string; shared: boolean; at: string }
/** A lesson that has happened, for the coach's 上過的課 list. */
export interface PastLesson { id: string; student: string; plan: string; date: string; weekday: string; slot: string; notes: LessonNote[] }

const MESSAGES: [RegExp, string][] = [
  [/contact_detail/, "筆記裡不能留電話、LINE 或 IG，聯絡都在 PIKYOO 裡進行"],
  [/not started/, "這堂課還沒開始，上完再寫"],
  [/note is empty/, "先寫點內容"],
  [/sign in|permission denied/, "請先登入"],
];
const explain = (m: string) => new Error(MESSAGES.find(([re]) => re.test(m))?.[1] ?? `沒有成功，請稍後再試（${m}）`);
const at = (t: string) => { const p = tpeParts(t); return `${p.date}（${p.weekday}）`; };

/** The notes a student can read, by booking id. */
export async function sharedNotes(sb: Sb, bookingIds: string[]): Promise<Record<string, LessonNote[]>> {
  if (!bookingIds.length) return {};
  const r = await sb.from("lesson_notes").select("id, booking_id, body, shared, created_at").in("booking_id", bookingIds).eq("shared", true).order("created_at");
  if (r.error) throw explain(r.error.message);
  const out: Record<string, LessonNote[]> = {};
  for (const n of r.data) (out[n.booking_id] ??= []).push({ id: n.id, body: n.body, shared: true, at: at(n.created_at) });
  return out;
}

/** The coach's lessons from the last `days` days that have started, newest first, with their notes. */
export async function pastLessons(sb: Sb, coachId: string, days = 14): Promise<PastLesson[]> {
  const now = Date.now();
  const r = await sb.from("lesson_bookings")
    .select("id, starts_at, coach_plans(name), profiles!lesson_bookings_student_id_fkey(display_name), lesson_notes(id, body, shared, created_at)")
    .eq("coach_id", coachId).in("status", ["confirmed", "attended", "no_show"])
    .lte("starts_at", new Date(now).toISOString()).gte("starts_at", new Date(now - days * 864e5).toISOString())
    .order("starts_at", { ascending: false }).limit(30);
  if (r.error) throw explain(r.error.message);
  return r.data.map((x) => {
    const p = tpeParts(x.starts_at);
    return {
      id: x.id, student: x.profiles?.display_name || "學生", plan: x.coach_plans?.name ?? "", date: p.date, weekday: p.weekday, slot: p.hhmm,
      notes: x.lesson_notes.map((n) => ({ id: n.id, body: n.body, shared: n.shared, at: at(n.created_at) })),
    };
  });
}

export async function writeNote(sb: Sb, bookingId: string, body: string, shared: boolean, noteId?: string): Promise<string> {
  const r = await sb.rpc("write_lesson_note", { p_booking: bookingId, p_body: body, p_shared: shared, ...(noteId ? { p_note: noteId } : {}) });
  if (r.error) throw explain(r.error.message);
  return r.data;
}

export async function deleteNote(sb: Sb, noteId: string): Promise<void> {
  const r = await sb.rpc("delete_lesson_note", { p_note: noteId });
  if (r.error) throw explain(r.error.message);
}
