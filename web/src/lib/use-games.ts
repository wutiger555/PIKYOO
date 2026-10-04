"use client";

import { useRouter } from "next/navigation";
import type { GameEdit, NewGame } from "@pikyoo/core/source/games";
import type { Game, MyGameStatus } from "@pikyoo/core/types";
import { useDemo } from "./demo-store";
import { realAuth } from "./env";
import { addGuestAction, cancelGameAction, editGameAction, hostGameAction, joinGameAction, leaveGameAction, removeParticipantAction, type Result } from "./games";

const unwrap = <T,>(r: Result<T>): T => {
  if ("error" in r) throw new Error(r.error);
  return r.ok;
};

/** 報名／取消報名 and 團主 actions: the database when realAuth (env.ts), local demo state otherwise. */
export function useGameActions() {
  const router = useRouter();
  const { setMine, addHosted, updateHosted } = useDemo();
  /** fresh seat counts and roster */
  const refresh = () => { if (realAuth) router.refresh(); };
  return {
    /** demoFull: what the screen showed, used by the demo; the database decides for real */
    async join(gameId: string, demoFull: boolean): Promise<MyGameStatus> {
      const st: MyGameStatus = realAuth ? unwrap(await joinGameAction(gameId)) : demoFull ? "wait" : "joined";
      setMine(gameId, st);
      refresh();
      return st;
    },
    /** resolves "late" when it was inside the cancel window (counts on 匹友信用) */
    async leave(gameId: string): Promise<"cancelled" | "late"> {
      const r = realAuth ? unwrap(await leaveGameAction(gameId)) : "cancelled";
      setMine(gameId, null);
      refresh();
      return r;
    },
    /** 開團: `draft` is the card the screen built; returns it with the real id */
    async host(draft: Game, n: NewGame): Promise<Game> {
      if (!realAuth) {
        addHosted(draft);
        return draft;
      }
      const g = { ...draft, id: unwrap(await hostGameAction(n)) };
      refresh();
      return g;
    },
    /** 編輯資訊: `next` is the card the screen built from the form */
    async edit(next: Game, e: GameEdit): Promise<void> {
      if (realAuth) unwrap(await editGameAction(next.id, e));
      else if (next.capacity < next.participants.length) throw new Error(`名額不能少於已報名的 ${next.participants.length} 人，要先移除參加者`);
      else updateHosted(next.id, () => next);
      refresh();
    },
    /** 代報名; "wait" when the game is full */
    async addGuest(g: Game, name: string): Promise<MyGameStatus> {
      if (realAuth) {
        const st = unwrap(await addGuestAction(g.id, name));
        refresh();
        return st;
      }
      const full = g.participants.length >= g.capacity;
      updateHosted(g.id, (x) => (full ? { ...x, waitlist: x.waitlist + 1 } : { ...x, participants: [...x.participants, { name, initial: name.slice(0, 1) }] }));
      return full ? "wait" : "joined";
    },
    /** i: index in g.participants (the demo has no row ids) */
    async remove(g: Game, i: number): Promise<void> {
      const p = g.participants[i];
      if (realAuth) {
        unwrap(await removeParticipantAction(p.id!));
        return refresh();
      }
      // the first on the waitlist moves up, as the database does
      updateHosted(g.id, (x) => {
        const rest = x.participants.filter((_, j) => j !== i);
        return x.waitlist > 0 ? { ...x, waitlist: x.waitlist - 1, participants: [...rest, { name: "候補遞補", initial: "候" }] } : { ...x, participants: rest };
      });
    },
    async cancel(gameId: string): Promise<void> {
      if (realAuth) unwrap(await cancelGameAction(gameId));
      else updateHosted(gameId, () => null);
      refresh();
    },
  };
}
