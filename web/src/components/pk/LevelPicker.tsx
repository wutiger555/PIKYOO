"use client";

import { LEVELS } from "@pikyoo/core/format";
import type { Level } from "@pikyoo/core/types";

/** 7-step level picker; bar height and olive depth grow with the level. */
export function LevelPicker({ value, onPick, lg }: { value: Level | null; onPick: (lv: Level) => void; lg?: boolean }) {
  return (
    <div className={`lv-pick${lg ? " lv-pick-lg" : ""}`}>
      {LEVELS.map((l, i) => (
        <button key={l} aria-pressed={value === i} onClick={() => onPick(i as Level)}>
          <i style={{ height: 4 + i * 2, background: `var(--level-${i})`, boxShadow: i < 2 ? "inset 0 0 0 1px var(--level-4)" : undefined }} />
          {l}
        </button>
      ))}
    </div>
  );
}
