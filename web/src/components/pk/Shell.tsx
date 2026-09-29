"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { useToast } from "./Toast";

/** Mobile app bar: back · centred title · one action.
 *  `back` is where the back button goes; with `historyBack` it pops history first (falls back to `back`). */
export function AppBar({ title, back, historyBack, action }: { title: string; back?: string; historyBack?: boolean; action?: React.ReactNode }) {
  const router = useRouter();
  const goBack = (e: React.MouseEvent) => {
    if (historyBack && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };
  return (
    <div className="appbar">
      {back ? (
        <Link className="btn btn-ghost btn-icon" href={back} onClick={goBack} aria-label="返回">
          <Icon name="left" size={24} />
        </Link>
      ) : (
        <span className="appbar-spacer" />
      )}
      <div className="appbar-title">{title}</div>
      {action ?? <span className="appbar-spacer" />}
    </div>
  );
}

/** Bottom sheet with scrim; click the scrim to close. */
export function Sheet({ onClose, children, className, style }: { onClose: () => void; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className={`sheet${className ? " " + className : ""}`} style={style} role="dialog" aria-modal="true">
        <div className="sheet-grip" />
        {children}
      </div>
    </>
  );
}

type PlayerTab = "home" | "games" | "learn" | "me";

/** Player tab bar: floating carbon capsule, active tab lit in optic, raised 開團 ball in the middle. */
export function TabBar({ active }: { active: PlayerTab }) {
  const toast = useToast();
  const tab = (key: PlayerTab, href: string, icon: IconName, label: string) => (
    <Link className="tab" href={href} aria-current={active === key ? "page" : undefined}>
      <Icon name={icon} size={22} />
      {label}
    </Link>
  );
  return (
    <nav className="tabbar">
      {tab("home", "/", "compass", "探索")}
      {tab("games", "/games", "court", "球局")}
      <button className="tab" onClick={() => toast("開團／AI 一貼成局（下一輪）")}>
        <span className="tab-fab">
          <Icon name="paddlePlus" size={28} stroke={2} />
        </span>
        開團
      </button>
      {tab("learn", "/coaches", "cap", "學打球")}
      <button className="tab" aria-current={active === "me" ? "page" : undefined} onClick={() => toast("我的（下一輪）")}>
        <Icon name="user" size={22} />
        我的
      </button>
    </nav>
  );
}

/** A button that only explains what the next round will build. */
export function SoonButton({ msg, className, children, style, "aria-label": ariaLabel }: { msg: string; className?: string; children: React.ReactNode; style?: React.CSSProperties; "aria-label"?: string }) {
  const toast = useToast();
  return (
    <button type="button" className={className} style={style} onClick={() => toast(msg)} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
