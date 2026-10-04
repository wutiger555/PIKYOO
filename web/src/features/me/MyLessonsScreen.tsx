"use client";

import Link from "next/link";
import { useState } from "react";
import { Status } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import { Crumbs } from "@/components/pk/Crumbs";
import { SoonButton, TabBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { bookingDays } from "@pikyoo/core/data/coaches";
import { demoDate } from "@pikyoo/core/data/today";
import { useCoaches, useDemo } from "@/lib/demo-store";
import { money } from "@pikyoo/core/format";
import type { MyBooking } from "@pikyoo/core/source/bookings";
import type { Group } from "@pikyoo/core/types";
import { Photo } from "../coaches/CoachCard";

type Tab = "next" | "group" | "done";

const BOOKING_STATE = { pending: ["待教練確認", "almost"], confirmed: ["待付款", "info"], reported: ["等教練對帳", "info"], paid: ["已付款", "open"] } as const;
const GROUP_STATE: Record<Group["status"], [string, "almost" | "info" | "open" | "ended"]> = {
  gathering: ["揪團中", "almost"], requested: ["等教練確認", "info"], confirmed: ["教練已確認", "open"], declined: ["教練婉拒", "ended"],
};

// Mock history for the demo: a lesson nine days ago.
const history = () => [{ coachId: "mia", plan: "新手體驗課", when: `${demoDate(-9)}10:00` }];

const LIVE_STATE: Record<MyBooking["state"], [string, "almost" | "info" | "open" | "ended"]> = {
  pending: ["待教練確認", "almost"], confirmed: ["教練已確認", "open"], done: ["已上課", "ended"],
  declined: ["教練婉拒", "ended"], expired: ["已逾時", "ended"], cancelled: ["已取消", "ended"],
};

/** A real booking (real sign-in): opens its status page. */
function LiveRow({ x }: { x: MyBooking }) {
  const [label, tone] = LIVE_STATE[x.state];
  return (
    <Link href={`/me/booking?id=${x.id}`} className="lesson">
      <div className="lesson-t"><b className="num">{x.day.date}</b><small>週{x.day.weekday}</small><span className="num">{x.booking.slot}</span></div>
      <div className="lesson-b">
        <b>{x.planName}</b>
        <span className="text-muted">{x.coachName}・{money(x.amount)}</span>
        <Status tone={tone}>{label}</Status>
      </div>
      <Icon name="right" size={18} />
    </Link>
  );
}

/** 我的課: upcoming lessons, 揪團 in progress, and past lessons to review.
 *  `live`: the student's bookings from the database (real sign-in); 揪團 is demo-only for now (PLAN D7). */
export function MyLessonsScreen({ live }: { live?: MyBooking[] }) {
  const { booking, groups } = useDemo();
  const coaches = useCoaches();
  const coach = (id: string) => coaches.find((c) => c.id === id)!;
  const gathering = groups.filter((g) => g.status === "gathering" || g.status === "requested");
  const confirmedGroups = groups.filter((g) => g.status === "confirmed");
  const [tab, setTab] = useState<Tab>(gathering.length && !booking.slot ? "group" : "next");
  const day = (key: string) => bookingDays().find((d) => d.key === key)!;

  const groupRow = (g: Group) => {
    const c = coach(g.coachId);
    const plan = c.profile.plans.find((p) => p.id === g.planId)!;
    const d = day(g.dayKey);
    return (
      <Link key={g.id} href={`/groups/${g.id}`} className="lesson">
        <div className="lesson-t"><b className="num">{d.date}</b><small>週{d.weekday}</small><span className="num">{g.slot}</span></div>
        <div className="lesson-b">
          <b>{plan.name}</b>
          <span className="text-muted">{c.name}・{g.members.length}/{plan.group?.max ?? 4} 人・每人 {money(plan.price)}</span>
          <Status tone={GROUP_STATE[g.status][1]}>{GROUP_STATE[g.status][0]}</Status>
        </div>
        <Icon name="right" size={18} />
      </Link>
    );
  };

  let body: React.ReactNode;
  if (live) {
    const open = (x: MyBooking) => x.state === "pending" || x.state === "confirmed";
    const rows = tab === "next" ? [...live].filter(open).reverse() : live.filter((x) => !open(x));
    body = rows.length
      ? <div className="stack">{rows.map((x) => <LiveRow key={x.id} x={x} />)}</div>
      : <Empty text={tab === "next" ? "還沒有預約的課。找一位教練，選好時段就能送出。" : "還沒有上過的課"} />;
  } else if (tab === "next") {
    const b = booking.slot ? booking : null;
    const c = b && coach(b.coachId);
    const plan = c?.profile.plans.find((p) => p.id === b!.planId);
    const items = [
      ...(b && c && plan
        ? [(
          <Link key="b" href="/me/booking" className="lesson">
            <div className="lesson-t"><b className="num">{day(b.dayKey).date}</b><small>週{day(b.dayKey).weekday}</small><span className="num">{b.slot}</span></div>
            <div className="lesson-b">
              <b>{plan.name}</b>
              <span className="text-muted">{c.name}・{c.profile.venues[0].name}</span>
              <Status tone={BOOKING_STATE[b.status][1]}>{BOOKING_STATE[b.status][0]}</Status>
            </div>
            <Icon name="right" size={18} />
          </Link>
        )]
        : []),
      ...confirmedGroups.map(groupRow),
    ];
    body = items.length ? <div className="stack">{items}</div> : <Empty text="還沒有預約的課" />;
  } else if (tab === "group") {
    body = gathering.length ? (
      <div className="stack">{gathering.map(groupRow)}</div>
    ) : (
      <Empty text="還沒有揪團。挑一堂可以揪朋友的小班課，找朋友一起上更划算。" />
    );
  } else {
    body = (
      <div className="stack">
        {history().map((h) => {
          const c = coach(h.coachId);
          return (
            <div key={h.when} className="lesson">
              <Photo coach={c} size="sm" />
              <div className="lesson-b">
                <b>{h.plan}</b>
                <span className="text-muted">{c.name}・{h.when}</span>
                <Status tone="ended">已完成</Status>
              </div>
              <SoonButton className="btn btn-secondary" style={{ minHeight: 38, padding: "0 12px", fontSize: 14 }} msg="評價（P2）">給評價</SoonButton>
            </div>
          );
        })}
      </div>
    );
  }

  // The phone keeps the head above the scroller; desktop renders it inside the page (the outer one is hidden there).
  const head = (name: string) => (
    <>
      <div className="t"><h1>我的課</h1></div>
      <div className="seg" style={{ display: "flex" }} role="radiogroup" aria-label="課程">
        {([["next", "即將上課"], ["group", `揪團中${gathering.length ? " " + gathering.length : ""}`], ["done", "上過的"]] as [Tab, string][]).filter(([k]) => !(live && k === "group")).map(([k, l]) => (
          <label key={k} className="seg-opt"><input type="radio" name={name} checked={tab === k} onChange={() => setTab(k)} />{l}</label>
        ))}
      </div>
    </>
  );

  return (
    <>
      <div className="list-head">{head("lt")}</div>
      <div className="scroll dk dk-narrow" style={{ padding: "var(--space-4) var(--space-4) var(--space-6)" }}>
        <TopNav />
        <Crumbs items={[["首頁", "/"], ["我的課"]]} />
        <div className="list-head dk-only dk-head">{head("lt-dk")}</div>
        {body}
      </div>
      <TabBar active="lessons" />
    </>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="empty-s card">
      <p className="text-muted">{text}</p>
      <Link className="btn btn-primary" href="/coaches">找教練</Link>
    </div>
  );
}
