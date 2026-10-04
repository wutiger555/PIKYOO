"use client";

import { useRouter } from "next/navigation";
import type { MyGameStatus } from "@pikyoo/core/types";
import { useDemo } from "./demo-store";
import { realAuth } from "./env";
import { joinGameAction, leaveGameAction } from "./games";

/** 報名／取消報名: the database when realAuth (env.ts), local demo state otherwise. */
export function useGameActions() {
  const router = useRouter();
  const { setMine } = useDemo();
  return {
    /** demoFull: what the screen showed, used by the demo; the database decides for real */
    async join(gameId: string, demoFull: boolean): Promise<MyGameStatus> {
      const st: MyGameStatus = realAuth ? await joinGameAction(gameId) : demoFull ? "wait" : "joined";
      setMine(gameId, st);
      if (realAuth) router.refresh(); // fresh seat counts and roster
      return st;
    },
    /** resolves "late" when it was inside the cancel window (counts on 匹友信用) */
    async leave(gameId: string): Promise<"cancelled" | "late"> {
      const r = realAuth ? await leaveGameAction(gameId) : "cancelled";
      setMine(gameId, null);
      if (realAuth) router.refresh();
      return r;
    },
  };
}
