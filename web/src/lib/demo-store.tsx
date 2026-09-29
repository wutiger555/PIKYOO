"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { initialPayments, initialRequests } from "./data/coaches";
import type { Booking, BookingRequest, Game, Level, LessonType, MyGameStatus, PaymentRow } from "./types";

// In-memory demo state shared across screens (the MVP runs on mock data; Supabase replaces this).
// Lives in the root layout so it survives client-side navigation; a full reload resets it.

export interface GameFilters {
  day: "today" | "tomorrow" | "weekend" | null;
  chips: ("eve" | "beg" | "open")[];
  areas: string[];
  time: "am" | "pm" | "eve" | null;
  openOnly: boolean;
  level: Level | null;
}

export interface CoachFilters {
  level: Level | null;
  type: LessonType | null;
  cert: boolean;
  beg: boolean;
}

export const emptyGameFilters = (): GameFilters => ({ day: null, chips: [], areas: [], time: null, openOnly: false, level: null });
export const emptyCoachFilters = (): CoachFilters => ({ level: null, type: null, cert: false, beg: false });
export const newBooking = (coachId = "mia", planId = "trial"): Booking => ({
  coachId, planId, dayKey: "d5", slot: null, headcount: 1, note: "第一次打，之前打過羽球。", pay: "LINE Pay", status: "pending",
});

interface DemoState {
  mine: Record<string, MyGameStatus>;
  /** game id whose "你" seat should pop on the next detail render */
  popSeat: string | null;
  gameFilters: GameFilters;
  compare: string[];
  coachFilters: CoachFilters;
  booking: Booking;
  requests: BookingRequest[];
  payments: PaymentRow[];
}

const init = (): DemoState => ({
  mine: {},
  popSeat: null,
  gameFilters: emptyGameFilters(),
  compare: [],
  coachFilters: emptyCoachFilters(),
  booking: newBooking(),
  requests: initialRequests(),
  payments: initialPayments(),
});

type Updater<T> = T | ((prev: T) => T);
const apply = <T,>(u: Updater<T>, prev: T): T => (typeof u === "function" ? (u as (p: T) => T)(prev) : u);

function useDemoValue() {
  const [s, setS] = useState(init);
  const set = useCallback(<K extends keyof DemoState>(key: K, u: Updater<DemoState[K]>) => setS((p) => ({ ...p, [key]: apply(u, p[key]) })), []);

  const setMine = useCallback((id: string, status: MyGameStatus | null) =>
    set("mine", (m) => {
      const next = { ...m };
      if (status) next[id] = status;
      else delete next[id];
      return next;
    }), [set]);

  const confirmRequest = useCallback((id: string, ok: boolean) =>
    setS((p) => {
      const r = p.requests.find((x) => x.id === id);
      if (!r) return p;
      const requests = p.requests.map((x) => (x.id === id ? { ...x, status: ok ? ("ok" as const) : ("no" as const) } : x));
      const payments: PaymentRow[] = ok
        ? [{ id: "n" + id, initial: r.initial, name: r.name, what: `${r.plan}・${r.when}`, amount: r.amount, via: r.pay, status: "wait", at: "剛剛已傳付款資訊" }, ...p.payments]
        : p.payments;
      return { ...p, requests, payments };
    }), []);

  return useMemo(() => ({
    ...s,
    setMine,
    setPopSeat: (id: string | null) => set("popSeat", id),
    setGameFilters: (u: Updater<GameFilters>) => set("gameFilters", u),
    setCompare: (u: Updater<string[]>) => set("compare", u),
    setCoachFilters: (u: Updater<CoachFilters>) => set("coachFilters", u),
    setBooking: (u: Updater<Booking>) => set("booking", u),
    confirmRequest,
    markPaid: (id: string) => set("payments", (ps) => ps.map((x) => (x.id === id ? { ...x, status: "paid" as const } : x))),
    resetConsole: () => setS((p) => ({ ...p, requests: initialRequests(), payments: initialPayments() })),
  }), [s, set, setMine, confirmRequest]);
}

type Demo = ReturnType<typeof useDemoValue>;
const Ctx = createContext<Demo | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={useDemoValue()}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDemo must be used inside <DemoProvider>");
  return v;
}

// — game helpers that depend on my registration —

export function useGameView(g: Game) {
  const { mine } = useDemo();
  const my = mine[g.id];
  const count = g.participants.length + (my === "joined" ? 1 : 0);
  const spots = g.capacity - count;
  const waitN = g.waitlist + (my === "wait" ? 1 : 0);
  return { my, count, spots, waitN };
}
