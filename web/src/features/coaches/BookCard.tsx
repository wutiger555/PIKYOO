"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { BOOKING_DAYS, slotsFor } from "@/lib/data/coaches";
import { money } from "@/lib/format";
import type { Coach } from "@/lib/types";

/** Desktop coach page: the sticky booking card in the right column (docs/DESKTOP.md §5.1). Picks plan, day and time
 *  here so the booking page opens pre-filled; a visitor sees the price and a sign-in prompt instead. */
export function BookCard({ coach: c, locked, onLogin }: { coach: Coach; locked: boolean; onLogin: () => void }) {
  const p = c.profile;
  const [planId, setPlanId] = useState(p.plans[0]?.id);
  const [dayKey, setDayKey] = useState(() => BOOKING_DAYS.find((d) => slotsFor(c, d).some((s) => s[1] > 0))?.key);
  const [slot, setSlot] = useState<string | null>(null);
  const plan = p.plans.find((x) => x.id === planId) ?? p.plans[0];
  const day = BOOKING_DAYS.find((d) => d.key === dayKey);
  const slots = day ? slotsFor(c, day) : [];
  const href = plan && `/coaches/${c.id}/book?plan=${plan.id}${dayKey ? `&day=${dayKey}` : ""}${slot ? `&slot=${slot}` : ""}`;

  return (
    <div className="bcard">
      <div className="bcard-price"><b className="num">{money(c.priceFrom)}</b><span>起</span></div>
      <div className="text-muted bcard-sub">{p.plans.length} 種課程・{p.reply}</div>

      {locked ? (
        <div className="bcard-lock">
          <span className="lock-ic"><Icon name="lock" size={20} /></span>
          <p>登入後可以看 {c.name} 未來 7 天的時段，選好直接預約。</p>
          <button className="btn btn-primary btn-lg btn-block" onClick={onLogin}>登入／註冊看時段</button>
          <p className="fine">用 LINE 登入，第一次會自動建立帳號。</p>
        </div>
      ) : !plan ? (
        <p className="text-muted">教練還沒上架課程。</p>
      ) : (
        <>
          <div className="bcard-h">課程</div>
          <div className="seg-list" role="radiogroup" aria-label="課程">
            {p.plans.map((x) => (
              <label key={x.id} className={`radio-card${x.id === plan.id ? " on" : ""}`}>
                <input type="radio" name="bcard-plan" checked={x.id === plan.id} onChange={() => setPlanId(x.id)} />
                <span className="dot" />
                <span style={{ flex: 1, minWidth: 0 }}><b>{x.name}</b><small>{x.durationMin} 分・{x.size}</small></span>
                <span className="num bcard-pp">{money(x.price)}<small>{x.unit}</small></span>
              </label>
            ))}
          </div>

          <div className="bcard-h">日期</div>
          <div className="dstrip">
            {BOOKING_DAYS.map((d) => {
              const open = slotsFor(c, d).some((s) => s[1] > 0);
              return (
                <button key={d.key} className={`dcell${d.key === dayKey ? " on" : ""}`} disabled={!open} aria-pressed={d.key === dayKey} onClick={() => { setDayKey(d.key); setSlot(null); }}>
                  <small>週{d.weekday}</small>
                  <b className="num">{d.date.split("/")[1]}</b>
                  <i className={open ? "has" : ""} />
                </button>
              );
            })}
          </div>
          {day ? (
            <div className="slots">
              {slots.map(([t, left]) => (
                <button key={t} className={`slot${slot === t ? " on" : ""}`} disabled={!left} aria-pressed={slot === t} onClick={() => setSlot(t)}>
                  <b className="num">{t}</b>
                  <small>{left ? `剩 ${left} 位` : "額滿"}</small>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: 14 }}>這週還沒開放時段，可以先在問與答問教練。</p>
          )}

          <Link className="btn btn-primary btn-lg btn-block" style={{ marginTop: 16 }} href={href}>{slot ? `預約 ${day?.date} ${slot}` : "選時段預約"}</Link>
          {plan.group && (
            <Link className="bcard-group" href={`/coaches/${c.id}/book?plan=${plan.id}&with=friends`}>
              <Icon name="users" size={16} />揪朋友一起上（{plan.group.min}–{plan.group.max} 人，各自付款）
            </Link>
          )}
          <dl className="bcard-kv">
            <dt>取消</dt><dd>{p.policy}</dd>
            <dt>付款</dt><dd>{p.pay.join("・")}，教練確認後再付</dd>
          </dl>
        </>
      )}
    </div>
  );
}
