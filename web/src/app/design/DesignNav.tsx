"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PkMark } from "@/components/pk/Logo";
import { DESIGN_PAGES } from "./pages";

/** Desktop nav (.nav) for the style guide. */
export function DesignNav() {
  const path = usePathname();
  return (
    <nav className="nav ds-top">
      <Link href="/design" className="nav-brand">
        <PkMark size={26} />
        PIKYOO Design
      </Link>
      {DESIGN_PAGES.slice(1).map((p) => (
        <Link key={p.href} href={p.href} aria-current={path === p.href ? "page" : undefined}>{p.label}</Link>
      ))}
      <Link className="btn btn-primary" style={{ minHeight: 40, fontSize: 15, padding: "0 16px" }} href="/">開啟 App</Link>
    </nav>
  );
}
