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
  /** courts.id when the venue is in the court database */
  courtId?: string;
  /** free-cancel window before start; PRD default 12 */
  cancelHours?: number;
}

export type MyGameStatus = "joined" | "wait";

/** docs/PRD.md §7 profiles (the part the MVP screens show). */
export interface Profile {
  name: string;
  level: Level;
  /** 常打區域, e.g. 大安區 */
  areas: string[];
}

export type CourtKind = "室內" | "室外" | "風雨";

/** docs/PRD.md F4-2 預約方式 */
export type BookingMethod = "公立預約系統" | "官網預約" | "LINE 預約" | "電話預約" | "免預約";

export interface Court {
  id: string;
  name: string;
  district: string;
  address: string;
  kind: CourtKind;
  courtCount: number;
  surface: string;
  free: boolean;
  priceNote: string;
  hours: string;
  amenities: string[];
  aircon: boolean;
  lights: boolean;
  booking: BookingMethod;
  bookingNote: string;
  rules: string;
  /** PIKYOO 已確認 (YYYY/MM) */
  verified?: string;
  distance: string;
  /** pin position on the placeholder map, % from left/top */
  map: [number, number];
  /** 16:9 venue photo (demo: stock photo, see docs/PHOTOS.md) */
  photo?: { src: string; alt: string };
}

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
  /** 可揪朋友一起上: headcount range for a group booking; absent = book alone */
  group?: { min: number; max: number };
}

export interface TimelineItem {
  year: string;
  text: string;
  kind: "cert" | "trophy" | "users" | "cap";
}

export type PayMethod = "LINE Pay" | "銀行轉帳" | "現場付現";

export interface CoachPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export type Weekday = "一" | "二" | "三" | "四" | "五" | "六" | "日";

/** 匹克球檔案: the pickleball-specific facts students compare coaches on. */
export interface PlayProfile {
  /** 開始打匹克球的年份 */
  since: string;
  hand: "右手" | "左手";
  /** 雙打為主 / 單打雙打都教 */
  format: string;
  /** 其他運動背景, e.g. 網球教練 8 年 */
  background: string;
  /** 擅長教的技術 */
  strengths: string[];
}

export interface CoachProfile {
  slug: string;
  reply: string;
  bio: string;
  /** first photo is the cover */
  photos: CoachPhoto[];
  play: PlayProfile;
  /** 適合誰 */
  audience: string[];
  languages: string[];
  /** weekly open start times the coach publishes (F5-4) */
  availability: Partial<Record<Weekday, string[]>>;
  plans: Plan[];
  timeline: TimelineItem[];
  venues: { name: string; sub: string; courtId?: string }[];
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
  profile: CoachProfile;
}

export interface BookingDay {
  key: string;
  weekday: Weekday;
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
  /** set when the request is a 揪團 group booking */
  groupId?: string;
  headcount?: number;
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

export interface GroupMember {
  name: string;
  initial: string;
  you?: boolean;
  paid?: boolean;
}

/** 揪朋友一起上: gathering → (min reached) requested → coach confirms → each member pays their share. */
export type GroupStatus = "gathering" | "requested" | "confirmed" | "declined";

export interface Group {
  id: string;
  coachId: string;
  planId: string;
  dayKey: string;
  slot: string;
  /** organiser's name; members[0] is the organiser */
  host: string;
  members: GroupMember[];
  status: GroupStatus;
  note: string;
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

/** 問與答: a student asks on the coach page; once the coach replies, question and answer are public on that page.
 *  Replaces "ask on LINE" so students and coaches talk inside PIKYOO (docs/PRD.md F3-11). */
export interface Question {
  id: string;
  coachId: string;
  name: string;
  /** asker's level label, e.g. 新手 / 2.5 */
  level: string;
  text: string;
  askedAt: string;
  answer?: { text: string; at: string };
  /** asked by the signed-in student; an unanswered question is shown only to its asker (and the coach) */
  mine?: boolean;
}
