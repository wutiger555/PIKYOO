"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cred } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { Crumbs } from "@/components/pk/Crumbs";
import { AppBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { useToast } from "@/components/pk/Toast";
import { useDemo } from "@/lib/demo-store";
import { money } from "@/lib/format";
import { Img } from "../coaches/CoachCard";
import { useDemoJoin, useGroupView } from "./GroupScreen";

/** What a friend sees after tapping the invite link: who, which coach, when, their share — join with their own LINE account. */
export function GroupInviteScreen({ id }: { id: string }) {
  const toast = useToast();
  const router = useRouter();
  const { groups } = useDemo();
  const g = groups.find((x) => x.id === id);
  const { c, plan, day, range, n } = useGroupView(g);
  const demo = useDemoJoin(g);

  if (!g || !c || !plan || !day) {
    return (
      <>
        <AppBar title="邀請" back="/" />
        <div className="scroll dk dk-narrow"><TopNav /><div className="empty-s" style={{ paddingTop: 64 }}><h3>這個邀請已失效</h3><Link className="btn btn-primary" href="/coaches">看看其他教練</Link></div></div>
      </>
    );
  }
  const cover = c.profile.photos[0];
  const left = range.max - n;

  return (
    <>
      <AppBar title="朋友邀你上課" back={`/groups/${g.id}`} />
      <div className="scroll dk dk-narrow dk-float" style={{ paddingBottom: 24 }}>
        <TopNav />
        <Crumbs items={[["首頁", "/"], ["朋友邀你上課"]]} />
        <div className="invite-cover">
          {cover && <Img src={cover.src} alt={cover.alt} sizes="480px" />}
        </div>
        <div className="sec" style={{ paddingTop: "var(--space-4)" }}>
          <span className="en">Invitation</span>
          <h1 style={{ margin: "0 0 4px", fontSize: 26 }}>{g.host} 邀你一起上{plan.name}</h1>
          <p className="text-muted" style={{ margin: 0 }}>{c.name}・{c.profile.venues[0].name}</p>
          <div className="chero-creds" style={{ marginTop: 10 }}>{c.creds.map((x, i) => <Cred key={i} c={x} />)}</div>
        </div>
        <div className="pad" style={{ marginTop: "var(--space-4)" }}>
          <div className="sum">
            <span className="text-muted" style={{ fontSize: 13 }}>{day.date}（{day.weekday}）</span>
            <span className="big">{g.slot}・{plan.durationMin} 分鐘</span>
            <span>每人 <b className="num" style={{ fontSize: 18 }}>{money(plan.price)}</b>，教練確認後再各自付款</span>
          </div>
          <p style={{ margin: "var(--space-4) 0 var(--space-2)", fontWeight: 700 }}>已經有 {n} 人加入{left > 0 ? `，還有 ${left} 個位子` : "，已滿"}</p>
          <div className="wrapchips">{g.members.map((m) => <span key={m.name} className="tag tag-neutral">{m.name}</span>)}</div>
          {g.note && <p className="fine">「{g.note}」</p>}
        </div>
      </div>
      <div className="sticky-cta">
        <div className="sticky-cta-info"><span className="sticky-cta-price">{money(plan.price)}</span><span className="sticky-cta-sub">你的部分</span></div>
        {demo.canJoin ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => { demo.join(); toast(`已用 LINE 加入（Demo：以 ${demo.next!.name} 的身分）`); router.push(`/groups/${g.id}`); }}
          >
            <Icon name="msg" size={18} />用 LINE 加入
          </button>
        ) : (
          <Link className="btn btn-secondary btn-lg" href={`/coaches/${c.id}`}>看教練頁</Link>
        )}
      </div>
    </>
  );
}
