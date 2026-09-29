"use client";

import Link from "next/link";
import { AppBar } from "@/components/pk/Shell";
import { useDemo } from "@/lib/demo-store";
import { GameDetailScreen } from "./GameDetailScreen";

/** A game opened this session (開團) lives only in the demo store until Supabase lands. */
export function HostedGameDetail({ id }: { id: string }) {
  const { hosted } = useDemo();
  const g = hosted.find((h) => h.id === id);
  if (g) return <GameDetailScreen game={g} />;
  return (
    <>
      <AppBar title="球局" back="/games" />
      <div className="scroll">
        <div className="empty-s" style={{ paddingTop: 64 }}>
          <h3>找不到這一局</h3>
          <p className="text-muted">可能已經取消，或連結有誤。</p>
          <Link className="btn btn-primary" href="/games">看其他球局</Link>
        </div>
      </div>
    </>
  );
}
