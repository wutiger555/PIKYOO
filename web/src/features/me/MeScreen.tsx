"use client";

import Link from "next/link";
import { useState } from "react";
import { LevelChip } from "@/components/pk/Badges";
import { Icon, type IconName } from "@/components/pk/Icon";
import { SoonButton, TabBar } from "@/components/pk/Shell";
import { GameTicket } from "@/components/pk/Ticket";
import { useToast } from "@/components/pk/Toast";
import { shortAreas } from "@/lib/data/courts";
import { useAllGames, useDemo } from "@/lib/demo-store";

type Tab = "joined" | "hosted" | "history";

// F8 匹友信用 v0 — only the player sees the detail; hosts see the rate. Mock numbers.
const RECORD = { played: 12, attended: 11, late: 1, noShow: 0 };

/** 我的: profile, my games (joined / waitlist / hosted), bookings, attendance record, settings. */
export function MeScreen() {
  const toast = useToast();
  const { profile, mine, hosted } = useDemo();
  const games = useAllGames();
  const [tab, setTab] = useState<Tab>(hosted.length ? "hosted" : "joined");
  const joined = games.filter((g) => mine[g.id]);
  const rate = Math.round((RECORD.attended / RECORD.played) * 100);

  const list = tab === "joined" ? joined : tab === "hosted" ? hosted : [];
  const empty: Record<Tab, [string, string, string]> = {
    joined: ["還沒報名任何一局", "/games", "找一局來打"],
    hosted: ["還沒開過團", "/games/new", "開一團"],
    history: ["打完的局會出現在這裡", "/games", "找一局來打"],
  };

  return (
    <>
      <div className="scroll">
        <div className="home-hero carbon">
          <div className="me-top">
            <span className="avatar me-avatar">{profile.name.slice(0, 1)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 24 }}>{profile.name}</h1>
              <div style={{ fontSize: 14, color: "var(--color-on-carbon-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="pin" size={14} />{shortAreas(profile.areas)}
              </div>
            </div>
            <Link className="btn btn-secondary" style={{ minHeight: 40, padding: "0 14px" }} href="/welcome">編輯</Link>
          </div>
          <div className="me-level">
            <LevelChip min={profile.level} lg />
            <Link href="/learn/level-check" className="me-link">重新自評</Link>
          </div>
          <div className="stats">
            <div><b className="num">{RECORD.played}</b><span>打過的局</span></div>
            <div><b className="num">{rate}%</b><span>出席率</span></div>
            <div><b className="num">{RECORD.late}</b><span>晚取消</span></div>
          </div>
        </div>
        <p className="fine pad" style={{ marginTop: 8 }}>出席紀錄只有你看得到；團主在名單上只會看到出席率。</p>

        <Link href="/me/lessons" className="card row-card" style={{ margin: "var(--space-4) var(--space-4) 0" }}>
          <Icon name="cal" size={22} />
          <div style={{ flex: 1 }}>
            <div className="card-title" style={{ fontSize: 16 }}>我的課</div>
            <div className="text-muted" style={{ fontSize: 13 }}>即將上課、揪團中、上過的課</div>
          </div>
          <Icon name="right" size={18} />
        </Link>

        <div className="sec">
          <div className="sec-head"><h2><span className="en">My games</span>我的球局</h2><Link href="/games">找球友打球</Link></div>
          <div className="seg" style={{ display: "flex", marginBottom: "var(--space-3)" }} role="radiogroup" aria-label="球局類型">
            {([["joined", `報名中 ${joined.length}`], ["hosted", `我開的 ${hosted.length}`], ["history", "打過的"]] as [Tab, string][]).map(([k, l]) => (
              <label key={k} className="seg-opt"><input type="radio" name="mt" checked={tab === k} onChange={() => setTab(k)} />{l}</label>
            ))}
          </div>
          {list.length ? (
            <div className="stack">{list.map((g) => <GameTicket key={g.id} game={g} />)}</div>
          ) : (
            <div className="empty-s card">
              <p className="text-muted">{empty[tab][0]}</p>
              <Link className="btn btn-secondary" href={empty[tab][1]}>{empty[tab][2]}</Link>
            </div>
          )}
        </div>

        <div className="sec" style={{ paddingBottom: "var(--space-6)" }}>
          <div className="sec-head"><h2><span className="en">Settings</span>設定</h2></div>
          <div className="card" style={{ padding: "0 var(--space-4)", gap: 0 }}>
            <Row icon="heart" label="收藏的球場與教練" msg="收藏（P1，下一輪）" />
            <Row icon="bell" label="通知設定" sub="LINE：遞補、提醒、變更" msg="通知設定（下一輪）" />
            <Row icon="msg" label="LINE 帳號" sub="已連結" msg="帳號綁定（接 LINE Login 後開放）" />
            <Link className="row-item" href="/coach">
              <Icon name="whistle" size={22} />
              <span style={{ flex: 1 }}>我是教練：教練後台</span>
              <Icon name="right" size={18} />
            </Link>
            <button className="row-item" onClick={() => toast("刪除帳號會匿名化你的資料（接上後端後開放）")}>
              <Icon name="x" size={22} />
              <span style={{ flex: 1, color: "var(--color-danger)" }}>刪除帳號</span>
            </button>
          </div>
        </div>
      </div>
      <TabBar active="me" />
    </>
  );
}

function Row({ icon, label, sub, msg }: { icon: IconName; label: string; sub?: string; msg: string }) {
  return (
    <SoonButton className="row-item" msg={msg}>
      <Icon name={icon} size={22} />
      <span style={{ flex: 1 }}>
        {label}
        {sub && <small className="text-muted" style={{ display: "block", fontSize: 13 }}>{sub}</small>}
      </span>
      <Icon name="right" size={18} />
    </SoonButton>
  );
}
