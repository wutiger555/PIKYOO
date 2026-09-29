"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { AppBar } from "@/components/pk/Shell";
import { BOOKING_DAYS, PAY_HINT, SLOTS } from "@/lib/data/coaches";
import { newBooking, useDemo } from "@/lib/demo-store";
import { money } from "@/lib/format";
import type { Booking, Coach, CoachProfile } from "@/lib/types";

export const bookingTotal = (b: Booking, p: CoachProfile) => {
  const plan = p.plans.find((x) => x.id === b.planId) ?? p.plans[0];
  return { plan, total: plan.price * (plan.unit === "/人" ? b.headcount : 1) };
};

/** F3-7 預約：一頁完成 — ① plan ② day + slot ③ headcount + note ④ pay method; sticky live total. */
export function BookScreen({ coach: c, profile: p, planId }: { coach: Coach; profile: CoachProfile; planId: string }) {
  const router = useRouter();
  const { setBooking } = useDemo();
  const [b, setB] = useState<Booking>(() => newBooking(c.id, p.plans.some((x) => x.id === planId) ? planId : p.plans[0].id));
  const set = (patch: Partial<Booking>) => setB((prev) => ({ ...prev, ...patch }));
  const { plan, total } = bookingTotal(b, p);
  const perHead = plan.unit === "/人";
  const slots = SLOTS[b.dayKey] ?? [];
  const day = BOOKING_DAYS.find((d) => d.key === b.dayKey)!;

  return (
    <>
      <AppBar title={`預約 ${c.name}`} back={`/coaches/${c.id}`} historyBack />
      <div className="scroll" style={{ paddingBottom: 16 }}>
        <section className="blk">
          <h3 className="step-h"><span className="num">1</span>選課程</h3>
          <div className="seg-list" role="radiogroup">
            {p.plans.map((x) => (
              <label key={x.id} className={`radio-card${x.id === b.planId ? " on" : ""}`}>
                <input type="radio" name="plan" checked={x.id === b.planId} onChange={() => set({ planId: x.id })} />
                <span className="dot" />
                <span style={{ flex: 1 }}><b>{x.name}</b><small>{x.durationMin} 分・{x.size}</small></span>
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
              const open = (SLOTS[d.key] ?? []).filter((s) => s[1] > 0).length;
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
          <h3 className="step-h"><span className="num">3</span>人數與備註</h3>
          {perHead && (
            <div className="stepper-row">
              <span>人數</span>
              <div className="stepper">
                <button onClick={() => set({ headcount: Math.max(1, b.headcount - 1) })} aria-label="減少"><Icon name="minus" size={18} stroke={2} /></button>
                <b className="num">{b.headcount}</b>
                <button onClick={() => set({ headcount: Math.min(4, b.headcount + 1) })} aria-label="增加"><Icon name="plus" size={18} stroke={2} /></button>
              </div>
            </div>
          )}
          <textarea className="input" rows={3} placeholder="例：第一次打、之前打過網球、想加強發球" value={b.note} onChange={(e) => set({ note: e.target.value })} aria-label="備註" />
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
          <span className="sticky-cta-price">{money(total)}</span>
          <span className="sticky-cta-sub">{b.slot ? `${day.date}（${day.weekday}）${b.slot}・${plan.name}` : "請選時段"}</span>
        </div>
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
      </div>
    </>
  );
}
