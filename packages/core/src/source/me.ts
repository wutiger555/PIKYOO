import type { SupabaseClient } from "@supabase/supabase-js";
import type { Level, Profile } from "../types";
import type { Database } from "./db.types";

/** The signed-in person as the screens see them. `onboarded` is false until 首次登入設定 is saved (or skipped). */
export interface Me { id: string; profile: Profile; onboarded: boolean; /** PIKYOO staff: 審核 and other admin pages */ isAdmin: boolean }

/** Reads the signed-in user's own rows (RLS: profile_private is readable by its owner only). */
export async function readMe(sb: SupabaseClient<Database>, id: string): Promise<Me | null> {
  const [pub, priv] = await Promise.all([
    sb.from("profiles").select("display_name, level, deleted_at").eq("id", id).maybeSingle(),
    sb.from("profile_private").select("home_districts, onboarded_at, is_admin").eq("id", id).maybeSingle(),
  ]);
  if (pub.error) throw new Error(`Supabase: ${pub.error.message}`);
  if (priv.error) throw new Error(`Supabase: ${priv.error.message}`);
  if (!pub.data || pub.data.deleted_at) return null;
  return {
    id,
    profile: { name: pub.data.display_name, level: (pub.data.level ?? 0) as Level, areas: priv.data?.home_districts ?? [] },
    onboarded: !!priv.data?.onboarded_at,
    isAdmin: !!priv.data?.is_admin,
  };
}

/** Saves 首次登入設定 / 編輯個人資料. Only the columns the API roles may update (see the grants in init.sql). */
export async function saveMe(sb: SupabaseClient<Database>, id: string, p: Profile): Promise<void> {
  const [a, b] = await Promise.all([
    sb.from("profiles").update({ display_name: p.name.trim().slice(0, 30), level: p.level }).eq("id", id),
    sb.from("profile_private").update({ home_districts: p.areas, onboarded_at: new Date().toISOString() }).eq("id", id),
  ]);
  if (a.error) throw new Error(`Supabase: ${a.error.message}`);
  if (b.error) throw new Error(`Supabase: ${b.error.message}`);
}
