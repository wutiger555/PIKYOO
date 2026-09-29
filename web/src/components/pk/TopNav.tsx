"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/lib/demo-store";
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

/** Desktop top navigation (docs/DESKTOP.md §4) — replaces the bottom TabBar at ≥1024px; hidden on phones. */
export function TopNav({ active }: { active?: NavKey }) {
  const { signedIn, setSignedIn, profile } = useDemo();
  const [login, setLogin] = useState(false);
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
                  <button onClick={(e) => { setSignedIn(false); (e.currentTarget.closest("details") as HTMLDetailsElement).open = false; }}>登出（Demo：看訪客畫面）</button>
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
