"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Status } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { Crumbs } from "@/components/pk/Crumbs";
import { AppBar, SoonButton } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { TopNav } from "@/components/pk/TopNav";
import { bookingDays } from "@pikyoo/core/data/coaches";
import type { MyBooking } from "@pikyoo/core/source/bookings";
import type { MyPayment } from "@pikyoo/core/source/payments";
import { reportPaymentAction } from "@/lib/payments";
import { cancelBookingAction } from "@/lib/bookings";
import { newBooking, useCoach, useDemo } from "@/lib/demo-store";
import { realAuth } from "@/lib/env";
import type { BookingStatus } from "@pikyoo/core/types";
import { money } from "@pikyoo/core/format";
import { Photo } from "./CoachCard";
import { bookingTotal } from "./BookScreen";

const STEPS = ["送出申請", "教練確認", "付款", "上課"];

/** docs/PRD.md §6.3 — 送出申請 → 教練確認 → 付款 → 上課. Payment happens only after the coach confirms.
 *  Desktop: progress and the current step on the left, the lesson summary on the right.
 *  With real sign-in `live` is the student's booking from the database (null: none), and it can be cancelled here. */
export function BookingStatusScreen({ demo, live, payment }: { demo?: BookingStatus; live?: MyBooking | null; payment?: MyPayment | null }) {
  const toast = useToast();
  const router = useRouter();
  const { booking: demoBooking, setBooking } = useDemo();
  const b = realAuth && live ? live.booking : demoBooking;
  const [last5, setLast5] = useState("40213");
  // /me/booking?demo=pending|confirmed seeds Mia's trial lesson so the flow index can deep-link a state.
  useEffect(() => {
    if (demo) setBooking({ ...newBooking(), slot: "10:00", status: demo });
  }, [demo, setBooking]);
  const c = useCoach(b.coachId);
  const p = c?.profile;

  if (!c || !p || !b.slot || (realAuth && !live)) {
    return (
      <>
        <AppBar title="我的預約" back="/me/lessons" />
        <div className="scroll dk">
          <TopNav />
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
  const day = live?.day ?? bookingDays().find((d) => d.key === b.dayKey)!;
  // real sign-in: after the coach confirms, the payment row says how far the student got
  const st: BookingStatus = live && payment && b.status === "confirmed" ? (payment.status === "wait" ? "confirmed" : payment.status) : b.status;
  const ended = live && live.state !== "pending" && live.state !== "confirmed" ? live.state : null;
  const idx = ended === "done" ? 4 : { pending: 1, confirmed: 2, reported: 2, paid: 3 }[st];
  const cancel = async () => {
    if (!live || !confirm("確定取消這堂課的預約？教練會收到通知。")) return;
    const r = await cancelBookingAction(live.id);
    if (r.error) return toast(r.error);
    toast("已取消預約");
    router.refresh();
  };
  const setStatus = (status: typeof st) => setBooking((prev) => ({ ...prev, status }));

  let main: React.ReactNode;
  if (ended) {
    const [tone, label, title, text] = {
      declined: ["ended", "教練婉拒", "這個時段教練不方便", "換一個時段再送一次，或看看其他教練。"],
      expired: ["ended", "已逾時", "教練沒有在 48 小時內回覆", "這筆預約已自動取消，沒有任何費用。換個時段再試試。"],
      cancelled: ["ended", "已取消", "預約已取消", "需要的話可以重新預約。"],
      done: ["open", "已上課", "這堂課結束了", "希望上得開心！"],
    }[ended] as ["ended" | "open", string, string, string];
    main = (
      <div className="state-card">
        <Status tone={tone}>{label}</Status>
        <h1>{title}</h1>
        <p className="text-muted">{text}</p>
        {ended !== "done" && <Link className="btn btn-primary" href={`/coaches/${c.id}/book?plan=${b.planId}`}>重新選時段</Link>}
      </div>
    );
  } else if (realAuth && st === "confirmed") {
    main = <LivePayBox payment={payment ?? null} pay={b.pay} />;
  } else if (st === "pending") {
    main = (
      <div className="state-card">
        <Status tone="almost">待教練確認</Status>
        <h1>預約已送出</h1>
        <p className="text-muted">{c.name} {p.reply}。確認後會用 LINE 通知你，48 小時未處理會自動取消。</p>
        {!realAuth && (
          <button className="btn btn-ghost demo-btn" onClick={() => { setStatus("confirmed"); toast(`${c.name.split(" ")[0]} 已確認你的預約`); }}>
            <Icon name="info" size={16} />Demo：模擬教練按下確認
          </button>
        )}
      </div>
    );
  } else if (st === "confirmed") {
    main = (
      <>
        <div className="state-card">
          <Status tone="open">教練已確認</Status>
          <h1>完成付款就搞定了</h1>
          <p className="text-muted">錢直接付給教練，付好後按一下，教練就知道了。上課前 24 小時可免費改期。</p>
        </div>
        <div className="paybox">
          <div className="paybox-h"><span>應付金額</span><b className="num">{money(total)}</b></div>
          {b.pay === "LINE Pay" && (
            <>
              {/* PLAN D9: the coach's own LINE Pay link, so the student reports it and the coach confirms, like a transfer */}
              <button className="btn btn-primary btn-lg btn-block" onClick={() => toast("Demo：這裡會打開教練的 LINE Pay 收款連結")}>
                <Icon name="wallet" size={20} />打開 LINE Pay 付款
              </button>
              <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} onClick={() => { setLast5(""); setStatus("reported"); toast("已通知教練，確認收到後會通知你"); }}>付好了，通知教練</button>
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
        <p className="text-muted">{realAuth ? (payment?.ref ? `末五碼 ${payment.ref}。` : "") : last5 ? `末五碼 ${last5}。` : "你回報已用 LINE Pay 付款。"}教練確認收到後會通知你。</p>
        {!realAuth && (
          <button className="btn btn-ghost demo-btn" onClick={() => { setStatus("paid"); toast("教練確認收到付款"); }}>
            <Icon name="info" size={16} />Demo：模擬教練確認收到
          </button>
        )}
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
      <div className="scroll dk bs" style={{ padding: "0 16px 24px" }}>
        <TopNav />
        <Crumbs items={[["首頁", "/"], ["我的課", "/me/lessons"], ["我的預約"]]} />
        <div className="bk-cols">
        <div className="bk-main">
        {!(ended && ended !== "done") && <ol className="tracker">
          {STEPS.map((s, i) => (
            <li key={s} className={i < idx ? "done" : i === idx ? "now" : ""}>
              <i>{i < idx && <Icon name="check" size={12} stroke={3} />}</i>
              <span>{s}</span>
            </li>
          ))}
        </ol>}
        {main}
        </div>
        <aside className="bk-aside">
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
        {realAuth
          ? !ended && <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={cancel}>取消預約</button>
          : <SoonButton className="btn btn-ghost btn-block" style={{ marginTop: 8 }} msg="改期或取消（依教練取消規則）">改期或取消</SoonButton>}
        </aside>
        </div>
      </div>
    </>
  );
}

/** 教練已確認 with real sign-in: the coach's own payment details for the method the student picked, then 我已付款.
 *  Money goes straight to the coach (PLAN §12 模式 A); PIKYOO only records the report for the coach to tick off. */
function LivePayBox({ payment, pay }: { payment: MyPayment | null; pay: string }) {
  const toast = useToast();
  const router = useRouter();
  const [last5, setLast5] = useState("");
  const [busy, setBusy] = useState(false);
  const report = async (ref: string) => {
    if (!payment) return;
    setBusy(true);
    const r = await reportPaymentAction(payment.id, ref);
    setBusy(false);
    if (r.error) return toast(r.error);
    toast("已通知教練，確認收到後會通知你");
    router.refresh();
  };
  const copy = (text: string) => navigator.clipboard.writeText(text).then(() => toast("已複製"), () => toast(text));
  const d = payment?.details as { link?: string; bank?: string; account?: string; name?: string } | null | undefined;
  return (
    <>
      <div className="state-card">
        <Status tone="open">教練已確認</Status>
        <h1>完成付款就搞定了</h1>
        <p className="text-muted">錢直接付給教練。付好後按一下，教練就知道了。</p>
      </div>
      <div className="paybox">
        <div className="paybox-h"><span>應付金額</span><b className="num">{money(payment?.amount ?? 0)}</b></div>
        {!payment ? (
          <p style={{ margin: 0 }}>付款資訊整理中，請稍後重新整理。</p>
        ) : pay === "現場付現" ? (
          <p style={{ margin: 0 }}>上課當天付 <b>{money(payment.amount)}</b> 給教練即可。</p>
        ) : !d ? (
          <p style={{ margin: 0 }}>教練還沒填 {pay} 的收款資訊。上課前請跟教練確認付款方式。</p>
        ) : pay === "LINE Pay" && d.link ? (
          <>
            <a className="btn btn-primary btn-lg btn-block" href={d.link} target="_blank" rel="noopener noreferrer"><Icon name="wallet" size={20} />用 LINE Pay 付款</a>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 8 }} disabled={busy} onClick={() => report("")}>付好了，通知教練</button>
          </>
        ) : (
          <>
            <dl className="bank">
              <dt>銀行</dt><dd>{d.bank}</dd>
              <dt>帳號</dt>
              <dd className="num">{d.account} <button className="copy" onClick={() => copy(d.account ?? "")}><Icon name="copy" size={15} />複製</button></dd>
              <dt>戶名</dt><dd>{d.name}</dd>
            </dl>
            <div className="field">
              <label htmlFor="last5">轉帳帳號末五碼</label>
              <input id="last5" className="input num" inputMode="numeric" maxLength={5} value={last5} onChange={(e) => setLast5(e.target.value.replace(/\D/g, ""))} />
            </div>
            <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 12 }} disabled={last5.length !== 5 || busy} onClick={() => report(last5)}>我已轉帳</button>
          </>
        )}
      </div>
    </>
  );
}
