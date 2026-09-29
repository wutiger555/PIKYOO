"use client";

import Link from "next/link";
import { useState } from "react";
import { Status } from "@/components/pk/Badges";
import { Icon, type IconName } from "@/components/pk/Icon";
import { PkMark } from "@/components/pk/Logo";
import { AppBar, Sheet, SoonButton } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { CoachCard } from "@/features/coaches/CoachCard";
import { PAGE_CHECKLIST, PAYOUT_METHODS, RECEIVED_BEFORE, TODAY_AGENDA, getCoach } from "@/lib/data/coaches";
import { useDemo } from "@/lib/demo-store";
import { money } from "@/lib/format";
import type { BookingRequest, PaymentRow } from "@/lib/types";

type ConsoleTab = "today" | "pay" | "page";

/** Coach tab bar: 今天 · 收款 · 我的招生頁 · 課程與時段, with pending/reported badges. */
function CoachTabs({ active }: { active: ConsoleTab }) {
  const toast = useToast();
  const { requests, payments } = useDemo();
  const pend = requests.filter((r) => r.status === "pending").length;
  const rep = payments.filter((p) => p.status === "reported").length;
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
      {tab("pay", "/coach/payments", "wallet", "收款", rep)}
      {tab("page", "/coach/profile", "user", "我的招生頁")}
      <button className="tab" onClick={() => toast("課程與時段：建立課程範本、批次新增場次（下一輪）")}>
        <span style={{ position: "relative" }}><Icon name="cal" size={22} /></span>
        課程與時段
      </button>
    </nav>
  );
}

function RequestCard({ r }: { r: BookingRequest }) {
  const toast = useToast();
  const { confirmRequest } = useDemo();
  return (
    <article className={`req${r.status !== "pending" ? " done" : ""}`}>
      <div className="req-top">
        <span className="avatar">{r.initial}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>{r.name}</b>
          <div className="text-muted" style={{ fontSize: 13 }}>{r.level}・{r.firstTime ? "第一次上你的課" : `上過 ${r.times} 次`}</div>
        </div>
        <span className="num req-p">{money(r.amount)}</span>
      </div>
      <div className="req-m"><Icon name="cal" size={15} /><span>{r.when}・{r.plan}</span></div>
      {r.note && <p className="req-note">「{r.note}」</p>}
      {r.status === "pending" ? (
        <>
          <div className="btnrow btnrow-tight">
            <button className="btn btn-secondary" onClick={() => { confirmRequest(r.id, false); toast("已婉拒，會通知學生並推薦其他時段"); }}>婉拒</button>
            <button className="btn btn-primary" onClick={() => { confirmRequest(r.id, true); toast(`已確認，並用 LINE 傳 ${r.pay} 付款資訊給 ${r.name}`); }}>確認預約</button>
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

/** F5-5 教練首頁「今天」: pending bookings, this week, money still due; one-tap confirm sends payment info via LINE. */
export function CoachTodayScreen() {
  const toast = useToast();
  const { requests, payments } = useDemo();
  const pend = requests.filter((r) => r.status === "pending");
  const due = payments.filter((p) => p.status !== "paid").reduce((a, p) => a + p.amount, 0);
  return (
    <>
      <div className="scroll" style={{ paddingBottom: 24 }}>
        <div className="home-hero home-hero-coach carbon">
          <div className="home-top">
            <span className="role-pill"><Icon name="cap" size={14} />教練模式</span>
            <button className="rbtn" onClick={() => toast("通知")} aria-label="通知"><Icon name="bell" size={20} /></button>
          </div>
          <h1 style={{ margin: "20px 0 2px", fontSize: 28 }}>早安，Mia</h1>
          <p style={{ margin: 0, color: "var(--color-on-carbon-muted)" }}>今天 2 堂課，<span className="hl">{pend.length} 筆預約</span>等你確認</p>
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
          <div className="stack">{requests.map((r) => <RequestCard key={r.id} r={r} />)}</div>
        </section>
        <section className="sec">
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
      <div className="scroll" style={{ paddingBottom: 24 }}>
        <div className="paysum carbon">
          <small>10 月</small>
          <div className="paysum-row">
            <div><span>已收</span><b className="num">{money(got)}</b></div>
            <div><span>待收</span><b className="num" style={{ color: "var(--color-accent)" }}>{money(due)}</b></div>
          </div>
          <div className="bar"><i style={{ width: `${Math.round((got / (got + due)) * 100)}%` }} /></div>
        </div>
        <div className="pad" style={{ paddingTop: 16 }}>
          <div className="seg seg-tight" style={{ display: "flex" }} role="radiogroup">
            {opts.map(([k, l]) => (
              <label key={k} className="seg-opt">
                <input type="radio" name="pf" checked={filter === k} onChange={() => setFilter(k)} />
                {l}
              </label>
            ))}
          </div>
        </div>
        <div className="pad stack" style={{ paddingTop: 12 }}>
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
      </div>
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

/** F5-2/F5-7 我的招生頁: short link for IG/Threads bios, funnel stats, one-tap share assets, completeness, card preview. */
export function CoachProfileScreen() {
  const c = getCoach("mia")!;
  const slug = c.profile!.slug;
  const pct = Math.round((PAGE_CHECKLIST.filter((x) => x[1]).length / PAGE_CHECKLIST.length) * 100);
  return (
    <>
      <AppBar
        title="我的招生頁"
        action={<SoonButton className="btn btn-ghost btn-icon" msg="編輯教練頁（所見即所得）" aria-label="編輯"><Icon name="edit" size={22} /></SoonButton>}
      />
      <div className="scroll" style={{ paddingBottom: 24 }}>
        <section className="sec" style={{ paddingTop: 16 }}>
          <div className="linkcard">
            <div style={{ flex: 1, minWidth: 0 }}>
              <small className="text-muted">你的專屬連結，放在 IG／Threads 個人簡介</small>
              <div className="num" style={{ fontSize: 20, fontWeight: 600 }}>{slug}</div>
            </div>
            <CopyButton text={`https://${slug}`} label={slug} />
          </div>
          <div className="kpis">
            <div><b className="num">412</b><span>本週瀏覽</span></div>
            <div><b className="num">18</b><span>點預約</span></div>
            <div><b className="num">9</b><span>成功預約</span></div>
          </div>
        </section>

        <section className="sec">
          <div className="sec-head"><h2><span className="en">Share</span>分享招生素材</h2></div>
          <p className="fine" style={{ margin: "-4px 0 12px" }}>一鍵產生，圖上自動帶課程、時間、價格和短網址</p>
          <div className="assets">
            <SoonButton className="asset" msg="下載 IG 限動圖 1080×1920">
              <div className="a-story carbon">
                <PkMark size={22} style={{ color: "#fff" }} />
                <b>新手體驗課</b>
                <span className="num">10/4 SUN 10:00</span>
                <span className="num a-price">NT$600</span>
                <i>{slug}</i>
              </div>
              <span>限動 9:16</span>
            </SoonButton>
            <SoonButton className="asset" msg="下載 Threads／IG 貼文圖 1080×1350">
              <div className="a-post">
                <div className="ph" style={{ height: "52%", borderRadius: 4 }}>照片</div>
                <b>Mia 林｜協會認證</b>
                <span>新手體驗 NT$600 起</span>
              </div>
              <span>貼文 4:5</span>
            </SoonButton>
            <SoonButton className="asset" msg="分享 LINE Flex 卡片到群組">
              <div className="a-flex">
                <div className="carbon" style={{ padding: 8, borderRadius: "6px 6px 0 0" }}>
                  <span className="num" style={{ fontSize: 18, fontWeight: 600 }}>10:00</span>
                  <small style={{ display: "block", opacity: 0.7 }}>10/4 大安運動中心</small>
                </div>
                <div style={{ padding: "6px 8px", fontSize: 10 }}>新手體驗課・剩 2</div>
                <div className="a-btn">預約</div>
              </div>
              <span>LINE 卡片</span>
            </SoonButton>
          </div>
        </section>

        <section className="sec">
          <div className="sec-head"><h2>頁面完整度</h2><b className="num" style={{ fontSize: 20 }}>{pct}%</b></div>
          <div className="bar light"><i style={{ width: `${pct}%` }} /></div>
          <ul className="checklist">
            {PAGE_CHECKLIST.map(([t, ok]) => (
              <li key={t} className={ok ? "ok" : ""}>
                <i>{ok && <Icon name="check" size={12} stroke={3} />}</i>
                {t}
                {!ok && <SoonButton className="linkbtn" msg="上傳 30 秒教學影片">補上</SoonButton>}
              </li>
            ))}
          </ul>
        </section>

        <section className="sec">
          <div className="sec-head"><h2>預覽</h2></div>
          <p className="fine" style={{ margin: "-4px 0 12px" }}>學生在列表看到的卡片</p>
          <CoachCard coach={c} />
          <Link className="btn btn-secondary btn-block" style={{ marginTop: 12 }} href={`/coaches/${c.id}`}>看學生看到的完整頁面</Link>
        </section>
      </div>
      <CoachTabs active="page" />
    </>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const toast = useToast();
  return (
    <button
      className="btn btn-primary"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* clipboard may be blocked (e.g. LINE in-app browser) */ }
        toast(`已複製 ${label}`);
      }}
    >
      <Icon name="copy" size={18} />複製
    </button>
  );
}
