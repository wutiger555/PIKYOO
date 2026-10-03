import type { Coach, Court, DayGroup, Game } from "../types";

/** What the screens read: loaded once per request on the server and handed to the client store (docs/BACKEND.md §3). */
export interface Catalog {
  courts: Court[];
  coaches: Coach[];
  games: Game[];
  /** 今天 9/29（二）… headings for the game list and the 開團 day picker */
  dayGroups: Record<DayGroup, string>;
}

export interface DataSource {
  catalog(): Promise<Catalog>;
}
