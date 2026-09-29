"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Status } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { AppBar, SoonButton } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { BOOKING_DAYS, getCoach } from "@/lib/data/coaches";
import { newBooking, useDemo } from "@/lib/demo-store";
import type { BookingStatus } from "@/lib/types";
import { money } from "@/lib/format";
import { Photo } from "./CoachCard";
import { bookingTotal } from "./BookScreen";

const STEPS = ["送出申請", "教練確認", "付款", "上課"];

/** docs/PRD.md §6.3 — 送出申請 → 教練確認 → 付款 → 上課. Payment happens only after the coach confirms. */
export function BookingStatusScreen({ demo }: { demo?: BookingStatus }) {
  const toast = useToast();
  const { booking: b, setBooking } = useDemo();
  const [last5, setLast5] = useState("40213");
  // /me/booking?demo=pending|confirmed seeds Mia's trial lesson so the flow index can deep-link a state.
  useEffect(() => {
    if (demo) setBooking({ ...newBooking(), slot: "10:00", status: demo });
  }, [demo, setBooking]);
  const c = getCoach(b.coachId);
  const p = c?.profile;

  if (!c || !p || !b.slot) {
    return (
      <>
        <AppBar title="我的預約" back="/me/lessons" />
        <div className="scroll">
          <div className="empty-s" style={{ paddingTop: 64 }}>
            <h3>還沒有預約</h3>
            <p className="text-muted">先找一位教練，選好時段就能送出。</p>
            <Link className="btn btn-primary" href="/coaches">找教練</Link>
          </div>
        </div>
      </>
    );
  }

  const { plan, total } = bookingTotal(b, p);
  const day = BOOKING_DAYS.find((d) => d.key === b.dayKey)!;
  const st = b.status;
  const idx = { pending: 1, confirmed: 2, reported: 2, paid: 3 }[st];
  const setStatus = (status: typeof st) => setBooking((prev) => ({ ...prev, status }));

  let main: React.ReactNode;
  if (st === "pending") {
    main = (
      <div className="state-card">
        <Status tone="almost">待教練確認</Status>
        <h1>預約已送出</h1>
        <p className="text-muted">{c.name} {p.reply}。確認後會用 LINE 通知你，48 小時未處理會自動取消。</p>
        <button className="btn btn-ghost demo-btn" onClick={() => { setStatus("confirmed"); toast(`${c.name.split(" ")[0]} 已確認你的預約`); }}>
          <Icon name="info" size={16} />Demo：模擬教練按下確認
        </button>
      </div>
    );
  } else if (st === "confirmed") {
    main = (
      <>
        <div className="state-card">
          <Status tone="open">教練已確認</Status>
          <h1>完成付款就搞定了</h1>
          <p className="text-muted">上課前 24 小時可免費改期。</p>
        </div>
        <div className="paybox">
          <div className="paybox-h"><span>應付金額</span><b className="num">{money(total)}</b></div>
          {b.pay === "LINE Pay" && (
            <>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => { setStatus("paid"); toast("LINE Pay 付款完成"); }}>
                <Icon name="wallet" size={20} />用 LINE Pay 付款
              </button>
              <p className="fine" style={{ textAlign: "center", margin: "8px 0 0" }}>付款完成會自動回報給教練</p>
            </>
          )}
          {b.pay === "銀行轉帳" && (
            <>
              <dl className="bank">
                <dt>銀行</dt><dd>台新銀行（812）</dd>
                <dt>帳號</dt>
                <dd className="num">2888 1001 234 567 <SoonButton className="copy" msg="已複製帳號"><Icon name="copy" size={15} />複製</SoonButton></dd>
                <dt>戶名</dt><dd>林＊亞</dd>
              </dl>
              <div className="field">
                <label htmlFor="last5">轉帳帳號末五碼</label>
                <input id="last5" className="input num" inputMode="numeric" maxLength={5} value={last5} onChange={(e) => setLast5(e.target.value.replace(/\D/g, ""))} />
              </div>
              <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 12 }} disabled={last5.length !== 5} onClick={() => setStatus("reported")}>我已轉帳</button>
            </>
          )}
          {b.pay === "現場付現" && <p style={{ margin: 0 }}>上課當天付 <b>{money(total)}</b> 給教練即可。</p>}
          <div className="paybox-alt">
            其他方式：{p.pay.filter((x) => x !== b.pay).join("、")}{" "}
            <SoonButton className="linkbtn" msg="切換付款方式">切換</SoonButton>
          </div>
        </div>
      </>
    );
  } else if (st === "reported") {
    main = (
      <div className="state-card">
        <Status tone="info">等待教練對帳</Status>
        <h1>已回報付款</h1>
        <p className="text-muted">末五碼 {last5}。教練確認收到後會通知你。</p>
      </div>
    );
  } else {
    main = (
      <div className="state-card">
        <Status tone="open">已付款</Status>
        <h1>準備好上課了！</h1>
        <p className="text-muted">前一天 20:00 會用 LINE 提醒你，記得穿運動鞋。</p>
      </div>
    );
  }

  return (
    <>
      <AppBar title="我的預約" back="/me/lessons" />
      <div className="scroll" style={{ padding: "0 16px 24px" }}>
        <ol className="tracker">
          {STEPS.map((s, i) => (
            <li key={s} className={i < idx ? "done" : i === idx ? "now" : ""}>
              <i>{i < idx && <Icon name="check" size={12} stroke={3} />}</i>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        {main}
        <div className="sum-card">
          <div className="sum-top carbon">
            <div><small>{day.date}（{day.weekday}）</small><b className="num">{b.slot}</b></div>
            <span className="tag tag-accent">{plan.name}</span>
          </div>
          <div className="sum-body">
            <div className="row-item">
              <Photo coach={c} size="xs" />
              <div style={{ flex: 1 }}><b>{c.name}</b><div className="text-muted" style={{ fontSize: 13 }}>{p.venues[0].name}</div></div>
              <SoonButton className="btn btn-secondary" style={{ minHeight: 38, padding: "0 14px" }} msg="預約訊息（下一輪）：確認後可以在 PIKYOO 裡跟教練聯絡"><Icon name="msg" size={16} />訊息</SoonButton>
            </div>
            <div className="row-item" style={{ fontSize: 14 }}>
              <span className="text-muted" style={{ flex: 1 }}>{plan.durationMin} 分鐘・{plan.unit === "/人" ? `${b.headcount} 人` : "1 人"}</span>
              <b className="num" style={{ fontSize: 18 }}>{money(total)}</b>
            </div>
          </div>
        </div>
        {st === "paid" && (
          <SoonButton className="btn btn-secondary btn-block btn-lg" style={{ marginTop: 16 }} msg="已加入行事曆"><Icon name="cal" size={18} />加入行事曆</SoonButton>
        )}
        <SoonButton className="btn btn-ghost btn-block" style={{ marginTop: 8 }} msg="改期或取消（依教練取消規則）">改期或取消</SoonButton>
      </div>
    </>
  );
}
