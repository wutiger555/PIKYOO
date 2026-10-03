"use server";

import { saveMe } from "@pikyoo/core/source/me";
import type { Profile } from "@pikyoo/core/types";
import { supabaseAdmin, supabaseServer } from "./supabase";

// Account actions for real sign-in (lib/use-account.ts calls them; the demo toggle never does).

async function signedIn() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getClaims();
  const id = data?.claims.sub;
  if (!id) throw new Error("請先登入");
  return { sb, id };
}

export async function signOutAction() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
}

export async function saveProfileAction(p: Profile) {
  const { sb, id } = await signedIn();
  await saveMe(sb, id, { name: String(p.name), level: p.level, areas: p.areas.map(String) });
}

/** F1-5: anonymise (delete_my_account), end the session, then ban the auth user so its old session can't come back. */
export async function deleteAccountAction() {
  const { sb, id } = await signedIn();
  const r = await sb.rpc("delete_my_account");
  if (r.error) throw new Error(r.error.message);
  await sb.auth.signOut({ scope: "global" });
  const ban = await supabaseAdmin().auth.admin.updateUserById(id, { ban_duration: "876000h" });
  if (ban.error) throw ban.error;
}
