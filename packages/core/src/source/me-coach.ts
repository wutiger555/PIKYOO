import type { SupabaseClient } from "@supabase/supabase-js";
import type { Coach } from "../types";
import { coachColumns, planRow } from "./coach-rows";
import type { Database, Enums } from "./db.types";
import { coachFromRows, type CoachCard } from "./live";

// A signed-in coach's own page: apply (draft) → edit and save → submit for review (pending) → PIKYOO approves.
// RLS lets the owner read and edit their row at any status; coaches_guard keeps status and approval for PIKYOO.

export type CoachStatus = Enums<"coach_status">;
/** id: the coaches row (uuid); coach.id is the slug, as everywhere on screen */
export interface MyCoach { id: string; status: CoachStatus; coach: Coach }

const MESSAGES: [RegExp, string][] = [
  [/coaches_slug_key|duplicate key.*slug/, "這個網址已經有人用了，換一個試試"],
  [/coaches_profile_id_key/, "你已經申請過教練了"],
  [/slug_check|coaches_slug_check/, "網址只能用小寫英文、數字和 -，2–30 個字"],
  [/status is set by PIKYOO/, "教練頁的狀態由 PIKYOO 審核後設定"],
  [/permission denied|row-level security/, "請先登入"],
];
const explain = (message: string) => new Error(MESSAGES.find(([re]) => re.test(message))?.[1] ?? `沒有成功，請稍後再試（${message}）`);

export async function readMyCoach(sb: SupabaseClient<Database>, url: string, profileId: string): Promise<MyCoach | null> {
  const card = await sb.from("coach_cards").select("*").eq("profile_id", profileId).maybeSingle();
  if (card.error) throw explain(card.error.message);
  if (!card.data) return null;
  const id = card.data.id!;
  const [creds, plans] = await Promise.all([
    sb.from("credentials").select("*").eq("coach_id", id).order("created_at"),
    sb.from("coach_plans").select("*").eq("coach_id", id).is("archived_at", null).order("sort"),
  ]);
  if (creds.error) throw explain(creds.error.message);
  if (plans.error) throw explain(plans.error.message);
  return { id, status: card.data.status!, coach: coachFromRows(url, card.data as CoachCard, creds.data, plans.data) };
}

/** 申請成為教練: a draft page with a slug (the public link) and a display name. */
export async function applyCoach(sb: SupabaseClient<Database>, profileId: string, slug: string, name: string): Promise<void> {
  const r = await sb.from("coaches").insert({ profile_id: profileId, slug: slug.trim().toLowerCase(), name: name.trim() });
  if (r.error) throw explain(r.error.message);
}

/** Saves the page and its plans. Plans dropped in the editor are archived, not deleted: bookings point at them. */
export async function saveMyCoach(sb: SupabaseClient<Database>, url: string, id: string, coach: Coach): Promise<void> {
  const r = await sb.from("coaches").update(coachColumns(coach, url)).eq("id", id);
  if (r.error) throw explain(r.error.message);
  const plans = coach.profile.plans;
  if (plans.length) {
    const up = await sb.from("coach_plans").upsert(plans.map((pl, i) => ({ coach_id: id, ...planRow(pl, i) })), { onConflict: "coach_id,key" });
    if (up.error) throw explain(up.error.message);
  }
  const keep = plans.map((pl) => pl.id);
  let gone = sb.from("coach_plans").update({ archived_at: new Date().toISOString() }).eq("coach_id", id).is("archived_at", null);
  if (keep.length) gone = gone.not("key", "in", `(${keep.map((k) => `"${k}"`).join(",")})`);
  const g = await gone;
  if (g.error) throw explain(g.error.message);
}

/** 送出審核: draft → pending. PIKYOO checks the page and credentials, then approves. */
export async function submitMyCoach(sb: SupabaseClient<Database>, id: string): Promise<void> {
  const r = await sb.from("coaches").update({ status: "pending" }).eq("id", id).eq("status", "draft");
  if (r.error) throw explain(r.error.message);
}
