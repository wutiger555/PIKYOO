"use server";

import { markAllRead } from "@pikyoo/core/source/notifications";
import { supabaseServer } from "./supabase";

/** Opening the notifications page reads them all (the bell's badge clears). */
export async function markAllReadAction() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getClaims();
  if (data?.claims.sub) await markAllRead(sb, data.claims.sub);
}
