"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { AppBar } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { BOOKING_DAYS, PAY_HINT, slotsFor } from "@/lib/data/coaches";
import { newBooking, useCoach, useDemo } from "@/lib/demo-store";
import { money } from "@/lib/format";
import type { Booking, Coach, CoachProfile } from "@/lib/types";

/** Called from the 開始揪團 click only. */
const newGroupId = () => "grp" + Date.now().toString(36);

export const bookingTotal = (b: Booking, p: CoachProfile) => {
  const plan = p.plans.find((x) => x.id === b.planId) ?? p.plans[0];
  return { plan, total: plan.price * (plan.unit === "/人" ? b.headcount : 1) };
};

/** F3-7 預約：一頁完成 — ① plan ② day + slot ③ alone or 揪朋友 + note ④ pay method; sticky live total. */
export function BookScreen({ coach, planId, friends }: { coach: Coach; planId: string; friends?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const { setBooking, addGroup, profile } = useDemo();
  const c = useCoach(coach.id) ?? coach;
  const p = c.profile;
  const [b, setB] = useState<Booking>(() => {
    const first = p.plans.find((x) => x.id === planId) ?? p.plans[0];
    const days = BOOKING_DAYS.filter((d) => slotsFor(c, d).some((s) => s[1] > 0));
    const base = newBooking(c.id, first.id);
    return { ...base, note: friends ? "" : base.note, dayKey: days.find((d) => d.key === "d5")?.key ?? days[0]?.key ?? "d1" };
  });
  const set = (patch: Partial<Booking>) => setB((prev) => ({ ...prev, ...patch }));
  const { plan, total } = bookingTotal(b, p);
  const [withFriends, setWithFriends] = useState(!!friends && !!plan.group);
  const group = withFriends && plan.group ? plan.group : null;
  const perHead = plan.unit === "/人";
  const day = BOOKING_DAYS.find((d) => d.key === b.dayKey)!;
  const slots = slotsFor(c, day);

  const startGroup = () => {
    const id = newGroupId();
    addGroup({
      id, coachId: c.id, planId: plan.id, dayKey: b.dayKey, slot: b.slot!, host: profile.name, status: "gathering", note: b.note,
      members: [{ name: profile.name, initial: profile.name.slice(0, 1), you: true }],
    });
    toast("揪團開好了，把邀請連結傳給朋友");
    router.push(`/groups/${id}`);
  };

  return (
    <>
      <AppBar title={`預約 ${c.name}`} back={`/coaches/${c.id}`} historyBack />
      <div className="scroll" style={{ paddingBottom: 16 }}>
        <section className="blk">
          <h3 className="step-h"><span className="num">1</span>選課程</h3>
          <div className="seg-list" role="radiogroup">
            {p.plans.map((x) => (
              <label key={x.id} className={`radio-card${x.id === b.planId ? " on" : ""}`}>
                <input type="radio" name="plan" checked={x.id === b.planId} onChange={() => { set({ planId: x.id }); if (!x.group) setWithFriends(false); }} />
                <span className="dot" />
                <span style={{ flex: 1 }}><b>{x.name}</b><small>{x.durationMin} 分・{x.size}{x.group ? "・可揪朋友" : ""}</small></span>
                <span className="num" style={{ fontSize: 18, fontWeight: 600 }}>
                  {money(x.price)}<small style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--color-muted)" }}>{x.unit}</small>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="blk">
          <h3 className="step-h"><span className="num">2</span>選時段</h3>
          <div className="dstrip">
            {BOOKING_DAYS.map((d) => {
              const open = slotsFor(c, d).filter((s) => s[1] > 0).length;
              return (
                <button key={d.key} className={`dcell${d.key === b.dayKey ? " on" : ""}`} disabled={!open} onClick={() => set({ dayKey: d.key, slot: null })} aria-pressed={d.key === b.dayKey}>
                  <small>週{d.weekday}</small>
                  <b className="num">{d.date.split("/")[1]}</b>
                  <i className={open ? "has" : ""} />
                </button>
              );
            })}
          </div>
          <div className="slots">
            {slots.length ? (
              slots.map(([t, left]) => (
                <button key={t} className={`slot${b.slot === t ? " on" : ""}`} disabled={!left} onClick={() => set({ slot: t })} aria-pressed={b.slot === t}>
                  <b className="num">{t}</b>
                  <small>{left ? `剩 ${left} 位` : "額滿"}</small>
                </button>
              ))
            ) : (
              <p className="text-muted" style={{ margin: 0 }}>這天沒有開放時段</p>
            )}
          </div>
          <p className="fine" style={{ margin: "8px 0 0" }}>{p.venues[0].name}・時段由教練開放，選了之後送出申請</p>
        </section>

        <section className="blk">
          <h3 className="step-h"><span className="num">3</span>{plan.group ? "自己上，還是揪朋友？" : "人數與備註"}</h3>
          {plan.group && (
            <div className="seg" style={{ display: "flex", marginBottom: 12 }} role="radiogroup" aria-label="預約方式">
              <label className="seg-opt"><input type="radio" name="who" checked={!withFriends} onChange={() => setWithFriends(false)} />自己預約</label>
              <label className="seg-opt"><input type="radio" name="who" checked={withFriends} onChange={() => setWithFriends(true)} /><Icon name="users" size={16} />揪朋友一起上</label>
            </div>
          )}
          {group && (
            <ol className="group-how">
              <li><b className="num">1</b>你先佔好這個時段，拿到邀請連結</li>
              <li><b className="num">2</b>朋友用自己的帳號加入（LINE 一鍵）</li>
              <li><b className="num">3</b>滿 {group.min} 人就能送給教練，最多 {group.max} 人</li>
              <li><b className="num">4</b>教練確認後，每人各自付 {money(plan.price)}</li>
            </ol>
          )}
          {perHead && !group && (
            <div className="stepper-row">
              <span>人數</span>
              <div className="stepper">
                <button onClick={() => set({ headcount: Math.max(1, b.headcount - 1) })} aria-label="減少"><Icon name="minus" size={18} stroke={2} /></button>
                <b className="num">{b.headcount}</b>
                <button onClick={() => set({ headcount: Math.min(4, b.headcount + 1) })} aria-label="增加"><Icon name="plus" size={18} stroke={2} /></button>
              </div>
            </div>
          )}
          <textarea className="input" rows={3} placeholder={group ? "例：同事三四個人，都是新手" : "例：第一次打、之前打過網球、想加強發球"} value={b.note} onChange={(e) => set({ note: e.target.value })} aria-label="備註" />
        </section>

        <section className="blk" style={{ borderBottom: 0 }}>
          <h3 className="step-h"><span className="num">4</span>付款方式</h3>
          <p className="fine" style={{ margin: "0 0 8px" }}>教練確認後才需要付款，現在不會扣款。</p>
          <div className="seg-list" role="radiogroup">
            {p.pay.map((x) => (
              <label key={x} className={`radio-card${b.pay === x ? " on" : ""}`}>
                <input type="radio" name="pay" checked={b.pay === x} onChange={() => set({ pay: x })} />
                <span className="dot" />
                <span style={{ flex: 1 }}><b>{x}</b><small>{PAY_HINT[x]}</small></span>
              </label>
            ))}
          </div>
        </section>
      </div>
      <div className="sticky-cta">
        <div className="sticky-cta-info">
          <span className="sticky-cta-price">{group ? <>{money(plan.price)}<small style={{ fontSize: 14, fontFamily: "var(--font-body)", color: "var(--color-on-carbon-muted)" }}> /人</small></> : money(total)}</span>
          <span className="sticky-cta-sub">{b.slot ? `${day.date}（${day.weekday}）${b.slot}・${plan.name}` : "請選時段"}</span>
        </div>
        {group ? (
          <button className="btn btn-primary btn-lg" disabled={!b.slot} onClick={startGroup}>開始揪團</button>
        ) : (
        <button
          className="btn btn-primary btn-lg"
          disabled={!b.slot}
          onClick={() => {
            setBooking({ ...b, status: "pending" });
            router.push("/me/booking");
          }}
        >
          送出預約
        </button>
        )}
      </div>
    </>
  );
}
