import { useId } from "react";

// PIKYOO mark: the letter P is a paddle (bowl = face, stem = grip); the counter holds an
// optic ball sitting on the sweet spot. Ported from the design handoff (assets/logo.svg, brand/logo.html).

const PADDLE = "M14 22a16 16 0 0 1 16-16h2a16 16 0 0 1 16 16v4a16 16 0 0 1-16 16h-6v16H14z";

function Holes({ fill = "#3B4409", opacity = 0.82 }: { fill?: string; opacity?: number }) {
  return (
    <g fill={fill} opacity={opacity}>
      <circle cx="31" cy="24" r="1.05" />
      <circle cx="31" cy="20.1" r=".92" />
      <circle cx="34.38" cy="22.05" r=".92" />
      <circle cx="34.38" cy="25.95" r=".92" />
      <circle cx="31" cy="27.9" r=".92" />
      <circle cx="27.62" cy="25.95" r=".92" />
      <circle cx="27.62" cy="22.05" r=".92" />
      <ellipse cx="34.1" cy="18.63" rx=".42" ry=".72" transform="rotate(-60 34.1 18.63)" />
      <ellipse cx="37.2" cy="24" rx=".42" ry=".72" transform="rotate(0 37.2 24)" />
      <ellipse cx="34.1" cy="29.37" rx=".42" ry=".72" transform="rotate(60 34.1 29.37)" />
      <ellipse cx="27.9" cy="29.37" rx=".42" ry=".72" transform="rotate(120 27.9 29.37)" />
      <ellipse cx="24.8" cy="24" rx=".42" ry=".72" transform="rotate(180 24.8 24)" />
      <ellipse cx="27.9" cy="18.63" rx=".42" ry=".72" transform="rotate(240 27.9 18.63)" />
    </g>
  );
}

function BallGradient({ id }: { id: string }) {
  return (
    <defs>
      <radialGradient id={id} cx="28.4" cy="21" r="10.5" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#F3FCB2" />
        <stop offset=".48" stopColor="#D4EE3A" />
        <stop offset="1" stopColor="#9DB414" />
      </radialGradient>
    </defs>
  );
}

type MarkVariant =
  /** 32px+ : paddle in currentColor, realistic ball with holes */
  | "full"
  /** ≤24px : flat optic ball, no holes */
  | "small"
  /** on optic / single colour: the ball becomes a real hole showing the background */
  | "mono";

export function PkMark({ size = 32, variant = "full", className, style }: { size?: number | string; variant?: MarkVariant; className?: string; style?: React.CSSProperties }) {
  const gid = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} style={style} aria-hidden="true">
      {variant === "mono" ? (
        <>
          <path fillRule="evenodd" fill="currentColor" d={`${PADDLE}M31 16.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 1 0 0-15z`} />
          <Holes fill="currentColor" opacity={1} />
        </>
      ) : variant === "small" ? (
        <>
          <path d={PADDLE} fill="currentColor" />
          <circle cx="31" cy="24" r="7.5" fill="#D4EE3A" />
        </>
      ) : (
        <>
          <BallGradient id={gid} />
          <path d={PADDLE} fill="currentColor" />
          <circle cx="31" cy="24" r="7.5" fill={`url(#${gid})`} />
          <Holes />
        </>
      )}
    </svg>
  );
}

/** The ball alone (used as the last O of the wordmark at 40px+). */
export function PkBall({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const gid = useId();
  return (
    <svg viewBox="23 16 16 16" className={className} style={style} aria-hidden="true">
      <BallGradient id={gid} />
      <circle cx="31" cy="24" r="7.5" fill={`url(#${gid})`} stroke="#121412" strokeWidth=".9" />
      <Holes />
    </svg>
  );
}
