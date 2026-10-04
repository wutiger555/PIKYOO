import type { SupabaseClient } from "@supabase/supabase-js";
import { contactHint } from "../contact";
import { LEVELS } from "../format";
import type { Level, Question } from "../types";
import type { Database } from "./db.types";

// 問與答 (B5, PRD F3-11): public Q&A on coach pages instead of private LINE contact.
// What each reader sees is RLS: answered questions for everyone, your own pending ones, all of yours as the coach.

type Sb = SupabaseClient<Database>;

const md = (t: string) => {
  const d = new Date(Date.parse(t) + 8 * 3600e3); // Taipei
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
};

/** Every question the reader may see; `viewer` marks their own. */
export async function readQuestions(sb: Sb, viewer?: string): Promise<Question[]> {
  const r = await sb.from("questions")
    .select("id, text, answer, answered_at, created_at, asker_id, coaches(slug), profiles!questions_asker_id_fkey(display_name, level)")
    .is("hidden_at", null).order("created_at");
  if (r.error) throw new Error(`Supabase: ${r.error.message}`);
  return r.data.map((q) => ({
    id: q.id, coachId: q.coaches?.slug ?? "", name: q.profiles?.display_name || "學生",
    // level "" when not set: the screens leave it out
    level: q.profiles?.level != null ? LEVELS[q.profiles.level as Level] : "", text: q.text, askedAt: md(q.created_at),
    answer: q.answer ? { text: q.answer, at: md(q.answered_at ?? q.created_at) } : undefined,
    mine: !!viewer && q.asker_id === viewer,
  }));
}

/** The database repeats the 留電話／LINE check (assert_no_contact); its hint names what was found. */
const explain = (e: { message: string; hint?: string; details?: string }) =>
  new Error(
    e.message === "contact_detail" ? (e.details ? contactHint(e.details) : e.hint ?? "請不要留聯絡方式")
    : /char_length|check constraint/.test(e.message) ? "問題請寫 2–300 字"
    : /permission denied|row-level security/.test(e.message) ? "請先登入"
    : /question not found/.test(e.message) ? "找不到這則提問"
    : `沒有成功，請稍後再試（${e.message}）`,
  );

/** 提問 on an approved coach's page. */
export async function askQuestion(sb: Sb, askerId: string, coachSlug: string, text: string): Promise<void> {
  const c = await sb.from("coaches").select("id").eq("slug", coachSlug).eq("status", "approved").maybeSingle();
  if (c.error) throw explain(c.error);
  if (!c.data) throw new Error("找不到這位教練");
  const r = await sb.from("questions").insert({ coach_id: c.data.id, asker_id: askerId, text: text.trim() });
  if (r.error) throw explain(r.error);
}

/** 公開回覆: only the coach the question was asked to (answer_question checks). */
export async function answerQuestion(sb: Sb, questionId: string, text: string): Promise<void> {
  const r = await sb.rpc("answer_question", { p_question: questionId, p_answer: text.trim() });
  if (r.error) throw explain(r.error);
}
