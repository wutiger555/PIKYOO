"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/demo-store";
import { useAccount } from "@/lib/use-account";
import { PkMark } from "./Logo";
import { LoginSheet } from "./LoginSheet";

type NavKey = "home" | "coaches" | "games" | "courts" | "learn";

const LINKS: [NavKey, string, string][] = [
  ["home", "/", "首頁"],
  ["coaches", "/coaches", "找教練"],
  ["games", "/games", "球局"],
  ["courts", "/courts", "球場"],
  ["learn", "/learn", "第一次打"],
];

/** Desktop top navigation (docs/DESKTOP.md §4) — replaces the bottom TabBar at ≥1024px; hidden on phones.
 *  `coach` is the console variant: 教練模式 badge instead of the student links, and a switch back to the student side. */
export function TopNav({ active, coach }: { active?: NavKey; coach?: boolean }) {
  const { signedIn, profile, myCoach } = useDemo();
  const account = useAccount();
  const [login, setLogin] = useState(false);
  if (coach) {
    return (
      <header className="topnav dk-only">
        <div className="topnav-in topnav-coach">
          <Link href="/coach" className="topnav-brand" aria-label="教練後台"><PkMark size={30} />PIKYOO</Link>
          <span className="role-pill topnav-role">教練模式</span>
          <span style={{ flex: 1 }} />
          <div className="topnav-r">
            <Link href={`/coaches/${myCoach.id}`} className="topnav-link">看我的教練頁</Link>
            <Link href="/" className="topnav-link">切換到學生</Link>
            <span className="topnav-who"><span className="avatar">{myCoach.initial}</span>{myCoach.name}</span>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="topnav dk-only">
      <div className="topnav-in">
        <Link href="/" className="topnav-brand" aria-label="PIKYOO 首頁"><PkMark size={30} />PIKYOO</Link>
        <nav className="topnav-links" aria-label="主要導覽">
          {LINKS.map(([k, href, label]) => <Link key={k} href={href} aria-current={active === k ? "page" : undefined}>{label}</Link>)}
        </nav>
        <div className="topnav-r">
          {signedIn ? (
            <>
              <Link href="/me/lessons" className="topnav-link">我的課</Link>
              <details className="topnav-me">
                <summary><span className="avatar">{profile.name.slice(0, 1)}</span>{profile.name}</summary>
                <div className="topnav-menu">
                  <Link href="/me">我的</Link>
                  <Link href="/coach">切換到教練模式</Link>
                  <button onClick={(e) => { (e.currentTarget.closest("details") as HTMLDetailsElement).open = false; account.logout(); }}>{account.real ? "登出" : "登出（Demo：看訪客畫面）"}</button>
                </div>
              </details>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setLogin(true)}>登入／註冊</button>
          )}
        </div>
      </div>
      {login && <LoginSheet onClose={() => setLogin(false)} reason="登入後可以預約課程、揪朋友" />}
    </header>
  );
}
