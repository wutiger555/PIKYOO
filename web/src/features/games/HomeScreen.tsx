"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { PkMark } from "@/components/pk/Logo";
import { LoginSheet } from "@/components/pk/LoginSheet";
import { TabBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { BOOKING_DAYS, slotsFor } from "@pikyoo/core/data/coaches";
import { COURTS, shortAreas } from "@pikyoo/core/data/courts";
import { GAMES } from "@pikyoo/core/data/games";
import { useCoaches, useDemo } from "@/lib/demo-store";
import { LEVELS, money } from "@pikyoo/core/format";
import type { LessonType } from "@pikyoo/core/types";
import { CoachMini, Img } from "../coaches/CoachCard";

const TYPES: LessonType[] = ["體驗課", "一對一", "小班", "團體"];

/** 首頁: a visitor gets the PIKYOO landing that asks them to sign up; a signed-in student gets their own home.
 *  Desktop (`.dk`, ≥1024px): top nav; the member home becomes two columns (docs/DESKTOP.md §5.3). */
export function HomeScreen() {
  const { signedIn } = useDemo();
  const [login, setLogin] = useState(false);
  return (
    <>
      <div className="scroll dk home">
        <TopNav active="home" />
        {signedIn ? <MemberHome /> : <GuestHome onSignUp={() => setLogin(true)} />}
      </div>
      <TabBar active="home" />
      {login && <LoginSheet onClose={() => setLogin(false)} reason="註冊後可以預約課程、揪朋友、報名球局" />}
    </>
  );
}

/** Courses first: pick what you want to learn, recommended coaches, sessions you can book soon, 揪朋友. Games and courts sit below. */
function MemberHome() {
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

  const nextCard = booking.slot || gathering ? (
    <Link href={gathering && !booking.slot ? `/groups/${gathering.id}` : "/me/booking"} className="card next-lesson">
      <Icon name="cal" size={22} />
      <div style={{ flex: 1 }}>
        <div className="card-title" style={{ fontSize: 16 }}>{gathering && !booking.slot ? (gathering.members.length >= gMin ? "揪團人數到齊了，送給教練吧" : `揪團中：還差 ${gMin - gathering.members.length} 人`) : "你的下一堂課"}</div>
        <div className="text-muted" style={{ fontSize: 13 }}>點進去看進度</div>
      </div>
      <Icon name="right" size={18} />
    </Link>
  ) : null;
  const friendsCard = (
    <Link href="/coaches" className="friends" onClick={() => setCoachFilters((p) => ({ ...p, type: "小班" }))}>
      <div style={{ flex: 1 }}>
        <span className="en">Bring friends</span>
        <h3 style={{ margin: "0 0 4px" }}>揪朋友一起上課</h3>
        <p style={{ margin: 0, fontSize: 14 }}>選一堂小班課，傳連結給朋友，各自用自己的帳號加入、各自付款，每人比一對一便宜。</p>
      </div>
      <span className="friends-seats" aria-hidden="true"><i className="you" /><i /><i className="open" /><i className="open" /></span>
    </Link>
  );
  const moreCard = (
    <div className="sec" style={{ paddingBottom: "var(--space-6)" }}>
      <div className="sec-head"><h2><span className="en">More</span>也可以</h2></div>
      <div className="card" style={{ padding: "0 var(--space-4)", gap: 0 }}>
        <Link href="/games" className="row-item"><Icon name="court" size={22} /><span style={{ flex: 1 }}>找球友打球<small className="text-muted" style={{ display: "block", fontSize: 13 }}>上完課，找一局程度差不多的來打</small></span><Icon name="right" size={18} /></Link>
        <Link href="/courts" className="row-item"><Icon name="pin" size={22} /><span style={{ flex: 1 }}>找球場<small className="text-muted" style={{ display: "block", fontSize: 13 }}>雙北球場與預約方式</small></span><Icon name="right" size={18} /></Link>
        <Link href="/learn" className="row-item"><Icon name="sprout" size={22} /><span style={{ flex: 1 }}>第一次打匹克球？<small className="text-muted" style={{ display: "block", fontSize: 13 }}>規則與程度自評</small></span><Icon name="right" size={18} /></Link>
      </div>
    </div>
  );

  // The side cards render twice: in phone order inside the main column, and in the desktop side column.
  return (
    <div className="home-grid">
      <div className="hg-main">
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

        {nextCard && <div className="mb-only">{nextCard}</div>}

        <div className="sec" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="sec-head pad">
            <h2><span className="en">Coaches</span>適合你的教練</h2>
            <Link href="/coaches">看全部</Link>
          </div>
          <div className="hscroll home-rail">{rail.map((c) => <CoachMini key={c.id} coach={c} />)}</div>
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

        <div className="mb-only">{friendsCard}{moreCard}</div>
      </div>
      <aside className="hg-side dk-only">{nextCard}{friendsCard}{moreCard}</aside>
    </div>
  );
}

const STEPS: [string, string][] = [
  ["用 LINE 登入", "免費，第一次登入就自動建立帳號，不用填表。"],
  ["選教練與時段", "每位教練都用同一種格式列出價格、程度和認證，選好時段直接送出。"],
  ["教練確認後付款上課", "教練確認才需要付款，LINE Pay、轉帳或現場付都可以。"],
];

/** Visitor landing: what PIKYOO is, the three things you can do, featured coaches, and sign-up calls to action. */
function GuestHome({ onSignUp: signUp }: { onSignUp: () => void }) {
  const coaches = useCoaches();
  const entries: [string, string, string, "whistle" | "court" | "pin"][] = [
    ["/coaches", "找教練", `${coaches.length} 位教練，價格、程度、認證一眼比較`, "whistle"],
    ["/games", "找球局", `這週 ${GAMES.length} 場球局，照程度找人一起打`, "court"],
    ["/courts", "找球場", `雙北 ${COURTS.length} 個球場與預約方式`, "pin"],
  ];
  return (
    <div className="guest">
      <section className="gh-hero carbon">
        <div className="gh-copy">
          <div className="home-top mb-only"><PkMark size={30} style={{ color: "#fff" }} /></div>
          <span className="en">Pickleball in Taipei</span>
          <h1>雙北匹克球，<br />從第一堂課開始。</h1>
          <p>比較教練的價格、程度和認證，選好時段直接預約。也能揪朋友一起上，或找程度差不多的球局。</p>
          <div className="gh-cta">
            <button className="btn btn-primary btn-lg" onClick={signUp}>用 LINE 免費註冊</button>
            <Link className="btn btn-secondary btn-lg" href="/coaches">先看看教練</Link>
          </div>
        </div>
        <div className="gh-photo dk-only"><Img src="/photos/mia-group.jpg" alt="兩位學員在室內球場對打練習" sizes="560px" priority /></div>
      </section>

      <section className="sec">
        <div className="gh-entries">
          {entries.map(([href, t, sub, icon]) => (
            <Link key={href} href={href} className="card gh-entry">
              <Icon name={icon} size={26} />
              <span className="card-title">{t}</span>
              <span className="text-muted" style={{ fontSize: 14 }}>{sub}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="sec" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div className="sec-head pad">
          <h2><span className="en">Coaches</span>精選教練</h2>
          <Link href="/coaches">看全部</Link>
        </div>
        <div className="hscroll home-rail">{coaches.map((c) => <CoachMini key={c.id} coach={c} />)}</div>
      </section>

      <section className="sec">
        <div className="sec-head"><h2><span className="en">How it works</span>怎麼開始</h2></div>
        <ol className="gh-steps">
          {STEPS.map(([t, d], i) => (
            <li key={t}><span className="num">{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>
          ))}
        </ol>
      </section>

      <section className="gh-final">
        <div>
          <h2>第一次打匹克球？</h2>
          <p>註冊後做 3 分鐘程度自評，我們幫你找適合的體驗課與新手友善局。</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={signUp}>用 LINE 免費註冊</button>
      </section>
    </div>
  );
}
