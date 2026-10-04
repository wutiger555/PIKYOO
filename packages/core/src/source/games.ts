import type { SupabaseClient } from "@supabase/supabase-js";
import type { DayGroup, Level, MyGameStatus } from "../types";
import type { Database } from "./db.types";
import { calendar } from "./live";

// 報名／取消 and 團主 actions through the database rules (init.sql): seats, waitlist and promotion live there.

/** What the database's exceptions mean to the person tapping the button. */
const MESSAGES: [RegExp, string][] = [
  [/sign in first|permission denied/, "請先登入"],
  [/game cancelled/, "這局已經取消了"],
  [/already started/, "這局已經開始，不能再報名"],
  [/level outside/, "這局限定程度，你目前的程度不在範圍內"],
  [/hosts cancel/, "團主不能取消報名，請改用「取消球局」"],
  [/not registered/, "你沒有報名這局"],
  [/row-level security|start time is in the past/, "開始時間已經過了，請改一個時間"],
  [/capacity below joined count \((\d+)\)/, "名額不能少於已報名的 $1 人，要先移除參加者"],
  [/only the host/, "只有團主可以這樣做"],
  [/host cannot be removed/, "團主不能移除自己，請改用「取消球局」"],
  [/not found/, "找不到這局"],
];
/** $1 in a text is filled from the pattern's first group. */
const explain = (message: string) => {
  for (const [re, text] of MESSAGES) {
    const m = message.match(re);
    if (m) return new Error(text.replace("$1", m[1] ?? ""));
  }
  return new Error("沒有成功，請稍後再試");
};

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

/** 開團 form, as the screen fills it in. court: courts.slug, or undefined with `venue` typed in. */
export interface NewGame {
  group: DayGroup; start: string; end: string; court?: string; venue: string;
  levelMin: Level; levelMax: Level; capacity: number; hostCounts: boolean;
  fee: number; feeNote: string; cancelHours: number; beginner: boolean; notes: string; sourceText?: string;
}
export type GameEdit = Omit<NewGame, "hostCounts" | "sourceText">;

/** 開團 and 編輯 share these columns; host_counts and source_text are set once, at 開團. */
async function columns(sb: SupabaseClient<Database>, n: GameEdit) {
  const cal = calendar(Date.now());
  const court = n.court ? (await sb.from("courts").select("id, address, district").eq("slug", n.court).single()).data : null;
  return {
    court_id: court?.id ?? null, location_text: court ? "" : n.venue.trim(),
    address: court?.address ?? n.venue.trim(), district: court?.district ?? "",
    starts_at: cal.isoAt(n.group, n.start), ends_at: cal.isoAt(n.group, n.end),
    level_min: n.levelMin, level_max: n.levelMax, capacity: n.capacity,
    fee: n.fee, fee_note: n.feeNote, cancel_hours: n.cancelHours, beginner_friendly: n.beginner, notes: n.notes.trim(),
  };
}

/** Creates the game (RLS: host = me, starts in the future); a trigger seats the host when hostCounts. Returns its id. */
export async function hostGame(sb: SupabaseClient<Database>, hostId: string, n: NewGame): Promise<string> {
  const r = await sb.from("games").insert({
    ...(await columns(sb, n)), host_id: hostId, host_counts: n.hostCounts, source_text: n.sourceText || null,
  }).select("id").single();
  if (r.error) throw explain(r.error.message);
  return r.data.id;
}

/** 編輯資訊 (F2-10). The database tells everyone signed up when the time, place or fee changes,
 *  and moves the waitlist up when there are more seats. */
export async function editGame(sb: SupabaseClient<Database>, gameId: string, n: GameEdit): Promise<void> {
  const r = await sb.from("games").update(await columns(sb, n)).eq("id", gameId).select("id");
  if (r.error) throw explain(r.error.message);
  if (!r.data.length) throw explain("only the host"); // RLS hides other people's games from update
}

/** 代報名: someone who isn't on PIKYOO; goes to the waitlist when the game is full. */
export async function addGuest(sb: SupabaseClient<Database>, gameId: string, name: string): Promise<MyGameStatus> {
  const r = await sb.rpc("host_add_guest", { p_game: gameId, p_name: name });
  if (r.error) throw explain(r.error.message);
  return r.data === "joined" ? "joined" : "wait";
}

/** The person is told (if a member) and the first on the waitlist moves up. */
export async function removeParticipant(sb: SupabaseClient<Database>, participantId: string): Promise<void> {
  const r = await sb.rpc("host_remove_participant", { p_participant: participantId });
  if (r.error) throw explain(r.error.message);
}

/** Everyone signed up is told. */
export async function cancelGame(sb: SupabaseClient<Database>, gameId: string): Promise<void> {
  const r = await sb.rpc("cancel_game", { p_game: gameId });
  if (r.error) throw explain(r.error.message);
}
