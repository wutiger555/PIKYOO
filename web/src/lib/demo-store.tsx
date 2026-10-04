"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { bookingDays, getCoach, initialGroups, initialPayments, initialRequests } from "@pikyoo/core/data/coaches";
import { ME } from "@pikyoo/core/data/games";
import { initialQuestions } from "@pikyoo/core/data/questions";
import { demoNotices } from "@pikyoo/core/data/notifications";
import { LEVELS } from "@pikyoo/core/format";
import type { Me } from "@pikyoo/core/source/me";
import type { Catalog } from "@pikyoo/core/source/types";
import type { Booking, BookingRequest, Coach, Game, Group, Level, LessonType, MyGameStatus, PaymentRow, Profile, Question } from "@pikyoo/core/types";

// In-memory demo state shared across screens (the MVP runs on mock data; Supabase replaces this).
// Lives in the root layout so it survives client-side navigation; a full reload resets it.
// Courts, coaches and games come from the data source (lib/source): mock in the demo, Supabase when live.

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

export interface CoachFilters {
  level: Level | null;
  type: LessonType | null;
  cert: boolean;
  beg: boolean;
}

export const emptyGameFilters = (): GameFilters => ({ day: null, date: null, chips: [], areas: [], time: null, openOnly: false, level: null });
export const emptyCoachFilters = (): CoachFilters => ({ level: null, type: null, cert: false, beg: false });
export const newBooking = (coachId = "mia", planId = "trial"): Booking => ({
  coachId, planId, dayKey: "d5", slot: null, headcount: 1, note: "第一次打，之前打過羽球。", pay: "LINE Pay", status: "pending",
});

interface DemoState {
  /** false = visitor: coach pages show only the basics and ask to sign in (LINE login in the real app) */
  signedIn: boolean;
  /** PIKYOO staff (real sign-in only): shows 審核 in 我的 */
  isAdmin: boolean;
  /** the bell's badge */
  unread: number;
  profile: Profile;
  mine: Record<string, MyGameStatus>;
  /** games I opened via 開團 in the demo, newest first (live: catalog.hosting) */
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

/** me: the real signed-in person (null = visitor); undefined = demo sign-in, which starts signed in as 小安. */
const init = (catalog: Catalog, me: Me | null | undefined): DemoState => ({
  signedIn: me === undefined || !!me,
  isAdmin: !!me?.isAdmin,
  unread: me === undefined ? demoNotices().filter((n) => !n.read).length : me?.unread ?? 0,
  profile: me?.profile ?? { name: ME.name, level: ME.level, areas: ["大安區", "信義區", "中山區"] },
  mine: catalog.mine ?? {},
  hosted: [],
  popSeat: null,
  gameFilters: emptyGameFilters(),
  compare: [],
  coachFilters: emptyCoachFilters(),
  booking: newBooking(),
  // real sign-in: nobody's sample data; the coach's requests and payments come from the database (B5)
  requests: me === undefined ? initialRequests() : catalog.myCoach?.requests ?? [],
  payments: me === undefined ? initialPayments() : catalog.myCoach?.payments ?? [],
  // real sign-in: the viewer's own page (an empty placeholder until they apply, see CoachGate); demo: Mia
  myCoach: structuredClone(catalog.myCoach?.coach ?? catalog.coaches.find((c) => c.id === "mia") ?? getCoach("mia")!),
  groups: me === undefined ? initialGroups() : [], // 揪團 is demo-only for now (PLAN D7)
  questions: catalog.questions ?? initialQuestions(),
});

type Updater<T> = T | ((prev: T) => T);
const apply = <T,>(u: Updater<T>, prev: T): T => (typeof u === "function" ? (u as (p: T) => T)(prev) : u);

function useDemoValue(catalog: Catalog, me: Me | null | undefined) {
  const [s, setS] = useState(() => init(catalog, me));
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
      const c = g && (g.coachId === p.myCoach.id ? p.myCoach : catalog.coaches.find((x) => x.id === g.coachId));
      const plan = c?.profile.plans.find((x) => x.id === g?.planId);
      if (!g || !c || !plan) return p;
      const n = g.members.length;
      const day = bookingDays().find((d) => d.key === g.dayKey);
      const req: BookingRequest = {
        id: "r-" + g.id, groupId: g.id, headcount: n, initial: g.members[0].initial, name: `${g.host} 等 ${n} 人`, level: "新手",
        firstTime: true, when: day ? `${day.date}（${day.weekday}）${g.slot}` : g.slot, plan: `${plan.name} ×${n}（揪團）`, amount: plan.price * n,
        note: g.note, expiresIn: "48 小時", pay: c.profile.pay[0], status: "pending",
      };
      return { ...p, groups: p.groups.map((x) => (x.id === id ? { ...x, status: "requested" as const } : x)), requests: [req, ...p.requests.filter((r) => r.id !== req.id)] };
    }), [catalog]);

  const askQuestion = useCallback((coachId: string, text: string) =>
    setS((p) => ({
      ...p,
      questions: [...p.questions, { id: `q-${Date.now()}`, coachId, name: p.profile.name, level: LEVELS[p.profile.level], text, askedAt: "剛剛", mine: true }],
    })), []);

  return useMemo(() => ({
    ...s,
    catalog,
    setSignedIn: (v: boolean) => set("signedIn", v),
    clearUnread: () => set("unread", 0),
    setProfile: (u: Updater<Profile>) => set("profile", u),
    addHosted: (g: Game) => set("hosted", (hs) => [g, ...hs]),
    /** demo 團主管理; null drops the game (取消球局) */
    updateHosted: (id: string, u: (g: Game) => Game | null) =>
      set("hosted", (hs) => hs.flatMap((g) => {
        const n = g.id === id ? u(g) : g;
        return n ? [n] : [];
      })),
    setMine,
    setPopSeat: (id: string | null) => set("popSeat", id),
    setGameFilters: (u: Updater<GameFilters>) => set("gameFilters", u),
    setCompare: (u: Updater<string[]>) => set("compare", u),
    setCoachFilters: (u: Updater<CoachFilters>) => set("coachFilters", u),
    setBooking: (u: Updater<Booking>) => set("booking", u),
    confirmRequest,
    markPaid: (id: string) => set("payments", (ps) => ps.map((x) => (x.id === id ? { ...x, status: "paid" as const } : x))),
    unmarkReported: (id: string) => set("payments", (ps) => ps.map((x) => (x.id === id ? { ...x, status: "wait" as const, ref: undefined, at: "等學生重新確認" } : x))),
    resetConsole: () => setS((p) => ({ ...p, requests: initialRequests(), payments: initialPayments() })),
    setMyCoach: (u: Updater<Coach>) => set("myCoach", u),
    addGroup: (g: Group) => set("groups", (gs) => [g, ...gs.filter((x) => x.id !== g.id)]),
    updateGroup: (id: string, u: (g: Group) => Group) => set("groups", (gs) => gs.map((g) => (g.id === id ? u(g) : g))),
    submitGroup,
    askQuestion,
    answerQuestion: (id: string, text: string) => set("questions", (qs) => qs.map((q) => (q.id === id ? { ...q, answer: { text, at: "剛剛" } } : q))),
  }), [s, catalog, set, setMine, confirmRequest, submitGroup, askQuestion]);
}

type Demo = ReturnType<typeof useDemoValue>;
const Ctx = createContext<Demo | null>(null);

/** Keyed by the signed-in user in app/layout.tsx, so signing in or out starts fresh state. */
export function DemoProvider({ catalog, me, children }: { catalog: Catalog; me?: Me | null; children: React.ReactNode }) {
  return <Ctx.Provider value={useDemoValue(catalog, me)}>{children}</Ctx.Provider>;
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

/** Courts, coaches, games and day headings from the data source. */
export const useCatalog = () => useDemo().catalog;

/** Listed games plus the ones I opened this session. */
export function useAllGames() {
  const { catalog, hosted } = useDemo();
  return useMemo(() => [...catalog.games, ...hosted], [catalog, hosted]);
}

/** Games I host: opened this session in the demo, or the catalog's when signed in for real. */
export function useHostedGames() {
  const { catalog, hosted } = useDemo();
  return useMemo(() => [...hosted, ...catalog.games.filter((g) => catalog.hosting?.includes(g.id))], [catalog, hosted]);
}

/** All coaches, with the signed-in coach's live edits applied (so the console preview and public page match). */
export function useCoaches() {
  const { catalog, myCoach } = useDemo();
  return useMemo(() => catalog.coaches.map((c) => (c.id === myCoach.id ? myCoach : c)), [catalog, myCoach]);
}

export function useCoach(id: string) {
  return useCoaches().find((c) => c.id === id);
}

/** 問與答 a visitor sees on a coach page: answered ones, plus my own still waiting for a reply. */
export function usePublicQuestions(coachId: string) {
  const { questions } = useDemo();
  return useMemo(() => questions.filter((q) => q.coachId === coachId && (q.answer || q.mine)), [questions, coachId]);
}
