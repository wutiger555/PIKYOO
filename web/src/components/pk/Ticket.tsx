"use client";

import Link from "next/link";
import { useGameView } from "@/lib/demo-store";
import type { Game } from "@pikyoo/core/types";
import { LevelChip, Sprout, Status } from "./Badges";

/** 座位列: taken seats are avatars (host ringed), open seats are empty ball holes, "你" is optic. Always states 缺 N. */
export function Seats({ game, lg, popYou }: { game: Game; lg?: boolean; popYou?: boolean }) {
  const { my, spots, waitN } = useGameView(game);
  const label = spots > 0 ? spots <= 2 ? <span className="hl">缺 {spots}</span> : `缺 ${spots}` : "額滿";
  return (
    <div className={`seats${lg ? " seats-lg" : ""}`}>
      <div className="seat-row">
        {game.participants.map((p, i) => (
          <span key={i} className={`seat${i === 0 ? " host" : ""}`}>{p.initial}</span>
        ))}
        {my === "joined" && <span className={`seat you${popYou ? " pop" : ""}`}>你</span>}
        {Array.from({ length: Math.max(0, spots) }, (_, i) => (
          <span key={"o" + i} className="seat open" />
        ))}
        {waitN > 0 && <span className="seat wait">候補 {waitN}</span>}
      </div>
      <span className="seats-label">{label}</span>
    </div>
  );
}

export function GameStatus({ game }: { game: Game }) {
  const { spots } = useGameView(game);
  if (spots <= 0) return <Status tone="full">額滿可候補</Status>;
  if (spots === 1 || spots <= game.capacity / 4) return <Status tone="almost">快額滿</Status>;
  return null;
}

/** 球局票卡: carbon stub with the start time, ball-hole perforation, venue/level/fee/seats on the right. */
export function GameTicket({ game: g, lg }: { game: Game; lg?: boolean }) {
  const { my, spots } = useGameView(g);
  const cls = `ticket${lg ? " ticket-lg" : ""}${spots <= 0 ? " is-full" : ""}`;
  const body = (
    <>
      <div className="ticket-stub">
        <span className="ticket-day">
          {g.dayLabel === "今天" ? <span className="hl">今天</span> : g.dayLabel} {g.date}
        </span>
        <span className="ticket-time">{g.startsAt}</span>
        <span className="ticket-end">–{g.endsAt}</span>
      </div>
      <div className="ticket-body">
        <div>
          <div className="ticket-venue">{g.venue}</div>
          <div className="ticket-where">{g.district}・{g.courtKind}</div>
        </div>
        <div className="ticket-tags">
          <LevelChip min={g.levelMin} max={g.levelMax} />
          {g.beginnerFriendly && <Sprout />}
          <GameStatus game={g} />
          {!lg && (
            <span className="ticket-fee"><small>每人</small>NT${g.fee}</span>
          )}
        </div>
        {!lg && (
          <div className="ticket-foot">
            <Seats game={g} />
          </div>
        )}
        {my && !lg && (
          <div>
            <span className="tag tag-accent">{my === "joined" ? "你已報名" : "你在候補"}</span>
          </div>
        )}
      </div>
    </>
  );
  return lg ? (
    <div className={cls}>{body}</div>
  ) : (
    <Link href={`/games/${g.id}`} className={cls}>{body}</Link>
  );
}
