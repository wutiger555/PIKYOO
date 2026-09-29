import Link from "next/link";

/** Desktop breadcrumbs (replaces the phone AppBar's back button); hidden on phones. The last item is the current page. */
export function Crumbs({ items }: { items: [label: string, href?: string][] }) {
  return (
    <nav className="crumbs dk-only" aria-label="目前位置">
      {items.map(([label, href], i) => (
        <span key={label + i} className="crumb">
          {i > 0 && <span aria-hidden="true">›</span>}
          {href && i < items.length - 1 ? <Link href={href}>{label}</Link> : <span aria-current="page">{label}</span>}
        </span>
      ))}
    </nav>
  );
}
