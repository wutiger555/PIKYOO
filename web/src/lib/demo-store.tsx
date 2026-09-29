"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { BOOKING_DAYS, COACHES, getCoach, initialGroups, initialPayments, initialRequests } from "./data/coaches";
import { GAMES, ME } from "./data/games";
import { initialQuestions } from "./data/questions";
import { LEVELS } from "./format";
import type { Booking, BookingRequest, Coach, Game, Group, Level, LessonType, MyGameStatus, PaymentRow, Profile, Question } from "./types";

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
  profile: Profile;
  mine: Record<string, MyGameStatus>;
  /** games I opened via 開團, newest first */
  hosted: Game[];
  /** game id whose "你" seat should pop on the next detail render */
  popSeat: string | null;
  gameFilters: GameFilters;
  compare: string[];
  coachFilters: CoachFilters;
  booking: Booking;
  requests: BookingRequest[];
  payments: PaymentRow[];
  /** the signed-in coach's own page, edited in the console (Mia in the demo) */
  myCoach: Coach;
  groups: Group[];
  questions: Question[];
}

const init = (): DemoState => ({
  profile: { name: ME.name, level: ME.level, areas: ["大安區", "信義區", "中山區"] },
  mine: {},
  hosted: [],
  popSeat: null,
  gameFilters: emptyGameFilters(),
  compare: [],
  coachFilters: emptyCoachFilters(),
  booking: newBooking(),
  requests: initialRequests(),
  payments: initialPayments(),
  myCoach: structuredClone(getCoach("mia")!),
  groups: initialGroups(),
  questions: initialQuestions(),
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
      const groups = r.groupId ? p.groups.map((g) => (g.id === r.groupId ? { ...g, status: ok ? ("confirmed" as const) : ("declined" as const) } : g)) : p.groups;
      const payments: PaymentRow[] = ok
        ? [{ id: "n" + id, initial: r.initial, name: r.name, what: `${r.plan}・${r.when}`, amount: r.amount, via: r.pay, status: "wait", at: "剛剛已傳付款資訊" }, ...p.payments]
        : p.payments;
      return { ...p, requests, payments, groups };
    }), []);

  /** 人數到了 → send the group to the coach as one booking request */
  const submitGroup = useCallback((id: string) =>
    setS((p) => {
      const g = p.groups.find((x) => x.id === id);
      const c = g && (g.coachId === p.myCoach.id ? p.myCoach : getCoach(g.coachId));
      const plan = c?.profile.plans.find((x) => x.id === g?.planId);
      if (!g || !c || !plan) return p;
      const n = g.members.length;
      const day = BOOKING_DAYS.find((d) => d.key === g.dayKey);
      const req: BookingRequest = {
        id: "r-" + g.id, groupId: g.id, headcount: n, initial: g.members[0].initial, name: `${g.host} 等 ${n} 人`, level: "新手",
        firstTime: true, when: day ? `${day.date}（${day.weekday}）${g.slot}` : g.slot, plan: `${plan.name} ×${n}（揪團）`, amount: plan.price * n,
        note: g.note, expiresIn: "48 小時", pay: c.profile.pay[0], status: "pending",
      };
      return { ...p, groups: p.groups.map((x) => (x.id === id ? { ...x, status: "requested" as const } : x)), requests: [req, ...p.requests.filter((r) => r.id !== req.id)] };
    }), []);

  const askQuestion = useCallback((coachId: string, text: string) =>
    setS((p) => ({
      ...p,
      questions: [...p.questions, { id: `q-${Date.now()}`, coachId, name: p.profile.name, level: LEVELS[p.profile.level], text, askedAt: "剛剛", mine: true }],
    })), []);

  return useMemo(() => ({
    ...s,
    setProfile: (u: Updater<Profile>) => set("profile", u),
    addHosted: (g: Game) => set("hosted", (hs) => [g, ...hs]),
    setMine,
    setPopSeat: (id: string | null) => set("popSeat", id),
    setGameFilters: (u: Updater<GameFilters>) => set("gameFilters", u),
    setCompare: (u: Updater<string[]>) => set("compare", u),
    setCoachFilters: (u: Updater<CoachFilters>) => set("coachFilters", u),
    setBooking: (u: Updater<Booking>) => set("booking", u),
    confirmRequest,
    markPaid: (id: string) => set("payments", (ps) => ps.map((x) => (x.id === id ? { ...x, status: "paid" as const } : x))),
    resetConsole: () => setS((p) => ({ ...p, requests: initialRequests(), payments: initialPayments() })),
    setMyCoach: (u: Updater<Coach>) => set("myCoach", u),
    addGroup: (g: Group) => set("groups", (gs) => [g, ...gs.filter((x) => x.id !== g.id)]),
    updateGroup: (id: string, u: (g: Group) => Group) => set("groups", (gs) => gs.map((g) => (g.id === id ? u(g) : g))),
    submitGroup,
    askQuestion,
    answerQuestion: (id: string, text: string) => set("questions", (qs) => qs.map((q) => (q.id === id ? { ...q, answer: { text, at: "剛剛" } } : q))),
  }), [s, set, setMine, confirmRequest, submitGroup, askQuestion]);
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

/** Mock games plus the ones I opened this session. */
export function useAllGames() {
  const { hosted } = useDemo();
  return useMemo(() => [...GAMES, ...hosted], [hosted]);
}

/** All coaches, with the signed-in coach's live edits applied (so the console preview and public page match). */
export function useCoaches() {
  const { myCoach } = useDemo();
  return useMemo(() => COACHES.map((c) => (c.id === myCoach.id ? myCoach : c)), [myCoach]);
}

export function useCoach(id: string) {
  return useCoaches().find((c) => c.id === id);
}

/** 問與答 a visitor sees on a coach page: answered ones, plus my own still waiting for a reply. */
export function usePublicQuestions(coachId: string) {
  const { questions } = useDemo();
  return useMemo(() => questions.filter((q) => q.coachId === coachId && (q.answer || q.mine)), [questions, coachId]);
}
