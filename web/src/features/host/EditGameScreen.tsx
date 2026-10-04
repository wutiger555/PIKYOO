"use client";

import Link from "next/link";
import { AppBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { useHostedGames } from "@/lib/demo-store";
import { HostScreen } from "./HostScreen";

/** F2-10 編輯資訊: only the host gets the form (games I host come from the catalog, or this session's demo 開團). */
export function EditGameScreen({ id }: { id: string }) {
  const mine = useHostedGames().find((h) => h.id === id);
  if (mine) return <HostScreen editing={mine} />;
  return (
    <>
      <AppBar title="編輯球局" back={`/games/${id}`} />
      <div className="scroll dk dk-narrow">
        <TopNav active="games" />
        <div className="empty-s" style={{ paddingTop: 64 }}>
          <h3>只有團主可以編輯這一局</h3>
          <p className="text-muted">可能已經取消，或你不是這局的團主。</p>
          <Link className="btn btn-primary" href={`/games/${id}`}>回到球局</Link>
        </div>
      </div>
    </>
  );
}
