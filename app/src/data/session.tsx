import { createContext, useContext, useMemo, useState } from "react";
import { emptyCoachFilters, type CoachFilters } from "@pikyoo/core/coach-filters";
import { emptyGameFilters, type GameFilters } from "@pikyoo/core/game-filters";
import type { Booking, Game, MyGameStatus, Question } from "@pikyoo/core/types";
import { isLive, useCatalog } from "./catalog";

// What the website keeps in lib/demo-store.tsx, for the app: sign-in, 找教練 filters, the compare tray, questions asked here.
// Sign-in: the demo starts signed in (like the demo website); live waits for LINE / Apple sign-in (docs/APP.md §8 step 17).

export const MAX_COMPARE = 3;

interface Session {
  signedIn: boolean;
  signIn: () => void;
  filters: CoachFilters;
  setFilters: (f: (p: CoachFilters) => CoachFilters) => void;
  compare: string[];
  /** false when the tray is already full */
  toggleCompare: (id: string) => boolean;
  ask: (coachId: string, text: string) => void;
  asked: Question[];
  /** the demo's one booking (website: demo-store `booking`); live bookings come from the database after sign-in */
  booking: Booking | null;
  setBooking: (b: Booking | null) => void;
  gameFilters: GameFilters;
  setGameFilters: (f: (p: GameFilters) => GameFilters) => void;
  /** my sign-ups: the catalog's (live, after sign-in) plus the demo's joins in this session */
  mine: Record<string, MyGameStatus>;
  join: (gameId: string, wait: boolean) => void;
  leave: (gameId: string) => void;
}
const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState(!isLive);
  const [filters, setF] = useState(emptyCoachFilters);
  const [compare, setCompare] = useState<string[]>([]);
  const [asked, setAsked] = useState<Question[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [gameFilters, setGF] = useState(emptyGameFilters);
  const { catalog } = useCatalog();
  const [joined, setJoined] = useState<Record<string, MyGameStatus | null>>({});
  const mine = useMemo(() => {
    const m: Record<string, MyGameStatus> = { ...(catalog?.mine ?? {}) };
    for (const [id, st] of Object.entries(joined)) { if (st) m[id] = st; else delete m[id]; }
    return m;
  }, [catalog, joined]);
  const value = useMemo<Session>(() => ({
    signedIn,
    signIn: () => { if (!isLive) setSignedIn(true); },
    filters,
    setFilters: (f) => setF(f),
    compare,
    toggleCompare: (id) => {
      if (compare.includes(id)) { setCompare(compare.filter((x) => x !== id)); return true; }
      if (compare.length >= MAX_COMPARE) return false;
      setCompare([...compare, id]);
      return true;
    },
    ask: (coachId, text) => setAsked((p) => [...p, { id: `q${Date.now()}`, coachId, name: "你", level: "", text, askedAt: "剛剛", mine: true }]),
    asked,
    booking,
    setBooking,
    gameFilters,
    setGameFilters: (f) => setGF(f),
    mine,
    join: (id, wait) => setJoined((p) => ({ ...p, [id]: wait ? "wait" : "joined" })),
    leave: (id) => setJoined((p) => ({ ...p, [id]: null })),
  }), [signedIn, filters, compare, asked, booking, gameFilters, mine]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession outside SessionProvider");
  return s;
}

/** 問與答 a reader sees on a coach page: answered ones, plus their own (website: usePublicQuestions). */
export function usePublicQuestions(coachId: string) {
  const { catalog } = useCatalog();
  const { asked } = useSession();
  return useMemo(() => [...(catalog?.questions ?? []), ...asked].filter((q) => q.coachId === coachId && (q.answer || q.mine)), [catalog, asked, coachId]);
}

/** Seats as the viewer sees them (website: useGameView): their own seat or waitlist place counted in. */
export function useGameView(g: Game) {
  const { mine } = useSession();
  const my = mine[g.id];
  const count = g.participants.length + (my === "joined" ? 1 : 0);
  return { my, count, spots: g.capacity - count, waitN: g.waitlist + (my === "wait" ? 1 : 0) };
}
