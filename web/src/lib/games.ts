"use server";

import { joinGame, leaveGame } from "@pikyoo/core/source/games";
import { supabaseServer } from "./supabase";

// 報名／取消 for real sign-in (lib/use-games.ts calls them; the demo only changes local state).

export async function joinGameAction(gameId: string) {
  return joinGame(await supabaseServer(), gameId);
}

export async function leaveGameAction(gameId: string) {
  return leaveGame(await supabaseServer(), gameId);
}
