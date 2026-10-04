import type { Coach, Court, DayGroup, Game, MyGameStatus } from "../types";
import type { MyCoach } from "./me-coach";

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
  /** Games the viewer hosts. The host stays in their own roster and out of `mine`. */
  /** The viewer's own coach page at any status (draft, pending, approved); null = not a coach. Live with real sign-in only. */
  myCoach?: MyCoach | null;
  hosting?: string[];
}

export interface DataSource {
  /** viewer: the signed-in user's id, so their own sign-ups come back as `mine` */
  catalog(viewer?: string): Promise<Catalog>;
}
