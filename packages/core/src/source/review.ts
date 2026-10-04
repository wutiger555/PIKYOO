import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db.types";

// 審核 queue for PIKYOO admins (B4): coach pages waiting for approval and certificates waiting to be checked.
// RLS lets admins read every coach and credential; review_coach / review_credential do the transitions.

export interface CoachToReview { id: string; slug: string; name: string; tagline: string; areas: string[]; photoCount: number; planCount: number; submittedAt: string }
export interface CredentialToReview {
  id: string; coachName: string; coachSlug: string; issuer: string; level: string; createdAt: string;
  /** a short-lived link to the private scan, or null when none was attached */
  fileUrl: string | null; isPdf: boolean;
}

const MESSAGES: [RegExp, string][] = [
  [/admins only|permission denied/, "只有 PIKYOO 管理員可以審核"],
  [/not waiting for review/, "這筆已經審核過了"],
  [/not found/, "找不到這筆資料"],
];
const explain = (message: string) => new Error(MESSAGES.find(([re]) => re.test(message))?.[1] ?? `沒有成功（${message}）`);

export async function reviewQueue(sb: SupabaseClient<Database>): Promise<{ coaches: CoachToReview[]; credentials: CredentialToReview[] }> {
  const [coaches, creds] = await Promise.all([
    sb.from("coach_cards").select("id, slug, name, tagline, areas, photos, updated_at").eq("status", "pending").order("updated_at"),
    sb.from("credentials").select("id, issuer, level, document_path, created_at, coaches(name, slug)").eq("status", "pending").order("created_at"),
  ]);
  if (coaches.error) throw explain(coaches.error.message);
  if (creds.error) throw explain(creds.error.message);
  const ids = coaches.data.map((c) => c.id!);
  const plans = ids.length ? await sb.from("coach_plans").select("coach_id").in("coach_id", ids).is("archived_at", null) : { data: [], error: null };
  if (plans.error) throw explain(plans.error.message);
  // scans live in a private bucket: hand out links that expire in an hour
  const paths = creds.data.flatMap((c) => (c.document_path ? [c.document_path] : []));
  const signed = paths.length ? await sb.storage.from("credentials").createSignedUrls(paths, 3600) : { data: [], error: null };
  if (signed.error) throw explain(signed.error.message);
  const urlOf = new Map((signed.data ?? []).flatMap((s) => (s.path && s.signedUrl ? [[s.path, s.signedUrl] as const] : [])));
  return {
    coaches: coaches.data.map((c) => ({
      id: c.id!, slug: c.slug!, name: c.name!, tagline: c.tagline ?? "", areas: c.areas ?? [],
      photoCount: Array.isArray(c.photos) ? c.photos.length : 0, planCount: plans.data.filter((p) => p.coach_id === c.id).length,
      submittedAt: c.updated_at!,
    })),
    credentials: creds.data.map((c) => ({
      id: c.id, coachName: c.coaches?.name ?? "", coachSlug: c.coaches?.slug ?? "", issuer: c.issuer, level: c.level, createdAt: c.created_at,
      fileUrl: c.document_path ? urlOf.get(c.document_path) ?? null : null, isPdf: !!c.document_path?.endsWith(".pdf"),
    })),
  };
}

export async function reviewCoach(sb: SupabaseClient<Database>, coachId: string, approve: boolean, note = ""): Promise<void> {
  const r = await sb.rpc("review_coach", { p_coach: coachId, p_approve: approve, p_note: note });
  if (r.error) throw explain(r.error.message);
}

export async function reviewCredential(sb: SupabaseClient<Database>, credentialId: string, verified: boolean): Promise<void> {
  const r = await sb.rpc("review_credential", { p_credential: credentialId, p_verified: verified });
  if (r.error) throw explain(r.error.message);
}
