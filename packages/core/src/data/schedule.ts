import { demoDay } from "./today.ts"; // .ts: plain Node may import data files (seed generator)

// The coach console's demo week for Mia (docs/APP.md §4): her lessons, her students and the time she has blocked.
// Dates are day offsets from today so the calendar always looks current. Live data replaces this after sign-in.

export type LessonKind = "private" | "small" | "trial";
export type Attendance = "present" | "late" | "absent";
export type SeatPay = "paid" | "wait" | "reported";

export interface RosterStudent {
  id: string;
  name: string;
  initial: string;
  level: string;
  /** lessons taken with this coach */
  times: number;
  /** a 10-lesson pack: how many are used */
  pack?: { total: number; used: number };
  /** the coach's own notes, newest first; only the coach sees them */
  notes: { offset: number; text: string }[];
}

export interface LessonSeat {
  sid: string;
  pay: SeatPay;
  /** the 收款 row this seat's money is tracked in, so both screens agree */
  paymentId?: string;
}

export interface CoachLesson {
  id: string;
  offset: number;
  start: string;
  end: string;
  plan: string;
  kind: LessonKind;
  venue: string;
  /** e.g. 3 號場 */
  court?: string;
  seats: LessonSeat[];
  /** what to bring or remember; only the coach sees it */
  prep: string;
  status: "confirmed" | "cancelled";
  /** a change the students were told about, e.g. 下雨改室內 */
  notice?: string;
}

export interface TimeBlock { id: string; offset: number; start: string; end: string; reason: string }

export const ROSTER: RosterStudent[] = [
  { id: "peggy", name: "Peggy", initial: "P", level: "3.0", times: 13, pack: { total: 10, used: 3 }, notes: [
    { offset: -3, text: "第三拍 drop 落點穩了，反手 dink 還會拉高。下次練反手 dink 壓低。" },
    { offset: -7, text: "想參加 11 月的社區賽，開始加入比賽戰術。" },
  ] },
  { id: "zhou", name: "小周", initial: "周", level: "2.5", times: 6, notes: [{ offset: -7, text: "發球常出界，拋球太前面。" }] },
  { id: "he", name: "阿何", initial: "何", level: "2.5", times: 4, notes: [] },
  { id: "ye", name: "葉子", initial: "葉", level: "2.0", times: 3, notes: [{ offset: -7, text: "怕球打到臉，網前會退。多練 reset 建立信心。" }] },
  { id: "wendy", name: "Wendy", initial: "W", level: "2.0", times: 2, notes: [] },
  { id: "jason", name: "Jason", initial: "J", level: "2.5", times: 4, notes: [{ offset: -10, text: "網球底子，揮拍太大。截擊要短。" }] },
  { id: "lin", name: "林先生", initial: "林", level: "新手", times: 0, notes: [] },
  { id: "chen", name: "陳小姐", initial: "陳", level: "新手", times: 0, notes: [] },
];

const SMALL: LessonSeat[] = [{ sid: "zhou", pay: "paid" }, { sid: "he", pay: "paid" }, { sid: "ye", pay: "paid" }];

/** Mia's repeating week, by weekday; today always has the two lessons the website's 今天 shows. */
const WEEKLY: Record<string, Omit<CoachLesson, "id" | "offset" | "status">[]> = {
  二: [{ start: "19:30", end: "21:00", plan: "小班課", kind: "small", venue: "信義運動中心", court: "2 號場", seats: SMALL, prep: "" }],
  四: [{ start: "19:30", end: "20:30", plan: "一對一", kind: "private", venue: "大安運動中心", seats: [{ sid: "jason", pay: "paid" }], prep: "" }],
  五: [{ start: "10:00", end: "11:00", plan: "一對一 10 堂", kind: "private", venue: "大安運動中心", court: "4 號場", seats: [{ sid: "peggy", pay: "paid" }], prep: "" }],
  六: [
    { start: "09:00", end: "10:00", plan: "新手體驗課", kind: "trial", venue: "大安運動中心", court: "1 號場", seats: [{ sid: "lin", pay: "wait" }, { sid: "chen", pay: "wait" }], prep: "帶 4 支借用拍、一袋練習球" },
    { start: "14:00", end: "15:30", plan: "小班課", kind: "small", venue: "大安運動中心", seats: [{ sid: "ye", pay: "paid" }, { sid: "wendy", pay: "paid" }, { sid: "he", pay: "paid" }], prep: "" },
  ],
  日: [{ start: "10:00", end: "11:00", plan: "一對一", kind: "private", venue: "大安運動中心", seats: [{ sid: "wendy", pay: "paid" }], prep: "" }],
};

const TODAY: Omit<CoachLesson, "id" | "offset" | "status">[] = [
  { start: "10:00", end: "11:00", plan: "一對一 10 堂", kind: "private", venue: "大安運動中心", court: "4 號場", seats: [{ sid: "peggy", pay: "paid", paymentId: "p3" }], prep: "第 4/10 堂：反手 dink 壓低、比賽戰術" },
  { start: "19:30", end: "21:00", plan: "小班課", kind: "small", venue: "信義運動中心", court: "2 號場",
    seats: [{ sid: "zhou", pay: "paid", paymentId: "p4" }, { sid: "he", pay: "wait", paymentId: "p2" }, { sid: "ye", pay: "paid" }], prep: "錄影：每人發球 10 球" },
];

/** Two weeks back and three ahead, so the calendar has history to look at. */
export function demoLessons(): CoachLesson[] {
  const out: CoachLesson[] = [];
  const blocked = new Set(demoBlocks().map((b) => b.offset));
  for (let n = -14; n <= 21; n++) {
    if (blocked.has(n)) continue;
    const day = n === 0 ? TODAY : WEEKLY[demoDay(n).weekday] ?? [];
    day.forEach((l, i) => out.push({ ...l, id: `L${n}-${i}`, offset: n, status: "confirmed", seats: l.seats.map((s) => ({ ...s })) }));
  }
  return out;
}

/** Saturday's tournament is blocked off: no lessons, nothing bookable. */
export const demoBlocks = (): TimeBlock[] => {
  const sat = Array.from({ length: 7 }, (_, i) => i + 8).find((n) => demoDay(n).weekday === "六") ?? 12;
  return [{ id: "b1", offset: sat, start: "00:00", end: "24:00", reason: "TMLP 台中站比賽" }];
};

/** Where the console's sample booking requests (initialRequests) would land on the calendar. */
export const REQUEST_SLOTS: Record<string, { offset: number; start: string; sid: string }> = {
  r1: { offset: 5, start: "10:00", sid: "xiaoan" },
  r2: { offset: 8, start: "19:30", sid: "jason" },
};
