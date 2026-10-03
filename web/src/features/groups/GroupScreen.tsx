"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Status } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { Crumbs } from "@/components/pk/Crumbs";
import { AppBar, SoonButton } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { useToast } from "@/components/pk/Toast";
import { BOOKING_DAYS } from "@pikyoo/core/data/coaches";
import { useCoach, useDemo } from "@/lib/demo-store";
import { money } from "@pikyoo/core/format";
import type { Group, GroupMember } from "@pikyoo/core/types";
import { Img, Photo } from "../coaches/CoachCard";

// Friends the demo can "invite"; in the real app each joins with their own LINE account.
const DEMO_FRIENDS: GroupMember[] = [{ name: "Jason", initial: "J" }, { name: "小周", initial: "周" }, { name: "Peggy", initial: "P" }];

export function useGroupView(g: Group | undefined) {
  const c = useCoach(g?.coachId ?? "");
  const plan = c?.profile.plans.find((x) => x.id === g?.planId);
  const day = BOOKING_DAYS.find((d) => d.key === g?.dayKey);
  const range = plan?.group ?? { min: 2, max: 4 };
  return { c, plan, day, range, n: g?.members.length ?? 0 };
}

/** The next friend the demo adds when someone "opens the invite link". */
export function useDemoJoin(g: Group | undefined) {
  const { updateGroup } = useDemo();
  const { range } = useGroupView(g);
  const next = g ? DEMO_FRIENDS.find((f) => !g.members.some((m) => m.name === f.name)) : undefined;
  const canJoin = !!g && !!next && g.members.length < range.max && g.status === "gathering";
  return { next, canJoin, join: () => g && next && updateGroup(g.id, (x) => ({ ...x, members: [...x.members, next] })) };
}

const STATUS: Record<Group["status"], [string, "almost" | "info" | "open" | "ended"]> = {
  gathering: ["揪團中", "almost"],
  requested: ["等教練確認", "info"],
  confirmed: ["教練已確認", "open"],
  declined: ["教練婉拒", "ended"],
};

/** 揪朋友一起上（發起人）: seats filling up, invite link, send to coach at min, then each member pays their share. */
export function GroupScreen({ id }: { id: string }) {
  const toast = useToast();
  const router = useRouter();
  const { groups, submitGroup, confirmRequest, updateGroup } = useDemo();
  const g = groups.find((x) => x.id === id);
  const { c, plan, day, range, n } = useGroupView(g);
  const demo = useDemoJoin(g);

  if (!g || !c || !plan || !day) {
    return (
      <>
        <AppBar title="揪團" back="/me/lessons" />
        <div className="scroll dk dk-narrow"><TopNav /><div className="empty-s" style={{ paddingTop: 64 }}><h3>找不到這個揪團</h3><Link className="btn btn-primary" href="/coaches">找教練</Link></div></div>
      </>
    );
  }

  const short = Math.max(0, range.min - n);
  const link = `pikyoo.tw/j/${g.id}`;
  const me = g.members.find((m) => m.you);
  const cover = c.profile.photos[1] ?? c.profile.photos[0];

  const copy = async () => {
    try { await navigator.clipboard.writeText(`https://${link}`); } catch { /* blocked in some in-app browsers */ }
    toast("邀請連結已複製");
  };

  let cta: React.ReactNode;
  if (g.status === "gathering") {
    cta = short > 0 ? (
      <>
        <div className="sticky-cta-info"><span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>還差 {short} 人</span><span className="sticky-cta-sub">滿 {range.min} 人就能送給教練</span></div>
        <button className="btn btn-primary btn-lg" onClick={() => toast("已開啟 LINE 分享（選擇朋友或群組）")}>邀請朋友</button>
      </>
    ) : (
      <>
        <div className="sticky-cta-info"><span className="sticky-cta-price" style={{ fontSize: 18, fontFamily: "var(--font-body)", fontWeight: 700 }}>{n} 人到齊</span><span className="sticky-cta-sub">{n < range.max ? `還能再加 ${range.max - n} 人` : "已滿"}</span></div>
        <button className="btn btn-primary btn-lg" onClick={() => { submitGroup(g.id); toast(`已送給 ${c.name}，確認後會用 LINE 通知大家`); }}>送給教練</button>
      </>
    );
  } else if (g.status === "confirmed" && me && !me.paid) {
    cta = (
      <>
        <div className="sticky-cta-info"><span className="sticky-cta-price">{money(plan.price)}</span><span className="sticky-cta-sub">你的部分，各自付款</span></div>
        <button className="btn btn-primary btn-lg" onClick={() => { updateGroup(g.id, (x) => ({ ...x, members: x.members.map((m) => (m.you ? { ...m, paid: true } : m)) })); toast("付款完成，已通知教練"); }}>付我的部分</button>
      </>
    );
  }

  return (
    <>
      <AppBar title="揪朋友一起上" back="/me/lessons" />
      <div className="scroll dk dk-narrow dk-float" style={{ paddingBottom: 24 }}>
        <TopNav />
        <Crumbs items={[["首頁", "/"], ["我的課", "/me/lessons"], ["揪朋友一起上"]]} />
        <div className="grp-hero carbon">
          <div className="grp-cover">{cover && <Img src={cover.src} alt={cover.alt} sizes="480px" />}</div>
          <div className="grp-body">
            <Status tone={STATUS[g.status][1]}>{STATUS[g.status][0]}</Status>
            <h1>{plan.name}</h1>
            <div className="grp-when"><b className="num">{day.date}（{day.weekday}）{g.slot}</b><span>{plan.durationMin} 分鐘・{c.profile.venues[0].name}</span></div>
            <Link href={`/coaches/${c.id}`} className="grp-coach"><Photo coach={c} size="xs" /><span>{c.name}</span><Icon name="right" size={16} /></Link>
          </div>
        </div>

        <section className="blk">
          <div className="blk-h"><h2>成員 {n}/{range.max}</h2><span className="text-muted" style={{ fontSize: 13 }}>滿 {range.min} 人開課</span></div>
          <div className="grp-seats" aria-label={`已加入 ${n} 人，最少 ${range.min} 人，最多 ${range.max} 人`}>
            {Array.from({ length: range.max }, (_, i) => {
              const m = g.members[i];
              return (
                <span key={i} className={`seat${m ? (m.you ? " you" : "") : " open"}${i === range.min - 1 ? " min" : ""}`}>{m ? (m.you ? "你" : m.initial) : ""}</span>
              );
            })}
          </div>
          <div className="people" style={{ marginTop: 8 }}>
            {g.members.map((m, i) => (
              <div key={m.name} className="row-item">
                <span className="avatar" style={m.you ? { background: "var(--color-accent)", color: "var(--color-text)" } : undefined}>{m.initial}</span>
                <span style={{ flex: 1 }}>{m.name}{m.you ? "（你）" : ""}</span>
                {i === 0 && <span className="tag tag-accent">發起人</span>}
                {g.status === "confirmed" && <Status tone={m.paid ? "open" : "almost"}>{m.paid ? "已付款" : "待付款"}</Status>}
              </div>
            ))}
          </div>
          {demo.canJoin && (
            <button className="btn btn-ghost demo-btn" onClick={() => { demo.join(); toast(`${demo.next!.name} 從邀請連結加入了`); }}>
              <Icon name="info" size={16} />Demo：模擬 {demo.next!.name} 從連結加入
            </button>
          )}
        </section>

        {g.status === "gathering" && (
          <section className="blk">
            <h2>邀請朋友</h2>
            <p className="text-muted" style={{ margin: "-4px 0 12px" }}>朋友點連結，用自己的 LINE 帳號加入，之後各自付款、各自收到上課提醒。</p>
            <div className="linkcard">
              <div style={{ flex: 1, minWidth: 0 }}><small className="text-muted">邀請連結</small><div className="num" style={{ fontSize: 18, fontWeight: 600 }}>{link}</div></div>
              <button className="btn btn-secondary" onClick={copy}><Icon name="copy" size={18} />複製</button>
            </div>
            <Link className="linklike" style={{ display: "inline-block", marginTop: 12 }} href={`/groups/${g.id}/invite`}>看朋友收到的畫面</Link>
          </section>
        )}

        {g.status === "requested" && (
          <section className="blk">
            <h2>等 {c.name} 確認</h2>
            <p className="text-muted">{c.profile.reply}。48 小時沒處理會自動取消，大家都會收到 LINE 通知。</p>
            <button className="btn btn-ghost demo-btn" onClick={() => { confirmRequest("r-" + g.id, true); toast(`${c.name} 確認了這堂課`); }}>
              <Icon name="info" size={16} />Demo：模擬教練確認（也可以到教練後台按）
            </button>
          </section>
        )}

        {g.status === "confirmed" && (
          <section className="blk">
            <h2>{me?.paid ? "你的部分付好了" : "各自付款"}</h2>
            <p className="text-muted">每人 {money(plan.price)}，付款方式：{c.profile.pay.join("、")}。{c.profile.policy}</p>
          </section>
        )}

        {g.note && (
          <section className="blk" style={{ borderBottom: 0 }}>
            <h2>給教練的備註</h2>
            <p style={{ margin: 0 }}>{g.note}</p>
          </section>
        )}
        {g.status === "gathering" && (
          <SoonButton className="btn btn-ghost btn-block" msg="取消揪團會通知已加入的朋友">取消揪團</SoonButton>
        )}
        {g.status === "declined" && (
          <div className="pad"><button className="btn btn-secondary btn-block" onClick={() => router.push(`/coaches/${c.id}/book?plan=${plan.id}&with=friends`)}>換個時段再揪</button></div>
        )}
      </div>
      {cta && <div className="sticky-cta">{cta}</div>}
    </>
  );
}
