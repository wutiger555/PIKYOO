import { createContext, useContext, useMemo, useState } from "react";
import { emptyCoachFilters, type CoachFilters } from "@pikyoo/core/coach-filters";
import { emptyGameFilters, type GameFilters } from "@pikyoo/core/game-filters";
import { bookingDays, DEMO_PAYOUT, getCoach, initialPayments, initialRequests } from "@pikyoo/core/data/coaches";
import { ME } from "@pikyoo/core/data/games";
import { demoNotices } from "@pikyoo/core/data/notifications";
import type { Notice } from "@pikyoo/core/source/notifications";
import type { Booking, BookingRequest, BookingStatus, Coach, Game, Level, MyGameStatus, PaymentRow, Question } from "@pikyoo/core/types";
import { demoBlocks, demoLessons, REQUEST_SLOTS, ROSTER, type Attendance, type CoachLesson, type RosterStudent, type TimeBlock } from "@pikyoo/core/data/schedule";
import { bookingTotal } from "./booking";
import { isLive, useCatalog } from "./catalog";

// What the website keeps in lib/demo-store.tsx, for the app: sign-in, 找教練 filters, the compare tray, questions asked here,
// and the coach console (Mia's requests, payments and page). In the demo the two sides are wired together, so one phone
// shows the whole round trip: a booking with Mia lands in her 行事曆 (待處理), her 確認 moves the student on to 付款, the
// student's report shows up in her 收款, and her 確認收到 marks the lesson paid. Each step also lands in the student's 通知.
// Sign-in: the demo starts signed in (like the demo website); live waits for LINE / Apple sign-in (docs/APP.md §8 step 17).

export const MAX_COMPARE = 3;

export type Profile = { name: string; level: Level; areas: string[] };
/** Mia's bank account (website: coach_pay_details.bank_transfer); the student's transfer QR is made from it */
export type Payout = { bank: string; account: string; name: string };

interface Session {
  signedIn: boolean;
  signIn: () => void;
  /** demo: back to the visitor view (website: 登出（Demo：看訪客畫面）) */
  signOut: () => void;
  /** the student's own name, level and areas (website: onboarding / 編輯個人資料) */
  profile: Profile;
  setProfile: (p: Profile) => void;
  /** 收藏的教練 */
  favs: string[];
  /** true when the coach is now saved */
  toggleFav: (coachId: string) => boolean;
  notices: Notice[];
  readNotices: () => void;
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
  /** the student cancels: the request, lesson and payment row go from Mia's side too */
  cancelBooking: () => void;
  // coach console (Mia in the demo)
  myCoach: Coach | null;
  payout: Payout;
  setPayout: (p: Payout) => void;
  /** 自動提醒未付款 (website: coach_pay_details.remind_unpaid) */
  remindUnpaid: boolean;
  setRemindUnpaid: (on: boolean) => void;
  setMyCoach: (f: (c: Coach) => Coach) => void;
  requests: BookingRequest[];
  decide: (id: string, ok: boolean) => void;
  payments: PaymentRow[];
  markPaid: (id: string) => void;
  rejectReport: (id: string) => void;
  /** LINE 提醒: in the demo the student's own booking gets the notice, which opens 我的預約 with the transfer QR */
  remindPayment: (id: string) => void;
  /** every question the reader may see, with this session's own questions and the coach's replies applied */
  questions: Question[];
  answer: (id: string, text: string) => void;
  /** catalog coaches with the console's edits applied, so 找教練 and the coach page show them at once */
  coaches: Coach[];
  // coach calendar (docs/APP.md §4): lessons, students, blocked time
  lessons: CoachLesson[];
  /** pending requests placed on the calendar as dashed cards */
  pendingSlots: { id: string; offset: number; start: string; name: string; plan: string }[];
  students: RosterStudent[];
  blocks: TimeBlock[];
  addBlock: (b: Omit<TimeBlock, "id">) => void;
  removeBlock: (id: string) => void;
  /** is the start time `hhmm` on day `offset` blocked off (student booking hides it) */
  isBlocked: (offset: number, hhmm: string) => boolean;
  attendance: Record<string, Attendance>;
  setAttendance: (lessonId: string, sid: string, a: Attendance) => void;
  setLesson: (id: string, patch: Partial<CoachLesson>) => void;
  /** a seat's payment, read from the 收款 row when the seat has one */
  seatPay: (lessonId: string, sid: string) => "paid" | "wait" | "reported";
  markSeatPaid: (lessonId: string, sid: string) => void;
  /** what one seat owes: its 收款 row, else the plan's price */
  seatAmount: (lessonId: string, sid: string) => number;
  addNote: (sid: string, text: string) => void;
}

const MINE = "mine";
const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState(!isLive);
  const [profile, setProfile] = useState<Profile>({ name: ME.name, level: ME.level, areas: ["大安區", "信義區", "中山區"] });
  const [favs, setFavs] = useState<string[]>([]);
  const [payout, setPayout] = useState<Payout>(DEMO_PAYOUT);
  const [remindUnpaid, setRemindUnpaid] = useState(true);
  // n1 is the website's sample 教練確認了你的預約; here that notice arrives when the demo booking is really confirmed
  const [notices, setNotices] = useState<Notice[]>(() => demoNotices().filter((n) => n.id !== "n1"));
  const notify = (title: string, body: string, href: string) => setNotices((ns) => [{ id: "n" + Date.now().toString(36), title, body, href, at: "剛剛", read: false }, ...ns]);
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
  const [lessons, setLessons] = useState<CoachLesson[]>(demoLessons);
  const [students, setStudents] = useState<RosterStudent[]>(() => ROSTER.map((x) => ({ ...x, notes: [...x.notes] })));
  const [blocks, setBlocks] = useState<TimeBlock[]>(demoBlocks);
  const [attendance, setAtt] = useState<Record<string, Attendance>>({});
  const slotOf = (id: string): { offset: number; start: string } | null => {
    if (id === MINE) return booking?.slot ? { offset: Number(booking.dayKey.replace("d", "")), start: booking.slot } : null;
    return REQUEST_SLOTS[id] ?? null;
  };
  const pendingSlots = useMemo(() => requests.filter((r) => r.status === "pending").flatMap((r) => {
    const at = slotOf(r.id);
    return at ? [{ id: r.id, ...at, name: r.name, plan: r.plan }] : [];
  }), [requests, booking]); // eslint-disable-line react-hooks/exhaustive-deps
  const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const addMin = (t: string, m: number) => { const x = toMin(t) + m; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
  /** a confirmed request becomes a lesson on the calendar, and its student joins the roster */
  const toLesson = (r: BookingRequest) => {
    const at = slotOf(r.id);
    if (!at) return;
    const name = r.name.replace("（你）", "");
    let sid = students.find((x) => x.name === name)?.id;
    if (!sid) {
      sid = r.id === MINE ? "xiaoan" : REQUEST_SLOTS[r.id]?.sid ?? r.id;
      const add = { id: sid, name, initial: r.initial, level: r.level, times: 0, notes: [] };
      setStudents((xs) => (xs.some((x) => x.id === add.id) ? xs : [...xs, add]));
    }
    const plan = r.plan.replace(/ ×\d+.*$/, "");
    const dur = myCoach?.profile.plans.find((p) => p.name === plan)?.durationMin ?? 60;
    setLessons((ls) => [...ls.filter((l) => l.id !== "R" + r.id), {
      id: "R" + r.id, offset: at.offset, start: at.start, end: addMin(at.start, dur), plan, kind: plan.includes("體驗") ? "trial" : plan.includes("小班") ? "small" : "private",
      venue: myCoach?.profile.venues[0]?.name ?? "", seats: [{ sid: sid!, pay: "wait", paymentId: "n" + r.id }], prep: r.note ? `學生備註：${r.note}` : "", status: "confirmed",
    }]);
  };

  const patchBooking = (st: BookingStatus) => {
    setBooking((b) => (b ? { ...b, status: st } : b));
    if (st === "confirmed") notify("教練確認了你的預約", "照付款資訊付款就完成了", "/me/booking");
    if (st === "paid") notify("教練確認收到付款", "準備好上課了，前一天會再提醒你", "/me/booking");
  };
  /** 到 / 遲到 counts the lesson (上過幾堂) and uses one of the student's pack; changing to 未到 gives it back */
  const countLesson = (sid: string, d: number) => setStudents((xs) => xs.map((x) => (x.id !== sid ? x : {
    ...x, times: Math.max(0, x.times + d), pack: x.pack && { ...x.pack, used: Math.min(x.pack.total, Math.max(0, x.pack.used + d)) },
  })));

  const value = useMemo<Session>(() => ({
    signedIn,
    signIn: () => { if (!isLive) setSignedIn(true); },
    signOut: () => setSignedIn(false),
    profile,
    setProfile,
    favs,
    toggleFav: (id) => { const on = !favs.includes(id); setFavs(on ? [...favs, id] : favs.filter((x) => x !== id)); return on; },
    notices,
    readNotices: () => setNotices((ns) => (ns.some((n) => !n.read) ? ns.map((n) => ({ ...n, read: true })) : ns)),
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
    // LINE Pay goes to the coach's own link (PLAN D9), so it is reported like a transfer and the coach confirms it
    reportPayment: (ref) => {
      patchBooking("reported");
      patchPayment("n" + MINE, { status: "reported", ref: ref || undefined, at: ref ? "剛剛回報" : "剛剛回報（LINE Pay）" });
    },
    setBookingStatus: (st) => {
      patchBooking(st);
      if (st === "confirmed") {
        const r = requests.find((x) => x.id === MINE);
        if (r) {
          toLesson(r);
          setRequests((rs) => rs.map((x) => (x.id === MINE ? { ...x, status: "ok" } : x)));
          setPayments((ps) => [{ id: "n" + MINE, initial: r.initial, name: r.name, what: `${r.plan}・${r.when}`, amount: r.amount, via: r.pay, status: "wait", at: "剛剛已傳付款資訊" }, ...ps.filter((x) => x.id !== "n" + MINE)]);
        }
      }
      if (st === "paid") patchPayment("n" + MINE, { status: "paid", at: "剛剛" });
    },
    cancelBooking: () => {
      setBooking(null);
      setRequests((rs) => rs.filter((x) => x.id !== MINE));
      setPayments((ps) => ps.filter((x) => x.id !== "n" + MINE));
      setLessons((ls) => ls.filter((l) => l.id !== "R" + MINE));
    },

    myCoach,
    payout,
    setPayout,
    remindUnpaid,
    setRemindUnpaid,
    setMyCoach: (f) => { if (myCoach) setEdited(f(myCoach)); },
    requests,
    decide: (id, ok) => {
      const r = requests.find((x) => x.id === id);
      if (!r) return;
      setRequests((rs) => rs.map((x) => (x.id === id ? { ...x, status: ok ? "ok" : "no" } : x)));
      if (ok) toLesson(r);
      if (ok) setPayments((ps) => [{ id: "n" + id, initial: r.initial, name: r.name, what: `${r.plan}・${r.when}`, amount: r.amount, via: r.pay, status: "wait", at: "剛剛已傳付款資訊" }, ...ps.filter((x) => x.id !== "n" + id)]);
      if (id === MINE && ok) patchBooking("confirmed");
      if (id === MINE && !ok) { setBooking(null); notify("教練這次沒辦法接", "看看其他時段或其他教練", "/coaches"); }
    },
    payments,
    markPaid: (id) => { patchPayment(id, { status: "paid", at: "剛剛" }); if (id === "n" + MINE) patchBooking("paid"); },
    rejectReport: (id) => { patchPayment(id, { status: "wait", ref: undefined, at: "等學生重新確認" }); if (id === "n" + MINE) { setBooking((b) => (b ? { ...b, status: "confirmed" } : b)); notify("教練還沒收到你的款項", "請再確認一次付款", "/me/booking"); } },
    remindPayment: (id) => {
      const p = payments.find((x) => x.id === id);
      if (id === "n" + MINE && p) notify(`教練提醒你付款 ${p.amount} 元`, p.via === "銀行轉帳" ? "點開掃 QR 轉帳，付好按一下通知教練" : "點開付款，付好按一下通知教練", "/me/booking");
    },
    questions,
    answer: (id, text) => setAnswers((a) => ({ ...a, [id]: text })),
    coaches,
    lessons,
    pendingSlots,
    students,
    blocks,
    addBlock: (b) => setBlocks((bs) => [...bs, { ...b, id: "b" + Date.now().toString(36) }]),
    removeBlock: (id) => setBlocks((bs) => bs.filter((b) => b.id !== id)),
    isBlocked: (offset, hhmm) => blocks.some((b) => b.offset === offset && hhmm >= b.start && hhmm < b.end),
    attendance,
    setAttendance: (lid, sid, a) => {
      const before = attendance[`${lid}:${sid}`];
      const counts = (v?: Attendance) => v === "present" || v === "late";
      if (counts(a) !== counts(before)) countLesson(sid, counts(a) ? 1 : -1);
      setAtt((x) => ({ ...x, [`${lid}:${sid}`]: a }));
    },
    setLesson: (id, patch) => setLessons((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l))),
    seatPay: (lid, sid) => {
      const seat = lessons.find((l) => l.id === lid)?.seats.find((x) => x.sid === sid);
      const row = seat?.paymentId ? payments.find((p) => p.id === seat.paymentId) : undefined;
      return row ? row.status : seat?.pay ?? "wait";
    },
    markSeatPaid: (lid, sid) => {
      const seat = lessons.find((l) => l.id === lid)?.seats.find((x) => x.sid === sid);
      if (seat?.paymentId && payments.some((p) => p.id === seat.paymentId)) {
        patchPayment(seat.paymentId, { status: "paid", at: "剛剛" });
        if (seat.paymentId === "n" + MINE) patchBooking("paid");
      }
      setLessons((ls) => ls.map((l) => (l.id === lid ? { ...l, seats: l.seats.map((x) => (x.sid === sid ? { ...x, pay: "paid" } : x)) } : l)));
    },
    seatAmount: (lid, sid) => {
      const l = lessons.find((x) => x.id === lid);
      const seat = l?.seats.find((x) => x.sid === sid);
      const row = seat?.paymentId ? payments.find((p) => p.id === seat.paymentId) : undefined;
      if (row) return row.amount;
      const plan = myCoach?.profile.plans.find((p) => p.name === l?.plan);
      return plan ? (plan.unit === "/10 堂" ? Math.round(plan.price / 10) : plan.price) : 0;
    },
    addNote: (sid, text) => setStudents((xs) => xs.map((x) => (x.id === sid ? { ...x, notes: [{ offset: 0, text }, ...x.notes] } : x))),
  }), [remindUnpaid, payout, profile, favs, notices, lessons, pendingSlots, students, blocks, attendance, signedIn, filters, compare, asked, booking, gameFilters, mine, myCoach, requests, payments, questions, coaches]);
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
