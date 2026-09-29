"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pk/Icon";
import { PkMark } from "@/components/pk/Logo";
import { TabBar } from "@/components/pk/Shell";
import { BOOKING_DAYS, slotsFor } from "@/lib/data/coaches";
import { shortAreas } from "@/lib/data/courts";
import { useCoaches, useDemo } from "@/lib/demo-store";
import { LEVELS, money } from "@/lib/format";
import type { LessonType } from "@/lib/types";
import { CoachMini } from "../coaches/CoachCard";

const TYPES: LessonType[] = ["體驗課", "一對一", "小班", "團體"];

/** 首頁 — courses first: pick what you want to learn, recommended coaches, sessions you can book soon, 揪朋友. Games and courts sit below. */
export function HomeScreen() {
  const router = useRouter();
  const { profile, setCoachFilters, booking, groups } = useDemo();
  const coaches = useCoaches();
  const fit = coaches.filter((c) => profile.level >= c.levelMin && profile.level <= c.levelMax);
  const rail = [...fit, ...coaches.filter((c) => !fit.includes(c))];
  const gathering = groups.find((g) => g.status === "gathering");
  const gMin = gathering ? coaches.find((c) => c.id === gathering.coachId)?.profile.plans.find((p) => p.id === gathering.planId)?.group?.min ?? 2 : 0;

  // Soonest open sessions across coaches whose level range fits me.
  const soon = BOOKING_DAYS.flatMap((d) =>
    fit.flatMap((c) => slotsFor(c, d).filter(([, left]) => left > 0).map(([t, left]) => ({ c, d, t, left, plan: c.profile.plans[0] }))),
  ).slice(0, 4);

  const want = (t: LessonType) => {
    setCoachFilters((p) => ({ ...p, type: t, level: profile.level }));
    router.push("/coaches");
  };

  return (
    <>
      <div className="scroll">
        <div className="home-hero carbon">
          <div className="home-top">
            <PkMark size={30} style={{ color: "#fff" }} />
            <Link className="loc" href="/welcome">
              <Icon name="pin" size={16} />
              {shortAreas(profile.areas)}
              <Icon name="down" size={16} />
            </Link>
          </div>
          <h1 style={{ margin: "var(--space-6) 0 0", fontSize: 30 }}>嗨，{profile.name}</h1>
          <p style={{ margin: "2px 0 var(--space-4)", color: "var(--color-on-carbon-muted)" }}>
            你是 <span className="hl">{LEVELS[profile.level]}</span>，想上什麼課？
          </p>
          <div className="want">
            {TYPES.map((t) => (
              <button key={t} className="want-b" onClick={() => want(t)}>
                <Icon name={t === "一對一" ? "user" : t === "體驗課" ? "sprout" : "users"} size={20} />
                {t}
              </button>
            ))}
          </div>
        </div>

        {(booking.slot || gathering) && (
          <Link href={gathering && !booking.slot ? `/groups/${gathering.id}` : "/me/booking"} className="card next-lesson">
            <Icon name="cal" size={22} />
            <div style={{ flex: 1 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{gathering && !booking.slot ? (gathering.members.length >= gMin ? "揪團人數到齊了，送給教練吧" : `揪團中：還差 ${gMin - gathering.members.length} 人`) : "你的下一堂課"}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>點進去看進度</div>
            </div>
            <Icon name="right" size={18} />
          </Link>
        )}

        <div className="sec" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="sec-head pad">
            <h2><span className="en">Coaches</span>適合你的教練</h2>
            <Link href="/coaches">看全部</Link>
          </div>
          <div className="hscroll">{rail.map((c) => <CoachMini key={c.id} coach={c} />)}</div>
        </div>

        <div className="sec">
          <div className="sec-head">
            <h2><span className="en">Book soon</span>近期可約</h2>
            <Link href="/coaches">更多時段</Link>
          </div>
          <div className="card" style={{ padding: "0 var(--space-4)", gap: 0 }}>
            {soon.map(({ c, d, t, left, plan }) => (
              <Link key={c.id + d.key + t} href={`/coaches/${c.id}/book?plan=${plan.id}`} className="row-item soon">
                <span className="soon-t"><b className="num">{t}</b><small>{d.date} 週{d.weekday}</small></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b>{plan.name}</b>
                  <small className="text-muted" style={{ display: "block", fontSize: 13 }}>{c.name}・剩 {left} 位</small>
                </span>
                <span className="num" style={{ fontSize: 18, fontWeight: 600 }}>{money(plan.price)}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link href="/coaches" className="friends" onClick={() => setCoachFilters((p) => ({ ...p, type: "小班" }))}>
          <div style={{ flex: 1 }}>
            <span className="en">Bring friends</span>
            <h3 style={{ margin: "0 0 4px" }}>揪朋友一起上課</h3>
            <p style={{ margin: 0, fontSize: 14 }}>選一堂小班課，傳連結給朋友，各自用自己的帳號加入、各自付款，每人比一對一便宜。</p>
          </div>
          <span className="friends-seats" aria-hidden="true"><i className="you" /><i /><i className="open" /><i className="open" /></span>
        </Link>

        <div className="sec" style={{ paddingBottom: "var(--space-6)" }}>
          <div className="sec-head"><h2><span className="en">More</span>也可以</h2></div>
          <div className="card" style={{ padding: "0 var(--space-4)", gap: 0 }}>
            <Link href="/games" className="row-item"><Icon name="court" size={22} /><span style={{ flex: 1 }}>找球友打球<small className="text-muted" style={{ display: "block", fontSize: 13 }}>上完課，找一局程度差不多的來打</small></span><Icon name="right" size={18} /></Link>
            <Link href="/courts" className="row-item"><Icon name="pin" size={22} /><span style={{ flex: 1 }}>找球場<small className="text-muted" style={{ display: "block", fontSize: 13 }}>雙北球場與預約方式</small></span><Icon name="right" size={18} /></Link>
            <Link href="/learn" className="row-item"><Icon name="sprout" size={22} /><span style={{ flex: 1 }}>第一次打匹克球？<small className="text-muted" style={{ display: "block", fontSize: 13 }}>規則與程度自評</small></span><Icon name="right" size={18} /></Link>
          </div>
        </div>
      </div>
      <TabBar active="home" />
    </>
  );
}
