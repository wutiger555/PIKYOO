"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { ShareSheet } from "@/components/pk/ShareSheet";
import { Crumbs } from "@/components/pk/Crumbs";
import { AppBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { GameTicket } from "@/components/pk/Ticket";
import { LoginSheet } from "@/components/pk/LoginSheet";
import { useToast } from "@/components/pk/Toast";
import { useCatalog, useDemo } from "@/lib/demo-store";
import { realAuth } from "@/lib/env";
import { useGameActions } from "@/lib/use-games";
import { LEVELS } from "@pikyoo/core/format";
import type { DayGroup, Game, Level } from "@pikyoo/core/types";
import { emptyDraft, parseGameText, SAMPLE_TEXT, type Draft, type DraftField, type PayKind } from "./parse";

type Step = "paste" | "parsing" | "form" | "done";

const PAY_NOTE: Record<PayKind, string> = { 現場付現: "現場付現給團主", 轉帳: "轉帳（報名後團主提供帳號）", 免費: "免費" };

const payOf = (g: Game): PayKind =>
  g.fee === 0 ? "免費" : (Object.keys(PAY_NOTE) as PayKind[]).find((k) => PAY_NOTE[k] === g.payNote) ?? (g.payNote.includes("轉帳") ? "轉帳" : "現場付現");

/** The form filled in from an existing game (編輯資訊). */
const draftOf = (g: Game): Draft => ({
  group: g.group, start: g.startsAt, end: g.endsAt, courtId: g.courtId ?? "other", venueText: g.courtId ? "" : g.venue,
  levelMin: g.levelMin, levelMax: g.levelMax, capacity: g.capacity, hostCounts: g.participants.some((p) => p.host),
  fee: g.fee ? String(g.fee) : "", pay: payOf(g), cancelHours: g.cancelHours ?? 12, beginner: g.beginnerFriendly, notes: g.notes,
});

/** F2-7 開團表單 + F2-8 AI 一貼成局: paste → parsing → pre-filled form (unsure fields highlighted) → publish → share.
 *  With `editing` it is F2-10 編輯資訊: the same form, filled in, saved back to the game. */
export function HostScreen({ editing }: { editing?: Game } = {}) {
  const router = useRouter();
  const toast = useToast();
  const { profile, signedIn } = useDemo();
  const games = useGameActions();
  const catalog = useCatalog();
  const { courts, dayGroups } = catalog;
  const [step, setStep] = useState<Step>(editing ? "form" : "paste");
  const [text, setText] = useState("");
  const [d, setD] = useState<Draft>(() => (editing ? draftOf(editing) : emptyDraft()));
  const [unsure, setUnsure] = useState<DraftField[]>([]);
  const [tried, setTried] = useState(false);
  const [created, setCreated] = useState<Game | null>(null);
  const [share, setShare] = useState(false);
  const [login, setLogin] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const ai = step === "paste" || step === "parsing" || (step === "form" && text !== "");
  const edit = <K extends DraftField>(k: K, v: Draft[K]) => {
    setD((p) => ({ ...p, [k]: v }));
    setUnsure((u) => u.filter((x) => x !== k && !(k === "levelMax" && x === "levelMin")));
  };
  const flag = (k: DraftField) => unsure.includes(k);

  const parse = () => {
    setStep("parsing");
    timer.current = setTimeout(() => {
      const r = parseGameText(text, catalog);
      setD(r.draft);
      setUnsure(r.unsure);
      setTried(false);
      setStep("form");
    }, 900);
  };

  const missing = {
    group: !d.group,
    time: !d.start || !d.end || d.end <= d.start,
    venue: !d.courtId || (d.courtId === "other" && !d.venueText.trim()),
    fee: d.pay !== "免費" && d.fee === "",
  };
  const blocked = Object.values(missing).some(Boolean);

  const publish = async () => {
    if (blocked) { setTried(true); toast("還有欄位沒填好"); return; }
    if (realAuth && !signedIn) { setLogin(true); return; }
    const court = courts.find((c) => c.id === d.courtId);
    const [dayLabel, rest] = dayGroups[d.group!].split(" ");
    const [lo, hi] = d.levelMin <= d.levelMax ? [d.levelMin, d.levelMax] : [d.levelMax, d.levelMin];
    const initial = profile.name.slice(0, 1);
    // a note the presets don't cover (e.g. 轉帳或現場付現) stays unless the host changes the payment type
    const payNote = editing && d.pay === payOf(editing) ? editing.payNote : PAY_NOTE[d.pay];
    const g: Game = {
      id: editing?.id ?? "h" + Date.now().toString(36), courtId: court?.id, group: d.group!, dayLabel, date: rest.replace(/（.*）/, ""),
      startsAt: d.start, endsAt: d.end, venue: court?.name ?? d.venueText.trim(), district: court?.district ?? "自填地點",
      courtKind: court ? `${court.kind} ${court.courtCount} 面` : "場地資訊由團主提供", address: court?.address ?? d.venueText.trim(),
      levelMin: lo, levelMax: hi, capacity: d.capacity,
      participants: d.hostCounts ? [{ initial, name: profile.name, host: true }] : [],
      host: { name: profile.name, initial, summary: "你開的團" },
      fee: d.pay === "免費" ? 0 : Number(d.fee), payNote, beginnerFriendly: d.beginner, waitlist: 0,
      notes: d.notes.trim(), cancelHours: d.cancelHours,
      // editing keeps who signed up
      ...(editing && { participants: editing.participants, host: editing.host, waitlist: editing.waitlist }),
    };
    const fields = {
      group: g.group, start: d.start, end: d.end, court: court?.id, venue: d.venueText, levelMin: lo, levelMax: hi,
      capacity: d.capacity, fee: g.fee, feeNote: g.payNote, cancelHours: d.cancelHours, beginner: d.beginner, notes: d.notes,
    };
    setBusy(true);
    try {
      if (editing) {
        await games.edit(g, fields);
        toast(editing.participants.some((p) => !p.host) || editing.waitlist > 0 ? "已更新，報名的人會收到變更通知" : "已更新");
        router.push(`/games/${g.id}`);
        return;
      }
      setCreated(await games.host(g, { ...fields, hostCounts: d.hostCounts, sourceText: text }));
      setStep("done");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const restart = () => { setText(""); setD(emptyDraft()); setUnsure([]); setTried(false); setCreated(null); setStep("paste"); };

  if (step === "done" && created) {
    return (
      <>
        <div className="success dk dk-narrow">
          <TopNav active="games" />
          <div className="hero">
            <span className="tab-fab" style={{ margin: 0, boxShadow: "none" }}><Icon name="paddlePlus" size={28} stroke={2} /></span>
            <h1>開好了！貼到群組吧</h1>
            <p className="text-muted" style={{ margin: 0, maxWidth: "30ch" }}>群友點卡片就能報名，名單會自動更新，有人取消會自動遞補候補。</p>
          </div>
          <GameTicket game={created} />
          <div className="actions">
            <button className="btn btn-primary btn-lg btn-block" onClick={() => setShare(true)}>
              <Icon name="share" size={20} />分享到 LINE 群組
            </button>
            <Link className="btn btn-secondary btn-lg btn-block" href={`/games/${created.id}`}>看球局</Link>
            <button className="btn btn-ghost btn-block" onClick={restart}>再開一團</button>
          </div>
        </div>
        {share && <ShareSheet game={created} onClose={() => setShare(false)} />}
      </>
    );
  }

  // Rendered above the phone scroller, and again inside the desktop page (the outer one is hidden there).
  const modeSwitch = (name: string) => (
    <div className="seg" style={{ display: "flex" }} role="radiogroup" aria-label="開團方式">
      <label className="seg-opt">
        <input type="radio" name={name} checked={ai} onChange={restart} />
        <Icon name="paddlePlus" size={18} />AI 一貼成局
      </label>
      <label className="seg-opt">
        <input type="radio" name={name} checked={!ai} onChange={() => { setText(""); setD(emptyDraft()); setUnsure([]); setTried(false); setStep("form"); }} />
        <Icon name="edit" size={18} />自己填
      </label>
    </div>
  );

  return (
    <>
      <AppBar title={editing ? "編輯球局" : "開團"} back={editing ? `/games/${editing.id}` : "/games"} historyBack />
      {!editing && <div className="host-mode">{modeSwitch("mode")}</div>}

      <div className="scroll dk dk-narrow dk-float" style={{ paddingBottom: "var(--space-6)" }}>
        <TopNav active="games" />
        <Crumbs items={editing ? [["首頁", "/"], ["球局", "/games"], [editing.venue, `/games/${editing.id}`], ["編輯"]] : [["首頁", "/"], ["球局", "/games"], ["開團"]]} />
        {!editing && <div className="host-mode dk-only">{modeSwitch("mode-dk")}</div>}
        {step === "paste" && (
          <div className="sec" style={{ paddingTop: "var(--space-4)" }}>
            <h2 style={{ margin: 0 }}>把平常的揪團文貼上來</h2>
            <p className="text-muted" style={{ margin: "4px 0 var(--space-3)", fontSize: 15 }}>時間、場地、程度、人數、費用會自動填好，不確定的欄位會標出來讓你確認。</p>
            <div className="field">
              <label htmlFor="paste">揪團文</label>
              <textarea id="paste" className="input" style={{ minHeight: 160 }} value={text} onChange={(e) => setText(e.target.value)} placeholder={"例：" + SAMPLE_TEXT} />
            </div>
            <button className="linklike" style={{ marginTop: "var(--space-2)" }} onClick={() => setText(SAMPLE_TEXT)}>貼上範例試試</button>
          </div>
        )}

        {step === "parsing" && (
          <div className="sec" style={{ paddingTop: "var(--space-4)" }} aria-busy="true" aria-live="polite">
            <h2 style={{ margin: "0 0 var(--space-4)" }}>正在讀你的揪團文…</h2>
            {[70, 45, 85, 55, 65].map((w, i) => (
              <div key={i} style={{ marginBottom: "var(--space-4)" }}>
                <div className="skel" style={{ height: 12, width: 64, marginBottom: 8 }} />
                <div className="skel" style={{ height: 44, width: `${w}%` }} />
              </div>
            ))}
          </div>
        )}

        {step === "form" && (
          <div className="sec host-form" style={{ paddingTop: "var(--space-4)" }}>
            {text && unsure.length > 0 && (
              <div className="notice" style={{ background: "var(--color-accent-100)", border: "1px solid var(--color-accent-700)", marginBottom: "var(--space-4)" }}>
                <Icon name="info" size={18} />
                <span>標著 <span className="hl-check">請確認</span> 的欄位 AI 不太確定，看一下再發布。</span>
              </div>
            )}
            {text && unsure.length === 0 && (
              <div className="notice" style={{ background: "var(--color-success-bg)", color: "var(--color-success)", marginBottom: "var(--space-4)" }}>
                <Icon name="check" size={18} />
                <span>全部欄位都讀到了，確認沒問題就可以發布。</span>
              </div>
            )}

            <Group label="日期" unsure={flag("group")} error={tried && missing.group ? "選一天" : undefined}>
              <div className="wrapchips">
                {(Object.keys(dayGroups) as DayGroup[]).map((k) => (
                  <button key={k} type="button" className="chip" aria-pressed={d.group === k} onClick={() => edit("group", k)}>{dayGroups[k]}</button>
                ))}
              </div>
            </Group>

            <Group label="時間" unsure={flag("start") || flag("end")} error={tried && missing.time ? "填開始與結束時間，結束要晚於開始" : undefined}>
              <div className="time-row">
                <input className="input num" type="time" aria-label="開始時間" value={d.start} onChange={(e) => { edit("start", e.target.value); setUnsure((u) => u.filter((x) => x !== "end")); }} />
                <span aria-hidden="true">–</span>
                <input className="input num" type="time" aria-label="結束時間" value={d.end} onChange={(e) => { edit("end", e.target.value); setUnsure((u) => u.filter((x) => x !== "start")); }} />
              </div>
            </Group>

            <Group label="場地" htmlFor="court" unsure={flag("courtId")} error={tried && missing.venue ? "選一個場地，或自己填地點" : undefined}>
              <select id="court" className="input" value={d.courtId} onChange={(e) => edit("courtId", e.target.value)}>
                <option value="">選擇場地</option>
                {courts.map((c) => <option key={c.id} value={c.id}>{c.name}（{c.district}）</option>)}
                <option value="other">其他地點（自己填）</option>
              </select>
              {d.courtId === "other" && (
                <input className="input" style={{ marginTop: 8 }} aria-label="地點" placeholder="場地名稱或地址" value={d.venueText} onChange={(e) => edit("venueText", e.target.value)} />
              )}
            </Group>

            <Group label="程度範圍" unsure={flag("levelMin")}>
              <div className="time-row">
                <select className="input" aria-label="最低程度" value={d.levelMin} onChange={(e) => edit("levelMin", Number(e.target.value) as Level)}>
                  {LEVELS.map((l, i) => <option key={l} value={i}>{l}</option>)}
                </select>
                <span aria-hidden="true">–</span>
                <select className="input" aria-label="最高程度" value={d.levelMax} onChange={(e) => edit("levelMax", Number(e.target.value) as Level)}>
                  {LEVELS.map((l, i) => <option key={l} value={i}>{l}</option>)}
                </select>
              </div>
            </Group>

            <Group label="總名額" unsure={flag("capacity")}>
              <div className="stepper" style={{ display: "inline-flex" }}>
                <button type="button" aria-label="少一位" disabled={d.capacity <= 2} onClick={() => edit("capacity", d.capacity - 1)}><Icon name="minus" size={20} /></button>
                <b className="num" aria-live="polite" style={{ minWidth: 56 }}>{d.capacity} 人</b>
                <button type="button" aria-label="多一位" disabled={d.capacity >= 24} onClick={() => edit("capacity", d.capacity + 1)}><Icon name="plus" size={20} /></button>
              </div>
              {!editing && (
                <div className="switch-row">
                  <span>我也要打（佔一個名額）</span>
                  <button type="button" className="switch" role="switch" aria-checked={d.hostCounts} aria-label="團主佔一個名額" onClick={() => edit("hostCounts", !d.hostCounts)} />
                </div>
              )}
            </Group>

            <Group label="費用與付款" unsure={flag("fee") || flag("pay")} error={tried && missing.fee ? "填每人費用，免費就選「免費」" : undefined}>
              <div className="seg" style={{ display: "flex", marginBottom: 8 }} role="radiogroup" aria-label="付款方式">
                {(["現場付現", "轉帳", "免費"] as PayKind[]).map((k) => (
                  <label key={k} className="seg-opt">
                    <input type="radio" name="pay" checked={d.pay === k} onChange={() => { edit("pay", k); setUnsure((u) => u.filter((x) => x !== "fee")); }} />
                    {k}
                  </label>
                ))}
              </div>
              {d.pay !== "免費" && (
                <div className="money-input">
                  <span className="num">NT$</span>
                  <input className="input num" inputMode="numeric" aria-label="每人費用" value={d.fee} onChange={(e) => edit("fee", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="150" />
                  <span className="text-muted">／人</span>
                </div>
              )}
            </Group>

            <Group label="免責取消期限" htmlFor="cancel">
              <select id="cancel" className="input" value={d.cancelHours} onChange={(e) => edit("cancelHours", Number(e.target.value))}>
                {[3, 6, 12, 24, 48].map((h) => <option key={h} value={h}>開始前 {h} 小時</option>)}
              </select>
            </Group>

            <div className={`switch-row hfield${flag("beginner") ? " is-unsure" : ""}`}>
              <span>
                新手友善
                {flag("beginner") && <span className="hl-check" style={{ marginLeft: 6, fontSize: 12 }}>請確認</span>}
                <small className="text-muted" style={{ display: "block", fontSize: 13 }}>會出現在新手專區，第一次打的人也能報名</small>
              </span>
              <button type="button" className="switch" role="switch" aria-checked={d.beginner} aria-label="新手友善" onClick={() => edit("beginner", !d.beginner)} />
            </div>

            <Group label="備註" htmlFor="notes">
              <textarea id="notes" className="input" value={d.notes} onChange={(e) => edit("notes", e.target.value)} placeholder="例：球由團主準備，現場有 2 支拍可借。" />
            </Group>

            {text && (
              <details className="src-text">
                <summary>看原文</summary>
                <p>{text}</p>
              </details>
            )}
          </div>
        )}
      </div>

      <div className="sticky-cta">
        {editing ? (
          <>
            <div className="sticky-cta-info">
              <span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>
                {blocked ? "還差一點" : "編輯資訊"}
              </span>
              <span className="sticky-cta-sub">改時間、地點或費用會通知報名的人</span>
            </div>
            <button className="btn btn-primary btn-lg" disabled={busy} onClick={publish}>{busy ? "儲存中…" : "儲存變更"}</button>
          </>
        ) : step === "form" ? (
          <>
            <div className="sticky-cta-info">
              <span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>
                {blocked ? "還差一點" : "可以發布了"}
              </span>
              <span className="sticky-cta-sub">{unsure.length ? `還有 ${unsure.length} 個欄位待確認` : "發布後就能分享到群組"}</span>
            </div>
            <button className="btn btn-primary btn-lg" disabled={busy} onClick={publish}>{busy ? "發布中…" : "發布球局"}</button>
          </>
        ) : (
          <>
            <div className="sticky-cta-info">
              <span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>AI 一貼成局</span>
              <span className="sticky-cta-sub">發布前都可以修改</span>
            </div>
            <button className="btn btn-primary btn-lg" disabled={!text.trim() || step === "parsing"} onClick={parse}>
              {step === "parsing" ? "解析中…" : "解析"}
            </button>
          </>
        )}
      </div>
      {login && <LoginSheet reason="登入後就能開團" onClose={() => setLogin(false)} />}
    </>
  );
}

/** A labelled form group; `unsure` marks an AI low-confidence field (docs/DESIGN_SYSTEM.md `.hl-check`). */
function Group({ label, htmlFor, unsure, error, children }: { label: string; htmlFor?: string; unsure?: boolean; error?: string; children: React.ReactNode }) {
  const head = (
    <>
      {label}
      {unsure && <span className="hl-check" style={{ marginLeft: 6, fontSize: 12 }}>請確認</span>}
    </>
  );
  const cls = `field hfield${unsure ? " is-unsure" : ""}`;
  return htmlFor ? (
    <div className={cls}>
      <label htmlFor={htmlFor}>{head}</label>
      {children}
      {error && <p className="field-err" role="alert">{error}</p>}
    </div>
  ) : (
    <fieldset className={cls}>
      <legend>{head}</legend>
      {children}
      {error && <p className="field-err" role="alert">{error}</p>}
    </fieldset>
  );
}
