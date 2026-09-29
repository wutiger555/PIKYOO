"use client";

import Link from "next/link";
import { CourtArt } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { PkMark } from "@/components/pk/Logo";
import { SoonButton, TabBar } from "@/components/pk/Shell";
import { GameTicket } from "@/components/pk/Ticket";
import { GAMES, LESSONS, ME, NEARBY_COURTS } from "@/lib/data/games";
import { useDemo } from "@/lib/demo-store";
import { money } from "@/lib/format";

/** F7 探索首頁: carbon greeting, today's open games, beginner entry, lessons, nearby courts. */
export function HomeScreen() {
  const { mine } = useDemo();
  const today = GAMES.filter((g) => {
    const count = g.participants.length + (mine[g.id] === "joined" ? 1 : 0);
    return g.group === "today" && g.capacity - count > 0;
  });

  return (
    <>
      <div className="scroll">
        <div className="home-hero carbon">
          <div className="home-top">
            <PkMark size={30} style={{ color: "#fff" }} />
            <SoonButton className="loc" msg="切換常打區域（下一輪）">
              <Icon name="pin" size={16} />
              大安・信義・中山
              <Icon name="down" size={16} />
            </SoonButton>
          </div>
          <h1 style={{ margin: "var(--space-6) 0 0", fontSize: 30 }}>嗨，{ME.name}</h1>
          <p style={{ margin: "2px 0 0", color: "var(--color-on-carbon-muted)" }}>
            今天有 <span className="hl">{today.length} 局</span>還有位子，想打嗎？
          </p>
        </div>

        <div className="sec">
          <div className="sec-head">
            <h2><span className="en">Play today</span>今天可以打</h2>
            <Link href="/games">看全部</Link>
          </div>
          <div className="stack">
            {today.map((g) => <GameTicket key={g.id} game={g} />)}
          </div>
        </div>

        <div className="beginner">
          <div>
            <h3 style={{ margin: 0 }}>第一次打匹克球？</h3>
            <div className="flow3">
              <span>了解規則</span><Icon name="right" size={14} /><span>上體驗課</span><Icon name="right" size={14} /><span>新手局</span>
            </div>
            <SoonButton className="btn btn-secondary" style={{ minHeight: 40 }} msg="新手專區（下一輪）">從這裡開始</SoonButton>
          </div>
          <CourtArt ball />
        </div>

        <div className="sec" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="sec-head pad">
            <h2><span className="en">Lessons</span>近期課程</h2>
            <Link href="/coaches">看全部</Link>
          </div>
          <div className="hscroll">
            {LESSONS.map((l) => (
              <Link key={l.id} href={`/coaches/${l.coachId}`} className="card class-card">
                <div className="card-kicker">{l.when}</div>
                <div className="card-title">{l.title}</div>
                <div className="who">
                  <span className="avatar" style={l.avatarBg ? { background: l.avatarBg } : undefined}>{l.initial}</span>
                  <div>
                    <div className="nm">{l.coach}</div>
                    <span className="cred" style={{ fontSize: 12 }}>
                      <span className="cred-issuer">{l.issuer}</span>
                      <span className="cred-level">{l.credLevel}</span>
                    </span>
                  </div>
                </div>
                <div className="card-meta" style={{ justifyContent: "space-between" }}>
                  <span>{l.where}</span>
                  <span className="num" style={{ fontSize: 20, color: "var(--color-text)", fontWeight: 600 }}>{money(l.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="sec" style={{ paddingBottom: "var(--space-6)" }}>
          <div className="sec-head">
            <h2><span className="en">Courts</span>附近球場</h2>
            <SoonLink msg="球場列表與地圖（下一輪）">看地圖</SoonLink>
          </div>
          {NEARBY_COURTS.map((c) => (
            <SoonButton key={c.name} className="row-item court-row" msg="球場詳情（下一輪）">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div className="text-muted" style={{ fontSize: 14 }}>{c.sub}</div>
              </div>
              <span className="num text-muted">{c.distance}</span>
              <Icon name="right" size={18} />
            </SoonButton>
          ))}
        </div>
      </div>
      <TabBar active="home" />
    </>
  );
}

function SoonLink({ msg, children }: { msg: string; children: React.ReactNode }) {
  return (
    <SoonButton className="linklike" msg={msg}>
      {children}
    </SoonButton>
  );
}
