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

type PlayerTab = "home" | "coaches" | "lessons" | "me";

/** Student tab bar: floating carbon capsule, active tab lit in optic. Courses first — 揪團球局 lives on 首頁. */
export function TabBar({ active }: { active?: PlayerTab }) {
  const tab = (key: PlayerTab, href: string, icon: IconName, label: string) => (
    <Link className="tab" href={href} aria-current={active === key ? "page" : undefined}>
      <Icon name={icon} size={22} />
      {label}
    </Link>
  );
  return (
    <nav className="tabbar tabbar-4">
      {tab("home", "/", "compass", "首頁")}
      {tab("coaches", "/coaches", "whistle", "找教練")}
      {tab("lessons", "/me/lessons", "cal", "我的課")}
      {tab("me", "/me", "user", "我的")}
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
