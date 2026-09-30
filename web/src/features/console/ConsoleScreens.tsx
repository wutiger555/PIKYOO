"use client";

import Link from "next/link";
import { useState } from "react";
import { Status } from "@/components/pk/Badges";
import { Icon, type IconName } from "@/components/pk/Icon";
import { AppBar, Sheet, SoonButton } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { useToast } from "@/components/pk/Toast";
import { PAYOUT_METHODS, RECEIVED_BEFORE, TODAY_AGENDA } from "@/lib/data/coaches";
import { useDemo } from "@/lib/demo-store";
import { money } from "@/lib/format";
import { AnswerCard } from "@/features/coaches/QuestionBoard";
import type { BookingRequest, PaymentRow } from "@/lib/types";

type ConsoleTab = "today" | "lessons" | "page" | "pay";

const CONSOLE_LINKS: [ConsoleTab, string, IconName, string][] = [
  ["today", "/coach", "sun", "今天"],
  ["lessons", "/coach/lessons", "cal", "課程時段"],
  ["page", "/coach/profile", "user", "教練頁"],
  ["pay", "/coach/payments", "wallet", "收款"],
];

/** Badge counts: 今天 = pending bookings + unanswered questions, 收款 = transfers students reported. */
function useConsoleBadges(): Partial<Record<ConsoleTab, number>> {
  const { requests, payments, questions, myCoach } = useDemo();
  return {
    today: requests.filter((r) => r.status === "pending").length + questions.filter((q) => q.coachId === myCoach.id && !q.answer).length,
    pay: payments.filter((p) => p.status === "reported").length,
  };
}

/** Console page frame. Phone: the scroller between AppBar and CoachTabs. Desktop (`.dk`): coach TopNav, a left
 *  menu in place of the bottom tabs, content on the right (docs/DESKTOP.md §5.8). */
export function ConsoleFrame({ active, children, className }: { active: ConsoleTab; children: React.ReactNode; className?: string }) {
  const badges = useConsoleBadges();
  return (
    <div className={`scroll dk con${className ? " " + className : ""}`}>
      <TopNav coach />
      <div className="con-cols">
        <nav className="con-side dk-only" aria-label="教練後台">
          {CONSOLE_LINKS.map(([k, href, icon, label]) => (
            <Link key={k} href={href} className="con-link" aria-current={active === k ? "page" : undefined}>
              <Icon name={icon} size={20} />
              <span style={{ flex: 1 }}>{label}</span>
              {!!badges[k] && <span className="con-badge">{badges[k]}</span>}
            </Link>
          ))}
        </nav>
        <div className="con-main">{children}</div>
      </div>
    </div>
  );
}

/** Coach tab bar: 今天 · 課程時段 · 教練頁 · 收款, with pending/reported badges. */
export function CoachTabs({ active }: { active: ConsoleTab }) {
  const { today: pend, pay: rep } = useConsoleBadges();
  const tab = (key: ConsoleTab, href: string, icon: IconName, label: string, badge?: number) => (
    <Link className="tab" href={href} aria-current={active === key ? "page" : undefined}>
      <span style={{ position: "relative" }}>
        <Icon name={icon} size={22} />
        {!!badge && <span className="tbadge">{badge}</span>}
      </span>
      {label}
    </Link>
  );
  return (
    <nav className="tabbar tabbar-4">
      {tab("today", "/coach", "sun", "今天", pend)}
      {tab("lessons", "/coach/lessons", "cal", "課程時段")}
      {tab("page", "/coach/profile", "user", "教練頁")}
      {tab("pay", "/coach/payments", "wallet", "收款", rep)}
    </nav>
  );
}

/** 確認／婉拒 a booking request, with the toast that says what the student gets. */
function useRequestActions() {
  const toast = useToast();
  const { confirmRequest } = useDemo();
  return {
    decline: (r: BookingRequest) => { confirmRequest(r.id, false); toast("已婉拒，會通知學生並推薦其他時段"); },
    accept: (r: BookingRequest) => { confirmRequest(r.id, true); toast(`已確認，並用 LINE 傳 ${r.pay} 付款資訊給 ${r.name}`); },
  };
}

function RequestCard({ r }: { r: BookingRequest }) {
  const { accept, decline } = useRequestActions();
  return (
    <article className={`req${r.status !== "pending" ? " done" : ""}`}>
      <div className="req-top">
        <span className="avatar">{r.initial}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>{r.name}</b>
          {r.groupId && <span className="tag tag-accent" style={{ marginLeft: 6, fontSize: 11, padding: "3px 6px" }}>揪團 {r.headcount} 人</span>}
          <div className="text-muted" style={{ fontSize: 13 }}>{r.level}・{r.groupId ? "朋友各自付款" : r.firstTime ? "第一次上你的課" : `上過 ${r.times} 次`}</div>
        </div>
        <span className="num req-p">{money(r.amount)}</span>
      </div>
      <div className="req-m"><Icon name="cal" size={15} /><span>{r.when}・{r.plan}</span></div>
      {r.note && <p className="req-note">「{r.note}」</p>}
      {r.status === "pending" ? (
        <>
          <div className="btnrow btnrow-tight">
            <button className="btn btn-secondary" onClick={() => decline(r)}>婉拒</button>
            <button className="btn btn-primary" onClick={() => accept(r)}>確認預約</button>
          </div>
          <div className="fine">{r.expiresIn}內未處理會自動取消</div>
        </>
      ) : (
        <div className="req-res">
          {r.status === "ok" ? (
            <><Status tone="open">已確認</Status><span className="text-muted">已通知學生並送出 {r.pay} 付款資訊</span></>
          ) : (
            <Status tone="ended">已婉拒</Status>
          )}
        </div>
      )}
    </article>
  );
}

/** Desktop: the same requests as one table — who, when and what, note, amount, deadline, actions. */
function RequestTable({ requests }: { requests: BookingRequest[] }) {
  const { accept, decline } = useRequestActions();
  return (
    <table className="con-table dk-only">
      <thead><tr><th>學生</th><th>時間與方案</th><th>備註</th><th className="r">金額</th><th>處理</th></tr></thead>
      <tbody>
        {requests.map((r) => (
          <tr key={r.id} className={r.status !== "pending" ? "done" : undefined}>
            <td>
              <div className="con-who"><span className="avatar">{r.initial}</span><div><b>{r.name}</b><small>{r.level}・{r.groupId ? `揪團 ${r.headcount} 人` : r.firstTime ? "第一次上課" : `上過 ${r.times} 次`}</small></div></div>
            </td>
            <td><b>{r.when}</b><small>{r.plan}</small></td>
            <td className="con-note">{r.note || <span className="text-muted">—</span>}</td>
            <td className="r num con-amt">{money(r.amount)}</td>
            <td>
              {r.status === "pending" ? (
                <div className="con-acts">
                  <button className="btn btn-secondary" onClick={() => decline(r)}>婉拒</button>
                  <button className="btn btn-primary" onClick={() => accept(r)}>確認</button>
                  <small>{r.expiresIn}內未處理自動取消</small>
                </div>
              ) : r.status === "ok" ? <Status tone="open">已確認</Status> : <Status tone="ended">已婉拒</Status>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** F5-5 教練首頁「今天」: pending bookings, this week, money still due; one-tap confirm sends payment info via LINE. */
export function CoachTodayScreen() {
  const toast = useToast();
  const { requests, payments, myCoach, questions } = useDemo();
  const pend = requests.filter((r) => r.status === "pending");
  const ask = questions.filter((q) => q.coachId === myCoach.id && !q.answer);
  const due = payments.filter((p) => p.status !== "paid").reduce((a, p) => a + p.amount, 0);
  return (
    <>
      <ConsoleFrame active="today" className="con-pb">
        <div className="home-hero home-hero-coach carbon">
          <div className="home-top">
            <span className="role-pill"><Icon name="cap" size={14} />教練模式</span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link className="me-link" href="/">切換到學生</Link>
              <button className="rbtn" onClick={() => toast("通知")} aria-label="通知"><Icon name="bell" size={20} /></button>
            </span>
          </div>
          <h1 style={{ margin: "20px 0 2px", fontSize: 28 }}>早安，{myCoach.name.split(" ")[0]}</h1>
          <p style={{ margin: 0, color: "var(--color-on-carbon-muted)" }}>今天 2 堂課，<span className="hl">{pend.length} 筆預約</span>等你確認{ask.length > 0 && `、${ask.length} 則提問待回覆`}</p>
          <div className="stats" style={{ marginTop: 16 }}>
            <div><b className="num">{pend.length}</b><span>待確認</span></div>
            <div><b className="num">6</b><span>本週課</span></div>
            <Link href="/coach/payments"><b className="num">{money(due)}</b><span>待收款</span></Link>
          </div>
        </div>
        <section className="sec">
          <div className="sec-head">
            <h2><span className="en">Requests</span>待確認預約</h2>
            <span className="text-muted" style={{ fontSize: 14 }}>確認後自動送付款資訊</span>
          </div>
          <div className="stack mb-only">{requests.map((r) => <RequestCard key={r.id} r={r} />)}</div>
          <RequestTable requests={requests} />
        </section>
        <div className="con-grid">
        <section className="sec">
          <div className="sec-head">
            <h2><span className="en">Questions</span>學生提問</h2>
            <Link className="linklike" href={`/coaches/${myCoach.id}`}>看教練頁</Link>
          </div>
          {ask.length ? <div className="stack con-qs">{ask.map((q) => <AnswerCard key={q.id} q={q} />)}</div> : <p className="text-muted" style={{ margin: 0 }}>沒有待回覆的提問。回覆會公開在教練頁，其他學生也看得到。</p>}
        </section>
        <section className="sec con-today">
          <div className="sec-head">
            <h2><span className="en">Today</span>今天的課</h2>
            <SoonButton className="linklike" msg="行事曆（週檢視）">行事曆</SoonButton>
          </div>
          <div className="agenda">
            {TODAY_AGENDA.map((a) => (
              <div key={a.start} className="ag">
                <div className="ag-t"><b className="num">{a.start}</b><small className="num">{a.end}</small></div>
                <div className="ag-b">
                  <b>{a.title}</b>
                  <div className="text-muted" style={{ fontSize: 13 }}>{a.who}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{a.where}</div>
                </div>
                <Status tone={a.tone}>{a.status}</Status>
              </div>
            ))}
          </div>
        </section>
        </div>
      </ConsoleFrame>
      <CoachTabs active="today" />
    </>
  );
}

const PAY_LABEL: Record<PaymentRow["status"], [string, "almost" | "info" | "open"]> = {
  wait: ["待付款", "almost"],
  reported: ["學生已回報", "info"],
  paid: ["已收款", "open"],
};

/** 收款對帳: received vs due, filter by state, confirm transfers by last-5, LINE reminders. */
export function CoachPaymentsScreen() {
  const toast = useToast();
  const { payments, markPaid } = useDemo();
  const [filter, setFilter] = useState<"all" | PaymentRow["status"]>("all");
  const [settings, setSettings] = useState(false);
  const list = payments.filter((p) => filter === "all" || p.status === filter);
  const got = payments.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0) + RECEIVED_BEFORE;
  const due = payments.filter((p) => p.status !== "paid").reduce((a, p) => a + p.amount, 0);
  const cnt = (k: PaymentRow["status"]) => payments.filter((p) => p.status === k).length;
  const opts: [typeof filter, string][] = [["all", "全部"], ["reported", `已回報 ${cnt("reported")}`], ["wait", `待付款 ${cnt("wait")}`], ["paid", "已收"]];

  return (
    <>
      <AppBar
        title="收款"
        action={<button className="btn btn-ghost btn-icon" onClick={() => setSettings(true)} aria-label="收款設定"><Icon name="sliders" size={22} /></button>}
      />
      <ConsoleFrame active="pay" className="con-pb">
        <div className="con-titlebar dk-only">
          <h1>收款</h1>
          <button className="btn btn-secondary" onClick={() => setSettings(true)}><Icon name="sliders" size={18} />收款設定</button>
        </div>
        <div className="paysum carbon">
          <small>10 月</small>
          <div className="paysum-row">
            <div><span>已收</span><b className="num">{money(got)}</b></div>
            <div><span>待收</span><b className="num" style={{ color: "var(--color-accent)" }}>{money(due)}</b></div>
          </div>
          <div className="bar"><i style={{ width: `${Math.round((got / (got + due)) * 100)}%` }} /></div>
        </div>
        <div className="pad con-filter" style={{ paddingTop: 16 }}>
          <div className="seg seg-tight" style={{ display: "flex" }} role="radiogroup">
            {opts.map(([k, l]) => (
              <label key={k} className="seg-opt">
                <input type="radio" name="pf" checked={filter === k} onChange={() => setFilter(k)} />
                {l}
              </label>
            ))}
          </div>
        </div>
        <table className="con-table dk-only">
          <thead><tr><th>學生</th><th>項目</th><th>方式</th><th>狀態</th><th className="r">金額</th><th>處理</th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td><div className="con-who"><span className="avatar">{p.initial}</span><b>{p.name}</b></div></td>
                <td>{p.what}</td>
                <td><span className="tag tag-neutral">{p.via}</span>{p.status === "reported" && <small>末五碼 <b className="num">{p.ref}</b></small>}</td>
                <td><Status tone={PAY_LABEL[p.status][1]}>{PAY_LABEL[p.status][0]}</Status><small>{p.status === "paid" ? `${p.at} 入帳` : p.at}</small></td>
                <td className="r num con-amt">{money(p.amount)}</td>
                <td>
                  {p.status === "reported" && (
                    <div className="con-acts">
                      <button className="btn btn-secondary" onClick={() => toast("已請學生重新確認")}>還沒收到</button>
                      <button className="btn btn-primary" onClick={() => { markPaid(p.id); toast("已確認收款，學生會收到通知"); }}>確認收到</button>
                    </div>
                  )}
                  {p.status === "wait" && (
                    <div className="con-acts">
                      <button className="btn btn-secondary" onClick={() => toast("已改為現場收款")}>改現場收</button>
                      <button className="btn btn-secondary" onClick={() => toast(`已用 LINE 傳付款提醒給 ${p.name}`)}><Icon name="bell" size={16} />提醒</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pad stack mb-only" style={{ paddingTop: 12 }}>
          {list.map((p) => (
            <article key={p.id} className="payrow">
              <div className="payrow-top">
                <span className="avatar">{p.initial}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b>{p.name}</b>
                  <div className="text-muted" style={{ fontSize: 13 }}>{p.what}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b className="num" style={{ fontSize: 20 }}>{money(p.amount)}</b>
                  <div><Status tone={PAY_LABEL[p.status][1]}>{PAY_LABEL[p.status][0]}</Status></div>
                </div>
              </div>
              <div className="payrow-m">
                <span className="tag tag-neutral">{p.via}</span>
                {p.status === "reported" ? (
                  <span>末五碼 <b className="num">{p.ref}</b>・{p.at}</span>
                ) : p.status === "paid" ? (
                  <span>{p.at} 入帳</span>
                ) : (
                  <span>{p.at}</span>
                )}
              </div>
              {p.status === "reported" && (
                <div className="btnrow btnrow-tight">
                  <button className="btn btn-secondary" onClick={() => toast("已請學生重新確認")}>還沒收到</button>
                  <button className="btn btn-primary" onClick={() => { markPaid(p.id); toast("已確認收款，學生會收到通知"); }}>確認收到</button>
                </div>
              )}
              {p.status === "wait" && (
                <div className="btnrow btnrow-tight">
                  <button className="btn btn-secondary" onClick={() => toast("已改為現場收款")}>改現場收</button>
                  <button className="btn btn-secondary" onClick={() => toast(`已用 LINE 傳付款提醒給 ${p.name}`)}><Icon name="bell" size={16} />LINE 提醒</button>
                </div>
              )}
            </article>
          ))}
        </div>
        <p className="fine pad" style={{ marginTop: 12 }}>MVP：錢直接進教練自己的帳戶，PIKYOO 幫你發付款資訊與對帳。Phase 3 接藍新金流後可線上刷卡並自動對帳。</p>
      </ConsoleFrame>
      <CoachTabs active="pay" />
      {settings && <PayoutSettingsSheet onClose={() => setSettings(false)} />}
    </>
  );
}

/** 收款設定: each method on/off, auto reminder 24h before class. */
function PayoutSettingsSheet({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [on, setOn] = useState(() => Object.fromEntries(PAYOUT_METHODS.map((m) => [m.name, m.on])));
  const [remind, setRemind] = useState(true);
  return (
    <Sheet className="sheet-coach" onClose={onClose}>
      <h2>收款方式</h2>
      <p className="text-muted" style={{ fontSize: 14 }}>學生預約時會看到你開啟的方式，確認預約後自動傳付款資訊。</p>
      {PAYOUT_METHODS.map((m) => (
        <div key={m.name} className="row-item">
          <div style={{ flex: 1 }}><b>{m.name}</b><div className="text-muted" style={{ fontSize: 13 }}>{m.sub}</div></div>
          <button
            className="switch"
            role="switch"
            aria-checked={on[m.name]}
            aria-label={m.name}
            onClick={() => {
              toast(`${on[m.name] ? "已關閉" : "已開啟"} ${m.name}`);
              setOn((p) => ({ ...p, [m.name]: !p[m.name] }));
            }}
          />
        </div>
      ))}
      <div className="row-item">
        <div style={{ flex: 1 }}><b>自動提醒未付款</b><div className="text-muted" style={{ fontSize: 13 }}>上課前 24 小時用 LINE 提醒</div></div>
        <button className="switch" role="switch" aria-checked={remind} aria-label="自動提醒" onClick={() => setRemind((v) => !v)} />
      </div>
      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 12 }} onClick={onClose}>完成</button>
    </Sheet>
  );
}
