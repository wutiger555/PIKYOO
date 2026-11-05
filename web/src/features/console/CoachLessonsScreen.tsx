"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { AppBar } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { setClosedDayAction } from "@/lib/coach";
import { useCatalog, useDemo } from "@/lib/demo-store";
import { realAuth } from "@/lib/env";
import { money } from "@pikyoo/core/format";
import type { Coach, Plan, Weekday } from "@pikyoo/core/types";
import { CoachTabs, ConsoleFrame } from "./ConsoleScreens";
import { CoachSaveBar } from "./CoachAccount";

const WEEK: Weekday[] = ["一", "二", "三", "四", "五", "六", "日"];
const UNITS: Plan["unit"][] = ["/人", "/堂", "/10 堂"];

/** 起價 = the lowest price a student can pay for one lesson. */
const priceFrom = (plans: Plan[]) => Math.min(...plans.filter((p) => p.unit !== "/10 堂").map((p) => p.price), Infinity);

/** F5-3/F5-4 課程時段: plan templates (price, size, 可揪朋友) and the weekly open times students book from. */
export function CoachLessonsScreen() {
  const toast = useToast();
  const { myCoach: c, setMyCoach } = useDemo();
  const p = c.profile;
  const [newTime, setNewTime] = useState<Partial<Record<Weekday, string>>>({});

  const setPlans = (plans: Plan[]) =>
    setMyCoach((x): Coach => {
      const from = priceFrom(plans);
      return { ...x, priceFrom: Number.isFinite(from) ? from : x.priceFrom, profile: { ...x.profile, plans } };
    });
  const setPlan = (i: number, patch: Partial<Plan>) => setPlans(p.plans.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setDay = (d: Weekday, times: string[]) => setMyCoach((x) => ({ ...x, profile: { ...x.profile, availability: { ...x.profile.availability, [d]: [...times].sort() } } }));
  const open = WEEK.reduce((n, d) => n + (p.availability[d]?.length ?? 0), 0);

  return (
    <>
      <AppBar title="課程與時段" />
      <ConsoleFrame active="lessons">
      <h1 className="con-titlebar dk-only">課程與時段</h1>
      <div className="console-wide">
        <CoachSaveBar />
        <div className="editor editor-2">
          <section className="ed-card">
            <div className="sec-head"><h2><span className="en">Plans</span>課程方案</h2><span className="text-muted" style={{ fontSize: 13 }}>起價 {money(c.priceFrom)}</span></div>
            <p className="ed-hint">開啟「可揪朋友」的方案，學生可以發起揪團、邀朋友各自用帳號加入，人數到了才送給你確認。</p>
            {p.plans.map((pl, i) => (
              <article key={pl.id} className="ed-plan">
                <div className="ed-plan-h">
                  <input className="input ed-plan-name" aria-label="方案名稱" value={pl.name} onChange={(e) => setPlan(i, { name: e.target.value })} />
                  <button className="btn btn-ghost btn-icon" aria-label={`刪除 ${pl.name}`} disabled={p.plans.length === 1} onClick={() => { setPlans(p.plans.filter((_, j) => j !== i)); toast(`已刪除 ${pl.name}`); }}><Icon name="x" size={18} /></button>
                </div>
                <div className="ed-plan-grid">
                  <div className="field">
                    <label htmlFor={`pr-${pl.id}`}>價格</label>
                    <div className="money-input"><span className="num">NT$</span><input id={`pr-${pl.id}`} className="input num" inputMode="numeric" value={pl.price} onChange={(e) => setPlan(i, { price: Number(e.target.value.replace(/\D/g, "").slice(0, 6)) || 0 })} /></div>
                  </div>
                  <div className="field">
                    <label htmlFor={`un-${pl.id}`}>計價</label>
                    <select id={`un-${pl.id}`} className="input" value={pl.unit} onChange={(e) => setPlan(i, { unit: e.target.value as Plan["unit"] })}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select>
                  </div>
                  <div className="field">
                    <label htmlFor={`du-${pl.id}`}>時長</label>
                    <select id={`du-${pl.id}`} className="input" value={pl.durationMin} onChange={(e) => setPlan(i, { durationMin: Number(e.target.value) })}>{[45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} 分鐘</option>)}</select>
                  </div>
                  <div className="field">
                    <label htmlFor={`sz-${pl.id}`}>人數</label>
                    <input id={`sz-${pl.id}`} className="input" value={pl.size} onChange={(e) => setPlan(i, { size: e.target.value })} />
                  </div>
                </div>
                <div className="field"><label htmlFor={`nt-${pl.id}`}>說明</label><input id={`nt-${pl.id}`} className="input" value={pl.note} onChange={(e) => setPlan(i, { note: e.target.value })} /></div>
                <div className="switch-row">
                  <span><Icon name="users" size={16} /> 可揪朋友一起上</span>
                  <button className="switch" role="switch" aria-checked={!!pl.group} aria-label={`${pl.name} 可揪朋友`} onClick={() => setPlan(i, { group: pl.group ? undefined : { min: 2, max: 4 } })} />
                </div>
                {pl.group && (
                  <div className="ed-group">
                    <Range label="最少" value={pl.group.min} min={2} max={pl.group.max} onChange={(v) => setPlan(i, { group: { ...pl.group!, min: v } })} />
                    <Range label="最多" value={pl.group.max} min={pl.group.min} max={12} onChange={(v) => setPlan(i, { group: { ...pl.group!, max: v } })} />
                    <span className="text-muted" style={{ fontSize: 13 }}>人到齊才送給你</span>
                  </div>
                )}
              </article>
            ))}
            <button
              className="btn btn-secondary btn-block"
              onClick={() => setPlans([...p.plans, { id: "n" + Date.now().toString(36), name: "新方案", durationMin: 60, size: "1 人", price: 1000, unit: "/堂", note: "" }])}
            >
              <Icon name="plus" size={18} />新增方案
            </button>
          </section>

          <section className="ed-card">
            <div className="sec-head"><h2><span className="en">Weekly</span>每週開放時段</h2><span className="text-muted" style={{ fontSize: 13 }}>{open} 個時段</span></div>
            <p className="ed-hint">學生預約頁會直接用這些時段。某一天不能上課，用下面的「這幾天不開放」。</p>
            <div className="week">
              {WEEK.map((d) => {
                const times = p.availability[d] ?? [];
                return (
                  <div key={d} className="week-row">
                    <b className="week-d">週{d}</b>
                    <div className="week-t">
                      {times.map((t) => (
                        <span key={t} className="week-chip num">{t}<button aria-label={`移除週${d} ${t}`} onClick={() => setDay(d, times.filter((x) => x !== t))}><Icon name="x" size={12} stroke={2.4} /></button></span>
                      ))}
                      {!times.length && <span className="text-muted" style={{ fontSize: 13 }}>不開放</span>}
                    </div>
                    <div className="week-add">
                      <input className="input num" type="time" step={1800} aria-label={`週${d} 新增時段`} value={newTime[d] ?? ""} onChange={(e) => setNewTime((x) => ({ ...x, [d]: e.target.value }))} />
                      <button
                        className="btn btn-secondary btn-icon"
                        aria-label={`新增週${d}時段`}
                        disabled={!newTime[d] || times.includes(newTime[d]!)}
                        onClick={() => { setDay(d, [...times, newTime[d]!]); setNewTime((x) => ({ ...x, [d]: "" })); }}
                      >
                        <Icon name="plus" size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <ClosedDays />
          </section>
        </div>
      </div>
      </ConsoleFrame>
      <CoachTabs active="lessons" />
    </>
  );
}

function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="stepper-row" style={{ margin: 0, gap: 8 }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <div className="stepper">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label}少一人`}><Icon name="minus" size={16} stroke={2} /></button>
        <b className="num">{value}</b>
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label}多一人`}><Icon name="plus" size={16} stroke={2} /></button>
      </div>
    </div>
  );
}

/** 這幾天不開放 (docs/FLOWS.md §2.4): pick a date and its weekly sessions disappear from booking. Saved right away
 *  (setClosedDay), unlike the rest of this page; lessons already confirmed that day stay, cancel them in 今天. */
function ClosedDays() {
  const toast = useToast();
  const router = useRouter();
  const { myCoach: mine } = useCatalog();
  const [today] = useState(() => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10));
  const [demo, setDemo] = useState<string[]>([]);
  const [day, setDay] = useState("");
  const days = realAuth ? mine?.closedDays ?? [] : demo;
  const set = async (d: string, closed: boolean) => {
    if (realAuth && mine) {
      const r = await setClosedDayAction(mine.id, d, closed);
      if (r.error) return toast(r.error);
      router.refresh();
    } else setDemo((xs) => (closed ? [...xs, d].sort() : xs.filter((x) => x !== d)));
    toast(closed ? `${md(d)} 不開放了，學生約不到這天` : `${md(d)} 重新開放`);
    setDay("");
  };
  return (
    <div className="closed-days">
      <b>這幾天不開放</b>
      <div className="week-t">
        {days.map((d) => <span key={d} className="week-chip num">{md(d)}<button aria-label={`重新開放 ${md(d)}`} onClick={() => set(d, false)}><Icon name="x" size={12} stroke={2.4} /></button></span>)}
        {!days.length && <span className="text-muted" style={{ fontSize: 13 }}>沒有</span>}
      </div>
      <div className="week-add">
        <input className="input num" type="date" min={today} aria-label="選不開放的日期" value={day} onChange={(e) => setDay(e.target.value)} />
        <button className="btn btn-secondary" disabled={!day || days.includes(day)} onClick={() => set(day, true)}>不開放</button>
      </div>
    </div>
  );
}

/** 2026-11-20 → 11/20（五） */
const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}（${"日一二三四五六"[new Date(`${d}T12:00:00+08:00`).getUTCDay()]}）`;
