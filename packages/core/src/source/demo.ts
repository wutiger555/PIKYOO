import { COACHES, nextSlotOf } from "../data/coaches";
import { COURTS } from "../data/courts";
import { dayGroups, demoGames } from "../data/games";
import type { DataSource } from "./types";

/** The mock data; its dates follow today so the demo always looks current. */
export const demo: DataSource = {
  // built on every call: dates follow today (data/today.ts)
  catalog: async () => ({ courts: COURTS, coaches: COACHES.map((c) => ({ ...c, nextSlot: nextSlotOf(c) })), games: demoGames(), dayGroups: dayGroups() }),
};
