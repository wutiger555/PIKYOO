"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { ShareSheet } from "@/components/pk/ShareSheet";
import { SoonButton } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { Seats } from "@/components/pk/Ticket";
import { Status } from "@/components/pk/Badges";
import { useDemo, useGameView } from "@/lib/demo-store";
import type { Game } from "@/lib/types";

/** 報名成功 / 已加入候補: seat fills with a pop, LINE reminder, share to group, add to calendar. */
export function JoinSuccessScreen({ game: g }: { game: Game }) {
  const router = useRouter();
  const { setPopSeat } = useDemo();
  const { my, waitN } = useGameView(g);
  const [share, setShare] = useState(false);

  if (!my) {
    return (
      <div className="success dk dk-narrow">
        <TopNav active="games" />
        <div className="hero">
          <h1>還沒報名這一局</h1>
          <p className="text-muted" style={{ margin: 0 }}>回到球局詳情就可以報名。</p>
        </div>
        <div className="actions">
          <Link className="btn btn-primary btn-lg btn-block" href={`/games/${g.id}`}>看球局</Link>
        </div>
      </div>
    );
  }

  const wait = my === "wait";
  const see = g.dayLabel === "今天" ? (parseInt(g.startsAt, 10) >= 17 ? "今晚見" : "待會見") : g.dayLabel + "見";

  return (
    <div className="success dk dk-narrow">
      <TopNav active="games" />
      <div className="hero">
        {wait ? (
          <>
            <Status tone="almost" style={{ fontSize: 15 }}>候補第 {waitN} 位</Status>
            <h1>已加入候補</h1>
            <p className="text-muted" style={{ margin: 0, maxWidth: "30ch" }}>有人取消會自動幫你遞補，並用 LINE 通知你。開始前 3 小時內遞補，要在 30 分鐘內確認。</p>
          </>
        ) : (
          <>
            <Seats game={g} lg popYou />
            <h1>報名成功！{see}</h1>
            <p className="text-muted" style={{ margin: 0 }}>{g.dayLabel === "今天" ? "開始前 3 小時" : "前一天 20:00 "}會用 LINE 提醒你。</p>
          </>
        )}
      </div>
      <div className="sum">
        <span className="text-muted" style={{ fontSize: 13 }}>{g.dayLabel} {g.date}</span>
        <span className="big">{g.startsAt}–{g.endsAt}</span>
        <b>{g.venue}</b>
        <span className="text-muted">NT${g.fee}・{g.payNote}</span>
      </div>
      <div className="actions">
        <button className="btn btn-primary btn-lg btn-block" onClick={() => setShare(true)}>
          <Icon name="share" size={20} />分享到 LINE 群組
        </button>
        <SoonButton className="btn btn-secondary btn-lg btn-block" msg="已加入行事曆">
          <Icon name="calplus" size={20} />加入行事曆
        </SoonButton>
        <button
          className="btn btn-ghost btn-block"
          onClick={() => {
            if (!wait) setPopSeat(g.id);
            if (window.history.length > 1) router.back();
            else router.replace(`/games/${g.id}`);
          }}
        >
          回到球局
        </button>
      </div>
      {share && <ShareSheet game={g} onClose={() => setShare(false)} />}
    </div>
  );
}
