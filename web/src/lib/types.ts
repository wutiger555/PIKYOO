// Domain types for the MVP mock data. Field names follow docs/PRD.md §7 where it matters
// (level_min/level_max → levelMin/levelMax, capacity, fee, beginner_friendly …) so the
// Supabase swap later is mechanical.

/** Index into LEVELS: 0 新手 · 1 2.0 · 2 2.5 · 3 3.0 · 4 3.5 · 5 4.0 · 6 4.5+ */
export type Level = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DayGroup = "today" | "tomorrow" | "sat" | "sun";

export interface Host {
  name: string;
  initial: string;
  /** e.g. 開過 42 團・3 個 LINE 群組 */
  summary: string;
}

export interface Participant {
  initial: string;
  name: string;
}

export interface Game {
  id: string;
  group: DayGroup;
  /** 今天 / 明天 / 週六 … */
  dayLabel: string;
  date: string;
  startsAt: string;
  endsAt: string;
  venue: string;
  district: string;
  /** 室內 4 面 */
  courtKind: string;
  address: string;
  levelMin: Level;
  levelMax: Level;
  capacity: number;
  /** First participant is the host. */
  participants: Participant[];
  host: Host;
  fee: number;
  payNote: string;
  beginnerFriendly: boolean;
  waitlist: number;
  notes: string;
}

export type MyGameStatus = "joined" | "wait";

export interface Credential {
  issuer: string;
  level: string;
  verified: boolean;
}

export interface Plan {
  id: string;
  name: string;
  durationMin: number;
  size: string;
  price: number;
  unit: "/人" | "/堂" | "/10 堂";
  note: string;
  tag?: string;
}

export interface TimelineItem {
  year: string;
  text: string;
  kind: "cert" | "trophy" | "users" | "cap";
}

export type PayMethod = "LINE Pay" | "銀行轉帳" | "現場付現";

export interface CoachProfile {
  slug: string;
  reply: string;
  bio: string;
  plans: Plan[];
  timeline: TimelineItem[];
  venues: { name: string; sub: string }[];
  steps: string[];
  pay: PayMethod[];
  policy: string;
  quotes: { name: string; level: string; text: string }[];
}

export type LessonType = "體驗課" | "一對一" | "小班" | "團體";

export interface Coach {
  id: string;
  name: string;
  initial: string;
  creds: Credential[];
  areas: string[];
  levelMin: Level;
  levelMax: Level;
  types: LessonType[];
  priceFrom: number;
  nextSlot: string;
  style: string[];
  beginnerFriendly: boolean;
  years: number;
  students: number;
  rating: number | null;
  reviews: number;
  tagline: string;
  /** Full public page — only Mia has one in the MVP demo. */
  profile?: CoachProfile;
}

export interface BookingDay {
  key: string;
  weekday: string;
  date: string;
}

/** [time, seats left] */
export type Slot = [string, number];

/** docs/PRD.md §6.3 class booking states, plus the payment leg */
export type BookingStatus = "pending" | "confirmed" | "reported" | "paid";

export interface Booking {
  coachId: string;
  planId: string;
  dayKey: string;
  slot: string | null;
  headcount: number;
  note: string;
  pay: PayMethod;
  status: BookingStatus;
}

export interface BookingRequest {
  id: string;
  initial: string;
  name: string;
  level: string;
  firstTime: boolean;
  times?: number;
  when: string;
  plan: string;
  amount: number;
  note: string;
  expiresIn: string;
  pay: PayMethod;
  status: "pending" | "ok" | "no";
}

export interface PaymentRow {
  id: string;
  initial: string;
  name: string;
  what: string;
  amount: number;
  via: PayMethod;
  status: "wait" | "reported" | "paid";
  /** last-5 digits reported for a bank transfer */
  ref?: string;
  at: string;
}
