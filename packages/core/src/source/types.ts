import type { Coach, Court, DayGroup, Game, MyGameStatus } from "../types";

/** What the screens read: loaded once per request on the server and handed to the client store (docs/BACKEND.md §3). */
export interface Catalog {
  courts: Court[];
  coaches: Coach[];
  games: Game[];
  /** 今天 9/29（二）… headings for the game list and the 開團 day picker */
  dayGroups: Record<DayGroup, string>;
  /** The viewer's own sign-ups. Live keeps the viewer out of `participants` and `waitlist`, as the mock does,
   *  so the screens add 你 themselves (useGameView). */
  mine?: Record<string, MyGameStatus>;
}

export interface DataSource {
  /** viewer: the signed-in user's id, so their own sign-ups come back as `mine` */
  catalog(viewer?: string): Promise<Catalog>;
}
