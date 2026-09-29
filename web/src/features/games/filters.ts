import type { GameFilters } from "@/lib/demo-store";
import type { Game, MyGameStatus } from "@/lib/types";

const startHour = (g: Game) => parseInt(g.startsAt, 10);

export function spotsLeft(g: Game, my?: MyGameStatus) {
  return g.capacity - g.participants.length - (my === "joined" ? 1 : 0);
}

/** Quick chips + filter sheet, as in prototype filtered(). */
export function filterGames(games: Game[], f: GameFilters, mine: Record<string, MyGameStatus>) {
  return games.filter((g) => {
    if (f.day === "today" && g.group !== "today") return false;
    if (f.day === "tomorrow" && g.group !== "tomorrow") return false;
    if (f.day === "weekend" && g.group !== "sat" && g.group !== "sun") return false;
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
export const sheetFilterCount = (f: GameFilters) => f.areas.length + (f.time ? 1 : 0) + (f.openOnly ? 1 : 0) + (f.level != null ? 1 : 0);
