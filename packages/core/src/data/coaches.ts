import type { BookingDay, BookingRequest, Coach, Group, PaymentRow, Slot } from "../types";
import { demoDate, demoDay } from "./today.ts"; // .ts: the seed generator runs this file in plain Node

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
      photos: [
        { src: "/photos/mia-cover.jpg", alt: "女教練拿著球拍在室內球場準備接球", caption: "大安運動中心" },
        { src: "/photos/mia-lesson.jpg", alt: "女教練在室內球場拿著球拍和球準備發球", caption: "第一堂課：握拍與準備姿勢" },
        { src: "/photos/mia-group.jpg", alt: "兩位學員在室內球場對打練習", caption: "小班課：網前小球" },
      ],
      play: { since: "2022", hand: "右手", format: "雙打為主", background: "網球教練 8 年", strengths: ["零基礎入門", "發球與接發球", "網前小球（dink）", "網球轉匹克球的揮拍修正"] },
      audience: ["第一次拿拍", "打過網球、羽球想轉項", "想先上課再去打新手局", "跟朋友一起來的小班"],
      languages: ["中文", "英文"],
      availability: { 二: ["19:30"], 三: ["19:30"], 五: ["20:00"], 六: ["09:00", "14:00"], 日: ["10:00", "15:00"] },
      plans: [
        { id: "trial", name: "新手體驗課", durationMin: 60, size: "2–4 人", price: 600, unit: "/人", note: "含借拍與球・第一次打也 OK", tag: "最多人選", group: { min: 2, max: 4 } },
        { id: "p1", name: "一對一", durationMin: 60, size: "1 人", price: 1500, unit: "/堂", note: "場地費另計（約 NT$200，教練代訂）" },
        { id: "small", name: "小班課", durationMin: 90, size: "3–4 人", price: 800, unit: "/人", note: "同程度分組，可自組朋友班", group: { min: 3, max: 4 } },
        { id: "pack", name: "一對一 10 堂", durationMin: 60, size: "1 人", price: 13500, unit: "/10 堂", note: "每堂 NT$1,350・6 個月內用完", tag: "省 NT$1,500" },
      ],
      timeline: [
        { year: "2026", text: "中華民國匹克球協會 認證教練", kind: "cert" },
        { year: "2025", text: "TMLP 台北站 女子雙打 第 5 名", kind: "trophy" },
        { year: "2024", text: "開始教匹克球，累計 128 位學生", kind: "users" },
        { year: "2016–24", text: "網球教練（8 年）", kind: "cap" },
      ],
      venues: [{ name: "大安運動中心", sub: "室內 4 面・大安區", courtId: "daan" }, { name: "信義運動中心", sub: "室內 3 面・信義區", courtId: "xinyi" }],
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
    areas: ["信義", "松山"], levelMin: 2, levelMax: 5, types: ["一對一", "小班"], priceFrom: 900,
    nextSlot: "週四 10/1 19:30", style: ["比賽策略", "第三拍", "雙打站位"], beginnerFriendly: false,
    years: 4, students: 86, rating: 4.8, reviews: 22, tagline: "TMLP 台北站雙打銅牌，把 3.0 打到 3.5。",
    profile: {
      slug: "pikyoo.tw/c/zhao",
      reply: "通常當天回覆",
      bio: "很多人卡在 3.0，是因為第三拍和網前轉換沒有固定打法。我會先看你打一局，找出最常失分的兩個球，接下來每堂課只練那兩個，直到比賽裡用得出來。",
      photos: [
        { src: "/photos/zhao-cover.jpg", alt: "男教練在室內球場網前低手救球", caption: "信義運動中心" },
        { src: "/photos/zhao-lesson.jpg", alt: "雙打練習中，球員在網前壓低準備截擊", caption: "雙打站位與換位" },
        { src: "/photos/zhao-match.jpg", alt: "室內比賽場館裡的雙打比賽", caption: "帶學生參加積分賽" },
      ],
      play: { since: "2020", hand: "右手", format: "雙打為主", background: "桌球校隊、羽球 10 年", strengths: ["第三拍 drop", "重置球（reset）", "雙打站位與換位", "比賽策略"] },
      audience: ["2.5–3.0 想升級", "準備參加積分賽", "固定球友想一起練戰術"],
      languages: ["中文"],
      availability: { 二: ["20:00"], 四: ["19:30", "21:00"], 六: ["16:00"], 日: ["09:00"] },
      plans: [
        { id: "p1", name: "一對一", durationMin: 60, size: "1 人", price: 1200, unit: "/堂", note: "先打一局評估，再排練習重點" },
        { id: "small", name: "戰術小班", durationMin: 90, size: "3–4 人", price: 900, unit: "/人", note: "同程度 2 對 2 實戰＋暫停講解", group: { min: 3, max: 4 } },
        { id: "pack", name: "一對一 10 堂", durationMin: 60, size: "1 人", price: 11000, unit: "/10 堂", note: "每堂 NT$1,100・4 個月內用完", tag: "省 NT$1,000" },
      ],
      timeline: [
        { year: "2026", text: "中華民國匹克球總會 丙級教練", kind: "cert" },
        { year: "2025", text: "PPR Certified Coach", kind: "cert" },
        { year: "2025", text: "TMLP 台北站 男子雙打 第 3 名", kind: "trophy" },
        { year: "2022", text: "開始教匹克球，累計 86 位學生", kind: "users" },
      ],
      venues: [{ name: "信義運動中心", sub: "室內 3 面・信義區", courtId: "xinyi" }, { name: "松山運動中心", sub: "室內・松山區" }],
      steps: ["先打一局，找出最常失分的兩個球", "每堂只練那兩個球，拆解到你能重複", "2 對 2 實戰，比賽裡用出來才算數"],
      pay: ["銀行轉帳", "現場付現"],
      policy: "上課前 48 小時可免費改期；48 小時內取消收全額。",
      quotes: [
        { name: "阿睿", level: "3.0 → 3.5", text: "第三拍終於不再亂打，積分賽第一次打進八強。" },
        { name: "Peggy", level: "3.0", text: "講解很有邏輯，每次都知道下一步要練什麼。" },
      ],
    },
  },
  {
    id: "ann", name: "安妮", initial: "安",
    creds: [{ issuer: "IPTPA", level: "Level 1", verified: true }],
    areas: ["中山", "大同"], levelMin: 0, levelMax: 2, types: ["體驗課", "團體"], priceFrom: 400,
    nextSlot: "週六 10/3 09:00", style: ["團體課", "親子", "可英文授課"], beginnerFriendly: true,
    years: 2, students: 210, rating: 4.9, reviews: 41, tagline: "週末團體課，一個人來也能馬上找到球伴。",
    profile: {
      slug: "pikyoo.tw/c/ann",
      reply: "通常 1 小時內回覆",
      bio: "團體課的好處是：你會認識一群程度差不多的球友。我的課前半小時練基本動作，後面一小時分組打比賽，下課前大家常常就約好下一次一起打了。",
      photos: [
        { src: "/photos/ann-cover.jpg", alt: "女教練在室內球場網前準備接球", caption: "中山運動中心" },
        { src: "/photos/ann-group.jpg", alt: "週末團體課學員在戶外球場分組打雙打", caption: "週末團體課：分組比賽" },
        { src: "/photos/ann-gear.jpg", alt: "球網前放著兩支球拍和幾顆洞洞球", caption: "借拍與球都準備好了" },
      ],
      play: { since: "2022", hand: "右手", format: "雙打為主", background: "兒童體適能教練 5 年", strengths: ["零基礎入門", "團體分組練習", "發球與接發球", "親子課"] },
      audience: ["一個人想找球伴", "第一次拿拍", "親子一起學", "英文授課需求"],
      languages: ["中文", "英文"],
      availability: { 三: ["19:00"], 六: ["09:00", "14:00"], 日: ["09:00"] },
      plans: [
        { id: "trial", name: "團體體驗課", durationMin: 90, size: "4–8 人", price: 450, unit: "/人", note: "含借拍與球・一個人報名也可以", tag: "新手首選", group: { min: 2, max: 8 } },
        { id: "group", name: "週末團體課", durationMin: 90, size: "6–8 人", price: 400, unit: "/人", note: "前 30 分鐘基本動作，後 60 分鐘分組比賽", group: { min: 4, max: 8 } },
        { id: "family", name: "親子課", durationMin: 60, size: "1 大 1 小", price: 900, unit: "/堂", note: "小朋友 7 歲以上" },
      ],
      timeline: [
        { year: "2025", text: "IPTPA Level 1 認證", kind: "cert" },
        { year: "2024", text: "開始帶週末團體課，累計 210 位學生", kind: "users" },
        { year: "2019–24", text: "兒童體適能教練（5 年）", kind: "cap" },
      ],
      venues: [{ name: "中山運動中心", sub: "室內 4 面・中山區", courtId: "zhongshan" }, { name: "大佳河濱公園", sub: "室外 6 面・中山區", courtId: "dajia" }],
      steps: ["30 分鐘基本動作：握拍、發球、接發", "分組輪轉，每個人都有很多擊球機會", "小比賽＋認識球友，下課一起約下次"],
      pay: ["LINE Pay", "現場付現"],
      policy: "上課前 24 小時可免費取消；雨天室外課改到室內或延期。",
      quotes: [
        { name: "葉子", level: "新手", text: "一個人去完全不尷尬，下課就加了三個球友。" },
        { name: "Emily", level: "2.0", text: "Classes in English were really helpful for me." },
      ],
    },
  },
  {
    id: "ray", name: "Ray 陳", initial: "R",
    creds: [{ issuer: "DUPR", level: "4.65", verified: false }],
    areas: ["內湖", "南港"], levelMin: 3, levelMax: 6, types: ["一對一"], priceFrom: 1000,
    nextSlot: "週三 9/30 19:00", style: ["進階陪練", "比賽準備"], beginnerFriendly: false,
    years: 1, students: 24, rating: null, reviews: 0, tagline: "4.5 以上陪練，備戰積分賽。",
    profile: {
      slug: "pikyoo.tw/c/ray",
      reply: "通常當天回覆",
      bio: "我自己還在打 DUPR 積分賽，所以課程就是比賽節奏：高強度對抽、發球變化、單打跑位。適合已經會打、想找強度的人。",
      photos: [
        { src: "/photos/ray-cover.jpg", alt: "男球員左手持拍在室內球場網前擊球", caption: "內湖運動中心" },
        { src: "/photos/ray-match.jpg", alt: "室內比賽場館裡的雙打比賽", caption: "陪學生備戰積分賽" },
      ],
      play: { since: "2019", hand: "左手", format: "單打、雙打都教", background: "網球選手出身", strengths: ["快速對抽（hands battle）", "發球變化", "單打戰術", "比賽心理"] },
      audience: ["3.5 以上想找強度", "備戰 DUPR 積分賽", "想練單打"],
      languages: ["中文", "英文"],
      availability: { 一: ["20:00"], 三: ["19:00"], 五: ["20:00"], 日: ["15:00"] },
      plans: [
        { id: "p1", name: "一對一陪練", durationMin: 60, size: "1 人", price: 1500, unit: "/堂", note: "比賽強度，需有 3.5 以上程度" },
        { id: "duo", name: "兩人陪練", durationMin: 90, size: "2 人", price: 1000, unit: "/人", note: "帶一位球友一起來，練雙打配合", group: { min: 2, max: 2 } },
      ],
      timeline: [
        { year: "2026", text: "DUPR 4.65（自填，待驗證）", kind: "trophy" },
        { year: "2025", text: "開始陪練教學，累計 24 位學生", kind: "users" },
        { year: "2012–18", text: "網球選手（高中、大專盃）", kind: "cap" },
      ],
      venues: [{ name: "內湖運動中心", sub: "室內 3 面・內湖區", courtId: "neihu" }],
      steps: ["暖身後直接比賽強度對抽", "針對弱點設計情境練習", "模擬積分賽的一局，檢討每一分"],
      pay: ["銀行轉帳", "LINE Pay"],
      policy: "上課前 24 小時可免費改期。",
      quotes: [],
    },
  },
];

export const getCoach = (id: string) => COACHES.find((c) => c.id === id);

/** Verified by an association (DUPR is always self-reported). */
export const isCertified = (c: Coach) => c.creds.some((x) => x.verified && x.issuer !== "DUPR");

/** The demo's booking week: tomorrow and the six days after (keys d1–d7 stay fixed, dates follow today). */
export const bookingDays = (): BookingDay[] => Array.from({ length: 7 }, (_, i) => ({ key: `d${i + 1}`, ...demoDay(i + 1) }));

/** 最近可約 on a demo coach card: the first open weekly time in the booking week. */
export function nextSlotOf(c: Coach): string {
  for (const d of bookingDays()) {
    const t = c.profile.availability[d.weekday]?.[0];
    if (t) return `週${d.weekday} ${d.date} ${t}`;
  }
  return "尚未開放時段";
}

/** Seats left per session (day key + start time); a session not listed has the plan's full size. Mock. */
const SEATS_LEFT: Record<string, number> = {
  "mia:d1-19:30": 1, "mia:d3-20:00": 2, "mia:d4-09:00": 0, "mia:d4-14:00": 3, "mia:d5-10:00": 2, "mia:d5-15:00": 4, "mia:d7-19:30": 3,
  "ann:d4-09:00": 2, "zhao:d2-21:00": 0,
};

/** Open sessions on a day, from the coach's weekly availability. */
export const slotsFor = (c: Coach, day: BookingDay): Slot[] =>
  (c.profile.availability[day.weekday] ?? []).map((t) => [t, SEATS_LEFT[`${c.id}:${day.key}-${t}`] ?? 4]);

export const PAY_HINT: Record<string, string> = {
  "LINE Pay": "確認後打開教練的付款連結，付好按一下通知教練",
  銀行轉帳: "確認後顯示帳號，回報末五碼",
  現場付現: "上課當天付給教練",
};

// — coach console (Mia's view) —

export const initialRequests = (): BookingRequest[] => [
  { id: "r1", initial: "安", name: "小安", level: "新手", firstTime: true, when: `${demoDate(5)}10:00`, plan: "新手體驗課 ×1", amount: 600, note: "第一次打，之前打過羽球。", expiresIn: "46 小時", pay: "LINE Pay", status: "pending" },
  { id: "r2", initial: "J", name: "Jason", level: "2.5", firstTime: false, times: 4, when: `${demoDate(8)}19:30`, plan: "一對一 60 分", amount: 1500, note: "想加強反手截擊", expiresIn: "31 小時", pay: "銀行轉帳", status: "pending" },
];

export const initialPayments = (): PaymentRow[] => [
  { id: "p1", initial: "葉", name: "葉子", what: `小班課・${demoDate(2)}`, amount: 800, via: "銀行轉帳", status: "reported", ref: "88120", at: "今天 09:12 回報" },
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

/** A 揪團 already under way: 小安 is gathering friends for Mia's 小班課 on Saturday. */
export const initialGroups = (): Group[] => [
  {
    id: "grp1", coachId: "mia", planId: "small", dayKey: "d4", slot: "14:00", host: "小安", status: "gathering",
    members: [{ name: "小安", initial: "安", you: true }, { name: "葉子", initial: "葉" }],
    note: "同事三四個人，都是新手。",
  },
];
