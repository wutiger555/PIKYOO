import type { Level } from "./types";

export const LEVELS = ["新手", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5+"] as const;

export const levelText = (min: Level, max: Level) => (min === max ? LEVELS[min] : `${LEVELS[min]}–${LEVELS[max]}`);

export const money = (n: number) => "NT$" + n.toLocaleString("en-US");
