"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { ShareSheet } from "@/components/pk/ShareSheet";
import { Crumbs } from "@/components/pk/Crumbs";
import { AppBar, Sheet, SoonButton } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { GameTicket, Seats } from "@/components/pk/Ticket";
import { LoginSheet } from "@/components/pk/LoginSheet";
import { useToast } from "@/components/pk/Toast";
import { useDemo, useGameView } from "@/lib/demo-store";
import { realAuth } from "@/lib/env";
import { useGameActions } from "@/lib/use-games";
import { LEVELS, levelText } from "@pikyoo/core/format";
import type { Game } from "@pikyoo/core/types";

/** F2 球局詳情: big ticket, seats, fee/cancel/level, map, host, roster, sticky CTA (join / waitlist / cancel). */
export function GameDetailScreen({ game: g }: { game: Game }) {
  const router = useRouter();
  const toast = useToast();
  const { popSeat, setPopSeat, profile, hosted, signedIn } = useDemo();
  const games = useGameActions();
  const [login, setLogin] = useState(false);
  const [cancel, setCancel] = useState(false);
  const { my, count, spots, waitN } = useGameView(g);
  const [confirm, setConfirm] = useState(false);
  const [share, setShare] = useState(false);
  const isHost = hosted.some((h) => h.id === g.id);
  const cancelHours = g.cancelHours ?? 12;
  const leave = () => games.leave(g.id).then(
    (r) => toast(r === "late" ? `已取消。離開始不到 ${cancelHours} 小時，會記一次晚取消` : "已取消，位子會釋出給候補"),
    (e: Error) => toast(e.message),
  );
  // visitors sign in first when sign-in is real; the demo lets anyone try
  const askJoin = () => (realAuth && !signedIn ? setLogin(true) : setConfirm(true));
  // "回到球局" from the success screen pops the new "你" seat once.
  const [pop] = useState(popSeat === g.id);
  useEffect(() => { if (popSeat) setPopSeat(null); }, [popSeat, setPopSeat]);

  let cta: React.ReactNode;
  if (isHost) {
    cta = (
      <>
        <div className="sticky-cta-info">
          <span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>你是團主</span>
          <span className="sticky-cta-sub">大家點卡片就能報名</span>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShare(true)}>分享到 LINE</button>
      </>
    );
  } else if (my === "joined") {
    cta = (
      <>
        <div className="sticky-cta-info">
          <span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>你已報名</span>
          <span className="sticky-cta-sub">開始前 {cancelHours} 小時可免責取消</span>
        </div>
        <button className="btn btn-secondary btn-lg" onClick={() => setCancel(true)}>取消報名</button>
      </>
    );
  } else if (my === "wait") {
    cta = (
      <>
        <div className="sticky-cta-info">
          <span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>候補第 {waitN} 位</span>
          <span className="sticky-cta-sub">有人取消會自動遞補</span>
        </div>
        <button className="btn btn-secondary btn-lg" onClick={() => setCancel(true)}>取消候補</button>
      </>
    );
  } else if (spots > 0) {
    cta = (
      <>
        <div className="sticky-cta-info">
          <span className="sticky-cta-price">NT${g.fee}</span>
          <span className="sticky-cta-sub">還有 {spots} 個位子</span>
        </div>
        <button className="btn btn-primary btn-lg" onClick={askJoin}>報名</button>
      </>
    );
  } else {
    cta = (
      <>
        <div className="sticky-cta-info">
          <span className="sticky-cta-price">NT${g.fee}</span>
          <span className="sticky-cta-sub">額滿・已有 {g.waitlist} 人候補</span>
        </div>
        <button className="btn btn-ink btn-lg" onClick={askJoin}>加入候補（第 {g.waitlist + 1} 位）</button>
      </>
    );
  }

  return (
    <>
      <AppBar
        title="球局"
        back="/games"
        historyBack
        action={
          <button className="btn btn-ghost btn-icon" onClick={() => setShare(true)} aria-label="分享">
            <Icon name="share" size={22} />
          </button>
        }
      />
      <div className="scroll dk dk-narrow dk-float">
        <TopNav active="games" />
        <Crumbs items={[["首頁", "/"], ["球局", "/games"], [g.venue]]} />
        <div className="dk-actions dk-only"><button className="btn btn-secondary" onClick={() => setShare(true)}><Icon name="share" size={18} />分享</button></div>
        <div className="detail-ticket"><GameTicket game={g} lg /></div>

        <div className="dblock">
          <h3>名額 {count}/{g.capacity}</h3>
          <Seats game={g} lg popYou={pop} />
        </div>

        <div className="dblock">
          <dl className="kv" style={{ margin: 0 }}>
            <dt>費用</dt>
            <dd><b className="num" style={{ fontSize: 18 }}>NT${g.fee}</b>／人・{g.payNote}</dd>
            <dt>取消</dt>
            <dd>開始前 {cancelHours} 小時可免責取消</dd>
            <dt>程度</dt>
            <dd>{levelText(g.levelMin, g.levelMax)}{g.beginnerFriendly ? "・新手友善" : ""}</dd>
          </dl>
        </div>

        <div className="dblock">
          <h3>地點</h3>
          <div style={{ fontWeight: 700 }}>{g.venue}</div>
          <div className="text-muted" style={{ fontSize: 14, marginBottom: "var(--space-3)" }}>{g.address}</div>
          <div className="ph" style={{ height: 120 }}>地圖縮圖</div>
          <div className="btnrow">
            <a className="btn btn-secondary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.address)}`} target="_blank" rel="noreferrer">
              <Icon name="nav" size={18} />導航
            </a>
            {g.courtId && <Link className="btn btn-secondary" href={`/courts/${g.courtId}`}>球場資訊</Link>}
          </div>
        </div>

        <div className="dblock">
          <h3>團主</h3>
          <div className="who">
            <span className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{g.host.initial}</span>
            <div style={{ flex: 1 }}>
              <div className="nm">{g.host.name}</div>
              <div className="sub">{g.host.summary}</div>
            </div>
            {!isHost && (
              <SoonButton className="btn btn-secondary" style={{ minHeight: 40 }} msg="開啟 LINE 聯絡團主">
                <Icon name="msg" size={18} />LINE
              </SoonButton>
            )}
          </div>
          {g.notes && <p style={{ margin: "var(--space-3) 0 0", fontSize: 15 }}>{g.notes}</p>}
        </div>

        <div className="dblock" style={{ borderBottom: 0 }}>
          <h3>名單</h3>
          <div className="people">
            {g.participants.map((p, i) => (
              <div key={i} className="row-item">
                <span className="avatar">{p.initial}</span>
                <span style={{ flex: 1 }}>{p.name}{isHost && i === 0 ? "（你）" : ""}</span>
                {i === 0 ? <span className="tag tag-accent">團主</span> : i === 2 ? <span className="tag tag-neutral">新成員</span> : null}
              </div>
            ))}
            {my === "joined" && (
              <div className="row-item">
                <span className="avatar" style={{ background: "var(--color-accent)", color: "var(--color-text)", boxShadow: "0 0 0 1.5px var(--color-text)" }}>你</span>
                <span style={{ flex: 1 }}>{profile.name}（你）</span>
              </div>
            )}
          </div>
          {g.waitlist > 0 && <p className="text-muted" style={{ fontSize: 14, margin: "var(--space-2) 0 0" }}>另有 {waitN} 人候補中</p>}
        </div>
      </div>
      <div className="sticky-cta">{cta}</div>

      {share && <ShareSheet game={g} onClose={() => setShare(false)} />}
      {login && <LoginSheet reason="登入後就能報名球局" onClose={() => setLogin(false)} />}
      {cancel && <CancelSheet game={g} waiting={my === "wait"} onClose={() => setCancel(false)} onConfirm={() => leave().finally(() => setCancel(false))} />}
      {confirm && (
        <ConfirmSheet
          game={g}
          full={spots <= 0}
          onClose={() => setConfirm(false)}
          onConfirm={() => games.join(g.id, spots <= 0).then(() => {
            setConfirm(false);
            router.push(`/games/${g.id}/success`);
          }, (e: Error) => { setConfirm(false); toast(e.message); })}
        />
      )}
    </>
  );
}

function ConfirmSheet({ game: g, full, onClose, onConfirm }: { game: Game; full: boolean; onClose: () => void; onConfirm: () => void }) {
  const { profile } = useDemo();
  const outOfRange = profile.level < g.levelMin || profile.level > g.levelMax;
  return (
    <Sheet onClose={onClose}>
      <h2>{full ? "確認加入候補" : "確認報名"}</h2>
      <div className="sum">
        <span className="text-muted" style={{ fontSize: 13 }}>{g.dayLabel} {g.date}・{g.venue}</span>
        <span className="big">{g.startsAt}–{g.endsAt}</span>
        <span>NT${g.fee}・{g.payNote}</span>
      </div>
      {outOfRange && (
        <div className="notice" style={{ background: "var(--color-info-bg)", color: "var(--color-info)", marginTop: "var(--space-3)" }}>
          <Icon name="info" size={18} />
          <span>這局程度 {levelText(g.levelMin, g.levelMax)}，你目前是 {LEVELS[profile.level]}。還是可以報名，團主會看到你的程度。</span>
        </div>
      )}
      <p className="text-muted" style={{ fontSize: 14, margin: "var(--space-3) 0 0" }}>
        {full
          ? `你會是第 ${g.waitlist + 1} 位候補。有人取消時自動遞補，並用 LINE 通知你。`
          : `開始前 ${g.cancelHours ?? 12} 小時可免責取消，之後取消會記一次晚取消。`}
      </p>
      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: "var(--space-4)" }} onClick={onConfirm}>
        {full ? "確認候補" : "確認報名"}
      </button>
    </Sheet>
  );
}

/** Cancelling is one tap away on the CTA, so it asks first and says what it costs (PRD §6.2 晚取消). */
function CancelSheet({ game: g, waiting, onClose, onConfirm }: { game: Game; waiting: boolean; onClose: () => void; onConfirm: () => Promise<unknown> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Sheet onClose={onClose}>
      <h2>{waiting ? "取消候補？" : "取消報名？"}</h2>
      <div className="sum">
        <span className="text-muted" style={{ fontSize: 13 }}>{g.dayLabel} {g.date}・{g.venue}</span>
        <span className="big">{g.startsAt}–{g.endsAt}</span>
      </div>
      <p className="text-muted" style={{ fontSize: 14, margin: "var(--space-3) 0 0" }}>
        {waiting
          ? "取消後會失去目前的候補順位，之後再候補要重新排。"
          : `位子會讓給候補的人。開始前 ${g.cancelHours ?? 12} 小時內取消會記一次晚取消，團主看得到。`}
      </p>
      <button className="btn btn-secondary btn-lg btn-block" style={{ marginTop: "var(--space-4)", color: "var(--color-danger)" }} disabled={busy}
        onClick={() => { setBusy(true); onConfirm(); }}>
        {busy ? "取消中…" : waiting ? "確定取消候補" : "確定取消報名"}
      </button>
      <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={onClose}>{waiting ? "繼續候補" : "保留報名"}</button>
    </Sheet>
  );
}
