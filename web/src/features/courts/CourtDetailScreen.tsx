"use client";

import Link from "next/link";
import { Icon } from "@/components/pk/Icon";
import { Crumbs } from "@/components/pk/Crumbs";
import { AppBar, SoonButton } from "@/components/pk/Shell";
import { GameTicket } from "@/components/pk/Ticket";
import { useToast } from "@/components/pk/Toast";
import { TopNav } from "@/components/pk/TopNav";
import { Img } from "@/features/coaches/CoachCard";
import { LESSONS } from "@pikyoo/core/data/games";
import { useAllGames } from "@/lib/demo-store";
import { money } from "@pikyoo/core/format";
import type { Court } from "@pikyoo/core/types";

const BOOK_CTA: Record<Court["booking"], string> = {
  公立預約系統: "前往預約系統",
  官網預約: "前往官網預約",
  "LINE 預約": "用 LINE 預約",
  電話預約: "打電話預約",
  免預約: "直接去打",
};

/** F4-2 球場詳情: facts, how to book (one tap out), rules, and the games and lessons held here.
 *  Desktop: facts, games and lessons on the left; booking card, location and the report link on the right. The phone
 *  keeps its single-column order via `.o1`–`.o8` (the two column wrappers are `display: contents` there). */
export function CourtDetailScreen({ court: c }: { court: Court }) {
  const toast = useToast();
  const games = useAllGames().filter((g) => g.courtId === c.id);
  const lessons = LESSONS.filter((l) => l.courtId === c.id);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`;
  const bookBtn =
    c.booking === "免預約" ? (
      <a className="btn btn-primary btn-lg" href={maps} target="_blank" rel="noreferrer">{BOOK_CTA[c.booking]}</a>
    ) : (
      <button className="btn btn-primary btn-lg" onClick={() => toast(`${BOOK_CTA[c.booking]}（接上場館真實連結前先示意）`)}>{BOOK_CTA[c.booking]}</button>
    );

  return (
    <>
      <AppBar
        title="球場"
        back="/courts"
        historyBack
        action={
          <SoonButton className="btn btn-ghost btn-icon" msg="已收藏球場（收藏在「我的」）" aria-label="收藏">
            <Icon name="heart" size={22} />
          </SoonButton>
        }
      />
      <div className="scroll dk cd">
        <TopNav active="courts" />
        <Crumbs items={[["首頁", "/"], ["球場", "/courts"], [c.name]]} />
        <div className="cd-cols">
        <div className="cd-main">
        <div className="court-photo o1">
          {c.photo ? <Img src={c.photo.src} alt={c.photo.alt} sizes="(min-width: 1024px) 800px, 480px" priority /> : <div className="ph img-ph">球場照片</div>}
        </div>
        <div className="dblock o2">
          <h1 style={{ margin: 0, fontSize: 24, overflowWrap: "anywhere" }}>{c.name}</h1>
          <div className="text-muted" style={{ fontSize: 14 }}>{c.district}・{c.kind} {c.courtCount} 面・{c.surface}</div>
          <div className="ticket-tags" style={{ marginTop: "var(--space-2)" }}>
            {c.amenities.map((a) => <span key={a} className="tag tag-neutral">{a}</span>)}
          </div>
          {c.verified && (
            <p className="text-muted" style={{ fontSize: 13, margin: "var(--space-2) 0 0", display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="check" size={14} stroke={2.2} />PIKYOO 已確認 {c.verified}
            </p>
          )}
        </div>

        <div className="dblock o3">
          <h3>怎麼預約</h3>
          <div className="book-how">
            <span className="tag tag-accent">{c.booking}</span>
            <p style={{ margin: 0 }}>{c.bookingNote}</p>
          </div>
        </div>

        <div className="dblock o4">
          <dl className="kv" style={{ margin: 0 }}>
            <dt>開放</dt><dd>{c.hours}</dd>
            <dt>收費</dt><dd>{c.priceNote}</dd>
            <dt>規則</dt><dd>{c.rules}</dd>
          </dl>
        </div>

        <div className="dblock o6">
          <h3>這裡的球局</h3>
          {games.length ? (
            <div className="stack">{games.map((g) => <GameTicket key={g.id} game={g} />)}</div>
          ) : (
            <div className="empty-s" style={{ padding: "var(--space-3) 0" }}>
              <p className="text-muted">這週還沒有人在這裡開團。</p>
              <Link className="btn btn-secondary" href="/games/new">在這裡開一團</Link>
            </div>
          )}
        </div>

        {lessons.length > 0 && (
          <div className="dblock o7">
            <h3>這裡的課</h3>
            {lessons.map((l) => (
              <Link key={l.id} href={`/coaches/${l.coachId}`} className="row-item">
                <span className="avatar">{l.initial}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{l.title}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{l.when}・{l.coach}</div>
                </div>
                <span className="num" style={{ fontSize: 18, fontWeight: 600 }}>{money(l.price)}</span>
              </Link>
            ))}
          </div>
        )}

        </div>
        <aside className="cd-aside">
          <div className="bcard dk-only cd-book">
            <div className="bcard-price"><b style={{ fontFamily: "var(--font-body)", fontSize: 24 }}>{c.free ? "免費" : c.booking}</b></div>
            <div className="text-muted bcard-sub">{c.hours}・{c.priceNote}</div>
            <p style={{ margin: "12px 0", fontSize: 14 }}>{c.bookingNote}</p>
            {bookBtn}
          </div>
        <div className="dblock o5">
          <h3>地點</h3>
          <div className="text-muted" style={{ fontSize: 14, marginBottom: "var(--space-3)" }}>{c.address}</div>
          <div className="ph" style={{ height: 120 }}>地圖縮圖</div>
          <div className="btnrow">
            <a className="btn btn-secondary" href={maps} target="_blank" rel="noreferrer"><Icon name="nav" size={18} />導航</a>
          </div>
        </div>

          <div className="dblock o8" style={{ borderBottom: 0 }}>
            <SoonButton className="linklike" msg="謝謝回報！我們會再確認這個球場的資料">資料有誤？回報給我們</SoonButton>
          </div>
        </aside>
        </div>
      </div>
      <div className="sticky-cta">
        <div className="sticky-cta-info">
          <span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>{c.free ? "免費" : c.booking}</span>
          <span className="sticky-cta-sub">{c.hours}</span>
        </div>
        {bookBtn}
      </div>
    </>
  );
}
