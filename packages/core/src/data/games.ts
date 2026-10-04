import type { DayGroup, Game, Participant } from "../types";

// Mock games — content from prototype/PIKYOO-core-flow.html. "Today" is 9/29（二）.

export const DAY_GROUPS: Record<DayGroup, string> = {
  today: "今天 9/29（二）",
  tomorrow: "明天 9/30（三）",
  sat: "週六 10/3",
  sun: "週日 10/4",
};

export const ME = { name: "小安", level: 1 as const };

export const AREAS = ["大安區", "信義區", "中山區", "內湖區", "板橋區", "松山區"];

const NAMES: Record<string, string> = {
  林: "林小姐", 安: "安安", M: "Mandy", 吳: "吳大哥", 陳: "陳 Ray", 許: "許許", 周: "小周",
  P: "Peggy", 柏: "柏翰", 宇: "宇恆", 葉: "葉子", 潘: "潘潘", 蔡: "蔡哥", J: "Jason", 何: "阿何",
};
const people = (hostName: string, initials: string[]): Participant[] =>
  initials.map((initial, i) => ({ initial, name: i === 0 ? hostName : (NAMES[initial] ?? initial) }));

export const GAMES: Game[] = [
  {
    id: "g1", courtId: "daan", group: "today", dayLabel: "今天", weekday: "二", date: "9/29", startsAt: "19:00", endsAt: "21:00",
    venue: "大安運動中心", district: "大安區", courtKind: "室內 4 面", address: "台北市大安區辛亥路三段 55 號",
    levelMin: 2, levelMax: 3, capacity: 8, participants: people("阿凱", ["凱", "林", "安", "M", "吳", "陳"]),
    host: { name: "阿凱", initial: "凱", summary: "開過 42 團・3 個 LINE 群組" },
    fee: 150, payNote: "現場付現給團主", beginnerFriendly: false, waitlist: 0,
    notes: "球由團主準備，現場有 2 支拍可借。打輪轉，一場 11 分。",
  },
  {
    id: "g2", courtId: "xinyi", group: "today", dayLabel: "今天", weekday: "二", date: "9/29", startsAt: "20:00", endsAt: "22:00",
    venue: "信義運動中心", district: "信義區", courtKind: "室內 3 面", address: "台北市信義區松勤街 100 號",
    levelMin: 0, levelMax: 2, capacity: 8, participants: people("小芸", ["芸", "許", "周", "林", "P"]),
    host: { name: "小芸", initial: "芸", summary: "開過 18 團・新手友善團主" },
    fee: 200, payNote: "轉帳或現場付現", beginnerFriendly: true, waitlist: 0,
    notes: "第一次打也可以來！前 20 分鐘會先帶規則和發球。",
  },
  {
    id: "g3", courtId: "dajia", group: "tomorrow", dayLabel: "明天", weekday: "三", date: "9/30", startsAt: "07:00", endsAt: "09:00",
    venue: "大佳河濱公園", district: "中山區", courtKind: "室外 6 面", address: "台北市中山區濱江街 5 號",
    levelMin: 3, levelMax: 4, capacity: 4, participants: people("豪哥", ["豪", "柏", "宇"]),
    host: { name: "豪哥", initial: "豪", summary: "開過 67 團" },
    fee: 50, payNote: "現場付現", beginnerFriendly: false, waitlist: 0,
    notes: "下雨取消，前一晚 22:00 在群組通知。",
  },
  {
    id: "g4", courtId: "banqiao", group: "sat", dayLabel: "週六", weekday: "六", date: "10/3", startsAt: "14:00", endsAt: "16:00",
    venue: "新北市板橋第一運動場風雨球場", district: "板橋區", courtKind: "風雨 2 面", address: "新北市板橋區漢生東路 278 號",
    levelMin: 0, levelMax: 2, capacity: 6, participants: people("小芸", ["芸", "許", "周"]),
    host: { name: "小芸", initial: "芸", summary: "開過 18 團・新手友善團主" },
    fee: 180, payNote: "現場付現", beginnerFriendly: true, waitlist: 0,
    notes: "新手團，會分程度輪轉。",
  },
  {
    id: "g5", courtId: "neihu", group: "sat", dayLabel: "週六", weekday: "六", date: "10/3", startsAt: "19:00", endsAt: "21:30",
    venue: "內湖運動中心", district: "內湖區", courtKind: "室內 3 面", address: "台北市內湖區洲子街 12 號",
    levelMin: 4, levelMax: 5, capacity: 6, participants: people("阿睿", ["睿", "葉", "潘", "蔡", "J", "何"]),
    host: { name: "阿睿", initial: "睿", summary: "開過 31 團" },
    fee: 250, payNote: "轉帳（報名後團主提供帳號）", beginnerFriendly: false, waitlist: 2,
    notes: "比賽節奏，請準時到場熱身。",
  },
  {
    id: "g6", courtId: "zhongshan", group: "sun", dayLabel: "週日", weekday: "日", date: "10/4", startsAt: "10:00", endsAt: "12:00",
    venue: "中山運動中心", district: "中山區", courtKind: "室內 4 面", address: "台北市中山區中山北路二段 44 巷 2 號",
    levelMin: 1, levelMax: 3, capacity: 8, participants: people("阿凱", ["凱", "M", "吳", "安"]),
    host: { name: "阿凱", initial: "凱", summary: "開過 42 團・3 個 LINE 群組" },
    fee: 150, payNote: "現場付現給團主", beginnerFriendly: true, waitlist: 0,
    notes: "週日早場，打完一起吃早午餐。",
  },
];

export const getGame = (id: string) => GAMES.find((g) => g.id === id);

export const LESSONS = [
  { id: "l1", when: "週日 10/4・10:00", title: "新手體驗課：兩小時上場", coach: "Mia 教練", coachId: "mia", courtId: "daan", initial: "M", issuer: "協會", credLevel: "認證", where: "大安運動中心・剩 3 位", price: 600 },
  { id: "l2", when: "週三 10/7・19:30", title: "發球與第三拍小班", coach: "趙教練", coachId: "zhao", courtId: "xinyi", initial: "趙", issuer: "總會", credLevel: "丙級", where: "信義運動中心・剩 2 位", price: 800, avatarBg: "var(--color-accent-2-700)" },
];

