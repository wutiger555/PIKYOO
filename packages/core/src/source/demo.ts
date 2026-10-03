import { COACHES } from "../data/coaches";
import { COURTS } from "../data/courts";
import { DAY_GROUPS, GAMES } from "../data/games";
import type { DataSource } from "./types";

/** The mock data, unchanged: the demo site behaves exactly as before. */
export const demo: DataSource = {
  catalog: async () => ({ courts: COURTS, coaches: COACHES, games: GAMES, dayGroups: DAY_GROUPS }),
};
