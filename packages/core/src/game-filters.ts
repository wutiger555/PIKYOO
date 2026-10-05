import type { Game, Level, MyGameStatus } from "./types";

/** 球局列表 (F2): quick chips plus the filter sheet. Shared by the website and the app. */
export interface GameFilters {
  day: "today" | "tomorrow" | "weekend" | null;
  /** 自選日期: a dayGroups key (replaces `day`) */
  date: string | null;
  chips: ("eve" | "beg" | "open")[];
  areas: string[];
  time: "am" | "pm" | "eve" | null;
  openOnly: boolean;
  level: Level | null;
}

export const emptyGameFilters = (): GameFilters => ({ day: null, date: null, chips: [], areas: [], time: null, openOnly: false, level: null });

const startHour = (g: Game) => parseInt(g.startsAt, 10);

export function spotsLeft(g: Game, my?: MyGameStatus) {
  return g.capacity - g.participants.length - (my === "joined" ? 1 : 0);
}

export function filterGames(games: Game[], f: GameFilters, mine: Record<string, MyGameStatus>) {
  return games.filter((g) => {
    if (f.day === "today" && g.dayLabel !== "今天") return false;
    if (f.day === "tomorrow" && g.dayLabel !== "明天") return false;
    if (f.day === "weekend" && g.weekday !== "六" && g.weekday !== "日") return false;
    if (f.date && g.group !== f.date) return false;
    if (f.chips.includes("eve") && startHour(g) < 17) return false;
    if (f.chips.includes("beg") && !g.beginnerFriendly) return false;
    if ((f.chips.includes("open") || f.openOnly) && spotsLeft(g, mine[g.id]) <= 0) return false;
    if (f.areas.length && !f.areas.includes(g.district)) return false;
    if (f.time) {
      const h = startHour(g);
      if (f.time === "am" && h >= 12) return false;
      if (f.time === "pm" && (h < 12 || h >= 17)) return false;
      if (f.time === "eve" && h < 17) return false;
    }
    if (f.level != null && (f.level < g.levelMin || f.level > g.levelMax)) return false;
    return true;
  });
}

/** Badge count on the filter button: sheet-only filters. */
export const sheetFilterCount = (f: GameFilters) => f.areas.length + (f.date ? 1 : 0) + (f.time ? 1 : 0) + (f.openOnly ? 1 : 0) + (f.level != null ? 1 : 0);
