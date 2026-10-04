"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { LoginSheet } from "@/components/pk/LoginSheet";
import { AppBar, TabBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import type { Notice } from "@pikyoo/core/source/notifications";
import { useDemo } from "@/lib/demo-store";
import { LINE_OA_ID, realAuth } from "@/lib/env";
import { markAllReadAction } from "@/lib/notifications";

/** 通知 (B6): bookings, payments, games and Q&A in one list, newest first. Opening the page marks them read. */
export function NotificationsScreen({ notices }: { notices: Notice[] }) {
  const router = useRouter();
  const { signedIn, unread, clearUnread } = useDemo();
  const [login, setLogin] = useState(false);
  useEffect(() => {
    if (!signedIn || !unread) return;
    clearUnread();
    if (realAuth) markAllReadAction().then(() => router.refresh());
  }, [signedIn, unread, clearUnread, router]);

  return (
    <>
      <AppBar title="通知" back="/me" />
      <div className="scroll dk dk-narrow" style={{ padding: "0 16px 24px" }}>
        <TopNav />
        <h1 className="dk-only" style={{ margin: "var(--space-4) 0" }}>通知</h1>
        {signedIn && LINE_OA_ID && (
          <a className="card" href={`https://line.me/R/ti/p/${encodeURIComponent(LINE_OA_ID)}`} target="_blank" rel="noreferrer"
            style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, background: "var(--color-accent-100)" }}>
            <span style={{ flex: 1 }}><b>加 PIKYOO 官方帳號好友</b><small className="text-muted" style={{ display: "block", fontSize: 13 }}>預約確認、候補遞補、付款確認會同時傳到 LINE</small></span>
            <span className="btn btn-primary" style={{ minHeight: 38, padding: "0 14px" }}>加好友</span>
          </a>
        )}
        {!signedIn ? (
          <div className="empty-s" style={{ paddingTop: 48 }}>
            <h3>登入後就會收到通知</h3>
            <p className="text-muted">預約確認、候補遞補、教練回覆、付款確認都會在這裡。</p>
            <button className="btn btn-primary" onClick={() => setLogin(true)}>用 LINE 登入</button>
          </div>
        ) : !notices.length ? (
          <div className="empty-s" style={{ paddingTop: 48 }}>
            <h3>還沒有通知</h3>
            <p className="text-muted">預約、報名球局或提問後，進度會通知你。</p>
          </div>
        ) : (
          <div className="card" style={{ padding: "0 var(--space-4)", gap: 0, marginTop: 12 }}>
            {notices.map((n) => {
              const body = (
                <>
                  <span className="avatar" style={{ background: n.read ? "var(--color-neutral-100)" : "var(--color-accent)" }}><Icon name="bell" size={16} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontWeight: n.read ? 500 : 700 }}>{n.title}</b>
                    {n.body && <small className="text-muted" style={{ display: "block", fontSize: 13 }}>{n.body}</small>}
                    <small className="text-muted num" style={{ display: "block", fontSize: 12 }}>{n.at}</small>
                  </span>
                  {n.href && <Icon name="right" size={18} />}
                </>
              );
              return n.href
                ? <Link key={n.id} href={n.href} className="row-item">{body}</Link>
                : <div key={n.id} className="row-item">{body}</div>;
            })}
          </div>
        )}
      </div>
      <TabBar active="me" />
      {login && <LoginSheet reason="登入後就會收到通知" onClose={() => setLogin(false)} />}
    </>
  );
}
