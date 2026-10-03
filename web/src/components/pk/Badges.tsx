import { LEVELS, levelText } from "@pikyoo/core/format";
import type { Credential, Level } from "@pikyoo/core/types";
import { Icon } from "./Icon";

/** 程度徽章: 7-step ladder (height + olive depth) plus the number, always written out. */
export function LevelChip({ min, max = min, lg, className }: { min: Level; max?: Level; lg?: boolean; className?: string }) {
  const single = min === max;
  return (
    <span className={`level${lg ? " level-lg" : ""}${className ? " " + className : ""}`}>
      <span className="lv">
        {LEVELS.map((_, i) => (
          <i key={i} className={i >= min && i <= max ? "on" : ""} />
        ))}
      </span>
      {single && min === 0 ? <span className="lv-tx">{LEVELS[0]}</span> : levelText(min, max)}
    </span>
  );
}

/** 新手友善 */
export function Sprout() {
  return (
    <span className="sprout">
      <Icon name="sprout" size={14} stroke={1.8} />
      新手友善
    </span>
  );
}

/** 認證徽章: verified = solid + carbon issuer; self-reported = dashed + "自填". */
export function Cred({ c }: { c: Credential }) {
  return c.verified ? (
    <span className="cred">
      <span className="cred-issuer">{c.issuer}</span>
      <span className="cred-level">{c.level}</span>
      <span className="cred-state">
        <Icon name="check" size={13} stroke={2.2} />
        已驗證
      </span>
    </span>
  ) : (
    <span className="cred self">
      <span className="cred-issuer">{c.issuer}</span>
      <span className="cred-level">
        <span className="num">{c.level}</span>
      </span>
      <span className="cred-state">自填</span>
    </span>
  );
}

export type StatusTone = "open" | "almost" | "full" | "ended" | "info";

export function Status({ tone, children, className, style }: { tone: StatusTone; children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`status status-${tone}${className ? " " + className : ""}`} style={style}>
      {children}
    </span>
  );
}

/** Kitchen-line court illustration (beginner entry, empty states). */
export function CourtArt({ ball, className }: { ball?: boolean; className?: string }) {
  return (
    <div className={`court${className ? " " + className : ""}`} aria-hidden="true">
      <span className="kz" />
      <i style={{ left: "34%" }} />
      <i style={{ right: "34%" }} />
      <b style={{ left: 0, right: "66%" }} />
      <b style={{ left: "66%", right: 0 }} />
      <span className="net" />
      {ball && <span className="ball" />}
    </div>
  );
}
