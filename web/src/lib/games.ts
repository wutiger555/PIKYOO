"use server";

import { addGuest, cancelGame, editGame, hostGame, joinGame, leaveGame, removeParticipant, type GameEdit, type NewGame } from "@pikyoo/core/source/games";
import { getMe, supabaseServer } from "./supabase";

// 報名／取消 and 團主 actions for real sign-in (lib/use-games.ts calls them; the demo only changes local state).
// Production hides the message of an error thrown here, so the reason comes back as a value (use-games.ts rethrows it).

export type Result<T> = { ok: T } | { error: string };
const run = async <T,>(f: () => Promise<T>): Promise<Result<T>> => {
  try {
    return { ok: await f() };
  } catch (e) {
    return { error: (e as Error).message };
  }
};

export async function joinGameAction(gameId: string) {
  return run(async () => joinGame(await supabaseServer(), gameId));
}

export async function leaveGameAction(gameId: string) {
  return run(async () => leaveGame(await supabaseServer(), gameId));
}

export async function hostGameAction(game: NewGame) {
  return run(async () => {
    const me = await getMe();
    if (!me) throw new Error("請先登入");
    return hostGame(await supabaseServer(), me.id, game);
  });
}

export async function editGameAction(gameId: string, edit: GameEdit) {
  return run(async () => editGame(await supabaseServer(), gameId, edit));
}

export async function addGuestAction(gameId: string, name: string) {
  return run(async () => addGuest(await supabaseServer(), gameId, name));
}

export async function removeParticipantAction(participantId: string) {
  return run(async () => removeParticipant(await supabaseServer(), participantId));
}

export async function cancelGameAction(gameId: string) {
  return run(async () => cancelGame(await supabaseServer(), gameId));
}
