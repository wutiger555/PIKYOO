import type { SupabaseClient } from "@supabase/supabase-js";
import type { MyGameStatus } from "../types";
import type { Database } from "./db.types";

// 報名／取消 through the database rules (join_game / leave_game in init.sql): seats, waitlist and promotion live there.

/** What the database's exceptions mean to the person tapping the button. */
const MESSAGES: [RegExp, string][] = [
  [/sign in first|permission denied/, "請先登入"],
  [/game cancelled/, "這局已經取消了"],
  [/already started/, "這局已經開始，不能再報名"],
  [/level outside/, "這局限定程度，你目前的程度不在範圍內"],
  [/hosts cancel/, "團主不能取消報名，請改用「取消球局」"],
  [/not registered/, "你沒有報名這局"],
  [/not found/, "找不到這局"],
];
const explain = (message: string) => new Error(MESSAGES.find(([re]) => re.test(message))?.[1] ?? "沒有成功，請稍後再試");

/** Takes a seat if one is free, otherwise a waitlist spot. */
export async function joinGame(sb: SupabaseClient<Database>, gameId: string): Promise<MyGameStatus> {
  const r = await sb.rpc("join_game", { p_game: gameId });
  if (r.error) throw explain(r.error.message);
  return r.data === "joined" ? "joined" : "wait";
}

/** Cancels a seat or waitlist spot; inside the host's cancel window it counts as a late cancel. */
export async function leaveGame(sb: SupabaseClient<Database>, gameId: string): Promise<"cancelled" | "late"> {
  const r = await sb.rpc("leave_game", { p_game: gameId });
  if (r.error) throw explain(r.error.message);
  return r.data === "late_cancelled" ? "late" : "cancelled";
}
