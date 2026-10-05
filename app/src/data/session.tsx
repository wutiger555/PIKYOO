import { createContext, useContext, useMemo, useState } from "react";
import { emptyCoachFilters, type CoachFilters } from "@pikyoo/core/coach-filters";
import { emptyGameFilters, type GameFilters } from "@pikyoo/core/game-filters";
import { bookingDays, getCoach, initialPayments, initialRequests } from "@pikyoo/core/data/coaches";
import type { Booking, BookingRequest, BookingStatus, Coach, Game, MyGameStatus, PaymentRow, Question } from "@pikyoo/core/types";
import { bookingTotal } from "./booking";
import { isLive, useCatalog } from "./catalog";

// What the website keeps in lib/demo-store.tsx, for the app: sign-in, 找教練 filters, the compare tray, questions asked here,
// and the coach console (Mia's requests, payments and page). In the demo the two sides are wired together, so one phone
// shows the whole round trip: a booking with Mia lands in her 今天, her 確認 moves the student on to 付款, the student's
// report shows up in her 收款, and her 確認收到 marks the lesson paid.
// Sign-in: the demo starts signed in (like the demo website); live waits for LINE / Apple sign-in (docs/APP.md §8 step 17).

export const MAX_COMPARE = 3;

interface Session {
  signedIn: boolean;
  signIn: () => void;
  /** demo: back to the visitor view (website: 登出（Demo：看訪客畫面）) */
  signOut: () => void;
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
  // booking round trip (student side)
  submitBooking: (b: Booking) => void;
  /** 我已轉帳 with the last five digits, or "" for LINE Pay */
  reportPayment: (ref: string) => void;
  /** the demo buttons on 我的預約 standing in for the coach */
  setBookingStatus: (st: BookingStatus) => void;
  // coach console (Mia in the demo)
  myCoach: Coach | null;
  setMyCoach: (f: (c: Coach) => Coach) => void;
  requests: BookingRequest[];
  decide: (id: string, ok: boolean) => void;
  payments: PaymentRow[];
  markPaid: (id: string) => void;
  rejectReport: (id: string) => void;
  /** every question the reader may see, with this session's own questions and the coach's replies applied */
  questions: Question[];
  answer: (id: string, text: string) => void;
  /** catalog coaches with the console's edits applied, so 找教練 and the coach page show them at once */
  coaches: Coach[];
}

const MINE = "mine";
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
  const [edited, setEdited] = useState<Coach | null>(null);
  const baseCoach = useMemo(() => catalog?.coaches.find((c) => c.id === "mia") ?? getCoach("mia") ?? null, [catalog]);
  const myCoach = edited ?? baseCoach;
  const [requests, setRequests] = useState<BookingRequest[]>(initialRequests);
  const [payments, setPayments] = useState<PaymentRow[]>(initialPayments);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const questions = useMemo(() => [...(catalog?.questions ?? []), ...asked].map((q) => (answers[q.id] ? { ...q, answer: { text: answers[q.id], at: "剛剛" } } : q)), [catalog, asked, answers]);
  const coaches = useMemo(() => (catalog?.coaches ?? []).map((c) => (edited && c.id === edited.id ? edited : c)), [catalog, edited]);
  const patchPayment = (id: string, patch: Partial<PaymentRow>) => setPayments((ps) => ps.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const patchBooking = (st: BookingStatus) => setBooking((b) => (b ? { ...b, status: st } : b));

  const value = useMemo<Session>(() => ({
    signedIn,
    signIn: () => { if (!isLive) setSignedIn(true); },
    signOut: () => setSignedIn(false),
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

    submitBooking: (b) => {
      setBooking({ ...b, status: "pending" });
      setPayments((ps) => ps.filter((x) => x.id !== "n" + MINE));
      const c = coaches.find((x) => x.id === b.coachId);
      if (!c || c.id !== myCoach?.id) return setRequests((rs) => rs.filter((x) => x.id !== MINE));
      const { plan, total } = bookingTotal(b, c.profile);
      const d = bookingDays().find((x) => x.key === b.dayKey);
      const req: BookingRequest = {
        id: MINE, initial: "安", name: "小安（你）", level: "新手", firstTime: true, when: `${d ? `${d.date}（${d.weekday}）` : ""}${b.slot}`,
        plan: `${plan.name} ×${plan.unit === "/人" ? b.headcount : 1}`, amount: total, note: b.note, expiresIn: "48 小時", pay: b.pay, status: "pending",
      };
      setRequests((rs) => [req, ...rs.filter((x) => x.id !== MINE)]);
    },
    reportPayment: (ref) => {
      patchBooking(ref ? "reported" : "paid");
      patchPayment("n" + MINE, ref ? { status: "reported", ref, at: "剛剛回報" } : { status: "paid", at: "剛剛" });
    },
    setBookingStatus: (st) => {
      patchBooking(st);
      if (st === "confirmed") {
        const r = requests.find((x) => x.id === MINE);
        if (r) {
          setRequests((rs) => rs.map((x) => (x.id === MINE ? { ...x, status: "ok" } : x)));
          setPayments((ps) => [{ id: "n" + MINE, initial: r.initial, name: r.name, what: `${r.plan}・${r.when}`, amount: r.amount, via: r.pay, status: "wait", at: "剛剛已傳付款資訊" }, ...ps.filter((x) => x.id !== "n" + MINE)]);
        }
      }
      if (st === "paid") patchPayment("n" + MINE, { status: "paid", at: "剛剛" });
    },

    myCoach,
    setMyCoach: (f) => { if (myCoach) setEdited(f(myCoach)); },
    requests,
    decide: (id, ok) => {
      const r = requests.find((x) => x.id === id);
      if (!r) return;
      setRequests((rs) => rs.map((x) => (x.id === id ? { ...x, status: ok ? "ok" : "no" } : x)));
      if (ok) setPayments((ps) => [{ id: "n" + id, initial: r.initial, name: r.name, what: `${r.plan}・${r.when}`, amount: r.amount, via: r.pay, status: "wait", at: "剛剛已傳付款資訊" }, ...ps.filter((x) => x.id !== "n" + id)]);
      if (id === MINE) setBooking((b) => (ok && b ? { ...b, status: "confirmed" } : null));
    },
    payments,
    markPaid: (id) => { patchPayment(id, { status: "paid", at: "剛剛" }); if (id === "n" + MINE) patchBooking("paid"); },
    rejectReport: (id) => { patchPayment(id, { status: "wait", ref: undefined, at: "等學生重新確認" }); if (id === "n" + MINE) patchBooking("confirmed"); },
    questions,
    answer: (id, text) => setAnswers((a) => ({ ...a, [id]: text })),
    coaches,
  }), [signedIn, filters, compare, asked, booking, gameFilters, mine, myCoach, requests, payments, questions, coaches]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession outside SessionProvider");
  return s;
}

/** 問與答 a reader sees on a coach page: answered ones, plus their own (website: usePublicQuestions). */
export function usePublicQuestions(coachId: string) {
  const { questions } = useSession();
  return useMemo(() => questions.filter((q) => q.coachId === coachId && (q.answer || q.mine)), [questions, coachId]);
}

/** Seats as the viewer sees them (website: useGameView): their own seat or waitlist place counted in. */
export function useGameView(g: Game) {
  const { mine } = useSession();
  const my = mine[g.id];
  const count = g.participants.length + (my === "joined" ? 1 : 0);
  return { my, count, spots: g.capacity - count, waitN: g.waitlist + (my === "wait" ? 1 : 0) };
}
