import type { BookingDay, BookingRequest, Coach, PaymentRow, Slot } from "../types";

// Mock coaches, slots and coach-console data — content from prototype/coach-kit.js and PIKYOO-coach.html.

export const COACHES: Coach[] = [
  {
    id: "mia", name: "Mia 林", initial: "M",
    creds: [{ issuer: "協會", level: "認證教練", verified: true }, { issuer: "DUPR", level: "4.21", verified: false }],
    areas: ["大安", "信義"], levelMin: 0, levelMax: 3, types: ["體驗課", "一對一", "小班"], priceFrom: 600,
    nextSlot: "週日 10/4 10:00", style: ["新手友善", "拆解動作", "影片回饋"], beginnerFriendly: true,
    years: 3, students: 128, rating: 4.9, reviews: 36,
    tagline: "網球教練 8 年轉匹克球，專帶第一次拿拍的人。",
    profile: {
      slug: "pikyoo.tw/c/mia",
      reply: "通常 2 小時內回覆",
      bio: "我相信第一堂課最重要的是「打得到球、想再來」。每堂課會拍一段你的揮拍影片，課後用 LINE 傳給你，附上一個回家可以練的重點。",
      plans: [
        { id: "trial", name: "新手體驗課", durationMin: 60, size: "2–4 人", price: 600, unit: "/人", note: "含借拍與球・第一次打也 OK", tag: "最多人選" },
        { id: "p1", name: "一對一", durationMin: 60, size: "1 人", price: 1500, unit: "/堂", note: "場地費另計（約 NT$200，教練代訂）" },
        { id: "small", name: "小班課", durationMin: 90, size: "3–4 人", price: 800, unit: "/人", note: "同程度分組，可自組朋友班" },
        { id: "pack", name: "一對一 10 堂", durationMin: 60, size: "1 人", price: 13500, unit: "/10 堂", note: "每堂 NT$1,350・6 個月內用完", tag: "省 NT$1,500" },
      ],
      timeline: [
        { year: "2026", text: "中華民國匹克球協會 認證教練", kind: "cert" },
        { year: "2025", text: "TMLP 台北站 女子雙打 第 5 名", kind: "trophy" },
        { year: "2024", text: "開始教匹克球，累計 128 位學生", kind: "users" },
        { year: "2016–24", text: "網球教練（8 年）", kind: "cap" },
      ],
      venues: [{ name: "大安運動中心", sub: "室內 4 面・大安區" }, { name: "信義運動中心", sub: "室內 3 面・信義區" }],
      steps: ["握拍與準備姿勢，先把球打過網", "分解動作＋當場錄影給你看", "小比賽實戰，課後 LINE 傳影片與功課"],
      pay: ["LINE Pay", "銀行轉帳", "現場付現"],
      policy: "上課前 24 小時可免費改期或取消；24 小時內取消收 50%。",
      quotes: [
        { name: "小芸", level: "新手 → 2.5", text: "第一堂就能對打十拍，影片回饋超有用。" },
        { name: "Jason", level: "2.5", text: "把我網球的揮拍習慣一個一個拆掉，很有耐心。" },
      ],
    },
  },
  {
    id: "zhao", name: "趙柏宇", initial: "趙",
    creds: [{ issuer: "總會", level: "丙級教練", verified: true }, { issuer: "PPR", level: "Certified", verified: true }],
    areas: ["信義", "松山"], levelMin: 2, levelMax: 5, types: ["一對一", "小班"], priceFrom: 1200,
    nextSlot: "今天 20:00", style: ["比賽策略", "第三拍", "雙打站位"], beginnerFriendly: false,
    years: 4, students: 86, rating: 4.8, reviews: 22, tagline: "TMLP 台北站雙打銅牌，把 3.0 打到 3.5。",
  },
  {
    id: "ann", name: "安妮", initial: "安",
    creds: [{ issuer: "IPTPA", level: "Level 1", verified: true }],
    areas: ["中山", "大同"], levelMin: 0, levelMax: 2, types: ["體驗課", "團體"], priceFrom: 450,
    nextSlot: "週六 10/3 09:00", style: ["團體課", "親子", "可英文授課"], beginnerFriendly: true,
    years: 2, students: 210, rating: 4.9, reviews: 41, tagline: "週末團體課，一個人來也能馬上找到球伴。",
  },
  {
    id: "ray", name: "Ray 陳", initial: "R",
    creds: [{ issuer: "DUPR", level: "4.65", verified: false }],
    areas: ["內湖", "南港"], levelMin: 3, levelMax: 6, types: ["一對一"], priceFrom: 1500,
    nextSlot: "週三 10/7 19:00", style: ["進階陪練", "比賽準備"], beginnerFriendly: false,
    years: 1, students: 24, rating: null, reviews: 0, tagline: "4.5 以上陪練，備戰積分賽。",
  },
];

export const getCoach = (id: string) => COACHES.find((c) => c.id === id);

/** Verified by an association (DUPR is always self-reported). */
export const isCertified = (c: Coach) => c.creds.some((x) => x.verified && x.issuer !== "DUPR");

export const BOOKING_DAYS: BookingDay[] = [
  { key: "d1", weekday: "三", date: "9/30" },
  { key: "d2", weekday: "四", date: "10/1" },
  { key: "d3", weekday: "五", date: "10/2" },
  { key: "d4", weekday: "六", date: "10/3" },
  { key: "d5", weekday: "日", date: "10/4" },
  { key: "d6", weekday: "一", date: "10/5" },
  { key: "d7", weekday: "二", date: "10/6" },
];

export const SLOTS: Record<string, Slot[]> = {
  d1: [["19:30", 1]],
  d2: [],
  d3: [["20:00", 2]],
  d4: [["09:00", 0], ["14:00", 3]],
  d5: [["10:00", 2], ["15:00", 4]],
  d6: [],
  d7: [["19:30", 3]],
};

export const PAY_HINT: Record<string, string> = {
  "LINE Pay": "確認後收到付款連結，一鍵完成",
  銀行轉帳: "確認後顯示帳號，回報末五碼",
  現場付現: "上課當天付給教練",
};

// — coach console (Mia's view) —

export const initialRequests = (): BookingRequest[] => [
  { id: "r1", initial: "安", name: "小安", level: "新手", firstTime: true, when: "10/4（日）10:00", plan: "新手體驗課 ×1", amount: 600, note: "第一次打，之前打過羽球。", expiresIn: "46 小時", pay: "LINE Pay", status: "pending" },
  { id: "r2", initial: "J", name: "Jason", level: "2.5", firstTime: false, times: 4, when: "10/7（三）19:30", plan: "一對一 60 分", amount: 1500, note: "想加強反手截擊", expiresIn: "31 小時", pay: "銀行轉帳", status: "pending" },
];

export const initialPayments = (): PaymentRow[] => [
  { id: "p1", initial: "葉", name: "葉子", what: "小班課・10/1（四）", amount: 800, via: "銀行轉帳", status: "reported", ref: "88120", at: "今天 09:12 回報" },
  { id: "p2", initial: "何", name: "阿何", what: "小班課・今天 19:30", amount: 800, via: "LINE Pay", status: "wait", at: "已傳付款連結，尚未付" },
  { id: "p3", initial: "P", name: "Peggy", what: "一對一 10 堂（第 3/10 堂）", amount: 13500, via: "LINE Pay", status: "paid", at: "9/28" },
  { id: "p4", initial: "周", name: "小周", what: "小班課・今天 19:30", amount: 800, via: "現場付現", status: "paid", at: "9/29" },
];

/** Received earlier this month, outside the rows shown. */
export const RECEIVED_BEFORE = 16400;

export const TODAY_AGENDA = [
  { start: "10:00", end: "11:00", title: "一對一", who: "Peggy", where: "大安運動中心", status: "已付款", tone: "open" as const },
  { start: "19:30", end: "21:00", title: "小班課（3/4）", who: "小周、阿何、葉子", where: "信義運動中心", status: "1 人未付", tone: "almost" as const },
];

export const PAYOUT_METHODS = [
  { name: "LINE Pay", sub: "收款連結 line.me/pay/…mia", on: true },
  { name: "銀行轉帳", sub: "台新 812・尾號 4567", on: true },
  { name: "街口支付", sub: "尚未設定", on: false },
  { name: "現場付現", sub: "上課當天收", on: true },
];

export const PAGE_CHECKLIST: [string, boolean][] = [
  ["照片與自介", true],
  ["認證（協會已查驗）", true],
  ["課程與價目 4 項", true],
  ["授課地點 2 處", true],
  ["開放時段", true],
  ["教學影片", false],
];
