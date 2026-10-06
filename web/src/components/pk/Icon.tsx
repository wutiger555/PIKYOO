// PIKYOO icon set — 24px grid, 1.75 stroke, round caps. Pickleball-derived glyphs; filled dots = ball holes.
// Ported from the design handoff (assets/pk-icons.js). Geometry is static, trusted markup.

const H = (x: number, y: number, r = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
const ring = (cx: number, cy: number, d: number, r: number, n = 6, off = -90) =>
  Array.from({ length: n }, (_, k) => {
    const a = ((off + (k * 360) / n) * Math.PI) / 180;
    return H(+(cx + d * Math.cos(a)).toFixed(2), +(cy + d * Math.sin(a)).toFixed(2), r);
  }).join("");

const BASE = {
  ball: `<circle cx="12" cy="12" r="9"/>${H(12, 12, 1.1)}${ring(12, 12, 4.6, 1)}`,
  court: `<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="M12 3v18M8.5 5v14M15.5 5v14M2.5 12h6M15.5 12h6"/>`,
  paddlePlus: `<path d="M6 8.5a6 6 0 0 1 12 0v2a6 6 0 0 1-12 0z"/><path d="M12 16.8v4.7" stroke-width="3"/><path d="M12 6.3v6.4M8.8 9.5h6.4"/>`,
  paddle: `<path d="M6 8.5a6 6 0 0 1 12 0v2a6 6 0 0 1-12 0z"/><path d="M12 16.8v4.7" stroke-width="3"/>${H(12, 9.5, 1)}${H(9.5, 8, 0.8)}${H(14.5, 8, 0.8)}${H(9.5, 11, 0.8)}${H(14.5, 11, 0.8)}`,
  whistle: `<circle cx="9" cy="14.5" r="5.5"/><path d="M11.5 9.6H21v4h-6.6"/>${H(9, 14.5, 1.7)}<path d="M5 10.3 3.4 7.3"/>`,
  player: `<circle cx="12" cy="7.5" r="4.5"/>${H(10.3, 6.9, 0.8)}${H(13.7, 6.9, 0.8)}${H(12, 9.5, 0.8)}<path d="M4 21a8 8 0 0 1 16 0"/>`,
  clock: `<circle cx="12" cy="12" r="9"/>${H(12, 5.3, 0.95)}${H(18.7, 12, 0.95)}${H(12, 18.7, 0.95)}${H(5.3, 12, 0.95)}<path d="M12 12V8.3M12 12l3 1.8"/>`,
  pin: `<path d="M19 10c0 5-5.3 9.7-6.4 10.7a.9.9 0 0 1-1.2 0C10.3 19.7 5 15 5 10a7 7 0 0 1 14 0z"/><circle cx="12" cy="10" r="3"/>${H(12, 10, 0.85)}`,
  sliders: `<path d="M3 7h9.2M17.8 7H21M3 17h2.2M10.8 17H21"/><circle cx="15" cy="7" r="2.8"/><circle cx="8" cy="17" r="2.8"/>${H(15, 7, 0.85)}${H(8, 17, 0.85)}`,
  share: `<circle cx="17" cy="7" r="4"/>${H(17, 7, 0.9)}<path d="M3.5 20.5C5 15 8.5 11.2 13.2 8.8M8.5 20.5c1.2-2.4 2.8-4.3 4.7-5.8"/>`,
  bell: `<path d="M12 3v1.5M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><circle cx="12" cy="20.6" r="1.6"/>`,
  cash: `<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>${H(12, 12, 0.85)}${H(6, 12, 0.85)}${H(18, 12, 0.85)}`,
  cal: `<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>${H(8, 13.6, 1.1)}${H(12, 13.6, 1.1)}${H(16, 13.6, 1.1)}${H(8, 17.3, 1.1)}${H(12, 17.3, 1.1)}`,
  calplus: `<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M12 12.3v6M9 15.3h6"/>`,
  compare: `<ellipse cx="7" cy="8" rx="4" ry="5"/><ellipse cx="17" cy="8" rx="4" ry="5"/><path d="M7 13.3v7.7M17 13.3v7.7" stroke-width="2.8"/>`,
  medal: `<circle cx="12" cy="9" r="6"/><path d="m9.4 9 1.8 1.8 3.3-3.4"/><path d="M8.3 13.7 7 21l5-2.3 5 2.3-1.3-7.3"/>`,
  trophy: `<path d="M7 3.5h10V9a5 5 0 0 1-10 0z"/><path d="M7 5.5H4.5a2.5 2.5 0 0 0 2.6 3.9M17 5.5h2.5a2.5 2.5 0 0 1-2.6 3.9M12 14v3.5"/><rect x="8.5" y="17.5" width="7" height="3.5" rx="1"/>${H(12, 7.8, 1.2)}`,
  sun: `<circle cx="12" cy="12" r="5"/>${H(12, 12, 0.9)}${H(12, 9.4, 0.7)}${H(14.3, 13.3, 0.7)}${H(9.7, 13.3, 0.7)}<path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>`,
  sprout: `<path d="M12 21v-8"/><path d="M12 13c0-4.4 2.6-7 7-7 0 4.4-2.6 7-7 7z"/><path d="M12 15.5c0-3.6-2.2-5.8-6-5.8 0 3.6 2.2 5.8 6 5.8z"/><path d="M7.5 21h9"/>`,
  users: `<circle cx="8.5" cy="8" r="3.5"/><path d="M2.5 20a6 6 0 0 1 12 0"/><circle cx="16.5" cy="9" r="3"/><path d="M15.5 14.2A5 5 0 0 1 21.5 19"/>`,
  msg: `<path d="M12 3.5c5 0 9 3.2 9 7.2 0 3.3-2.8 6-6.6 6.9L10 20.5v-3C5.9 17 3 14.2 3 10.7c0-4 4-7.2 9-7.2z"/>`,
  heart: `<path d="M12 20.5s-8-4.7-8-10.6A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8 2.6c0 5.9-8 10.6-8 10.6z"/>`,
  star: `<path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/>${H(12, 7.8, 1.15)}`,
  check: `<path d="m4.5 12.5 5 5 10-11"/>`,
  x: `<path d="M6 6l12 12M18 6 6 18"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  minus: `<path d="M5 12h14"/>`,
  left: `<path d="M15 5l-7 7 7 7"/>`,
  right: `<path d="M9 5l7 7-7 7"/>`,
  down: `<path d="M5 9l7 7 7-7"/>`,
  nav: `<path d="M20.5 3.5 3.5 10.8l7 2.7 2.7 7z"/>`,
  copy: `<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>`,
  edit: `<path d="M4 20h4L19.5 8.5a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>`,
  qr: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20.5 14v.01M14 20.5h.01M17.5 20.5h3M20.5 17.5v3"/>`,
  image: `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.8"/><path d="m21 15-5-5L5 21"/>`,
  lock: `<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>${H(12, 15.5, 1.2)}`,
  link: `<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>`,
} as const;

/** Semantic aliases: what the glyph means in the product. */
export const ICONS = {
  ...BASE,
  compass: BASE.ball,
  games: BASE.court,
  cap: BASE.whistle,
  coach: BASE.whistle,
  user: BASE.player,
  wallet: BASE.cash,
  shield: BASE.medal,
  cols: BASE.compare,
  today: BASE.sun,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, stroke = 1.75, className }: { name: IconName; size?: number; stroke?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
