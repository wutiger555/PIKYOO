"use client";

import Link from "next/link";
import { useState } from "react";
import { CourtArt, LevelChip } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { Crumbs } from "@/components/pk/Crumbs";
import { AppBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { GameTicket } from "@/components/pk/Ticket";
import { useAllGames, useCoaches, useDemo } from "@/lib/demo-store";
import { money } from "@pikyoo/core/format";
import { CoachCard } from "../coaches/CoachCard";

const RULES = [
  { t: "下手發球，對角發", d: "發球時球拍在腰部以下、由下往上擊球，發到對角的發球區。只有發球方可以得分。" },
  { t: "雙彈跳規則", d: "發球後，接發球方和發球方各要讓球先落地一次，第三拍開始才可以不落地截擊。" },
  { t: "廚房區不能截擊", d: "網前 2.13 公尺的「廚房區」（非截擊區）裡，不能在球落地前擊球。球落地後就可以進去打。" },
  { t: "11 分制，贏 2 分", d: "一般打到 11 分，且要領先 2 分才算贏。雙打報分是三個數字：我方分數、對方分數、發球員順序。" },
];

/** F3-1 新手專區: 了解規則 → 上體驗課 → 參加新手友善局, plus the entry to the level self-check. */
export function LearnScreen() {
  const { profile } = useDemo();
  const [open, setOpen] = useState<number | null>(0);
  const beginnerGames = useAllGames().filter((g) => g.beginnerFriendly);
  const trialCoaches = useCoaches().filter((c) => c.beginnerFriendly);

  return (
    <>
      <AppBar title="新手指南" back="/" historyBack />
      <div className="scroll dk dk-narrow">
        <TopNav active="learn" />
        <Crumbs items={[["首頁", "/"], ["第一次打"]]} />
        <div className="home-hero carbon learn-hero" style={{ marginTop: "var(--space-3)" }}>
          <span className="en">Start here</span>
          <h1 style={{ margin: 0, fontSize: 28 }}>第一次打匹克球？</h1>
          <p style={{ margin: "4px 0 var(--space-4)", color: "var(--color-on-carbon-muted)" }}>三步就能上場：看懂規則、上一堂體驗課、找一局新手友善局。</p>
          <ol className="learn-steps">
            <li><a href="#rules"><b className="num">1</b>了解規則</a></li>
            <li><a href="#trial"><b className="num">2</b>上體驗課</a></li>
            <li><a href="#games"><b className="num">3</b>新手局</a></li>
          </ol>
        </div>

        <Link href="/learn/level-check" className="card level-cta">
          <div style={{ flex: 1 }}>
            <div className="card-title">不確定自己的程度？</div>
            <p className="card-body">6 題，3 分鐘，告訴你適合上什麼課、打哪種局。</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <LevelChip min={profile.level} />
            <span className="linklike" style={{ fontSize: 14 }}>開始自評</span>
          </div>
        </Link>

        <div className="sec" id="rules">
          <div className="sec-head"><h2><span className="en">Step 1・Rules</span>四個規則就夠了</h2></div>
          <div className="rules">
            {RULES.map((r, i) => (
              <div key={r.t} className="rule">
                <button className="rule-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  <span className="num rule-n">{i + 1}</span>
                  <span style={{ flex: 1 }}>{r.t}</span>
                  <Icon name="down" size={18} />
                </button>
                {open === i && <p className="rule-a">{r.d}</p>}
              </div>
            ))}
          </div>
          <CourtArt ball className="rules-court" />
        </div>

        <div className="sec" id="trial">
          <div className="sec-head">
            <h2><span className="en">Step 2・First lesson</span>上一堂體驗課</h2>
            <Link href="/coaches">所有教練</Link>
          </div>
          <p className="text-muted" style={{ margin: "-4px 0 var(--space-3)", fontSize: 15 }}>
            新手友善教練，{money(Math.min(...trialCoaches.map((c) => c.priceFrom)))} 起。
          </p>
          <div className="stack">{trialCoaches.map((c) => <CoachCard key={c.id} coach={c} />)}</div>
        </div>

        <div className="sec" id="games" style={{ paddingBottom: "var(--space-6)" }}>
          <div className="sec-head">
            <h2><span className="en">Step 3・Play</span>新手友善局</h2>
            <Link href="/games">看全部</Link>
          </div>
          <div className="stack">{beginnerGames.map((g) => <GameTicket key={g.id} game={g} />)}</div>
        </div>
      </div>
    </>
  );
}
