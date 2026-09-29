import type { Court } from "../types";

// Mock courts — the venues the mock games use. Hours, prices and booking details are placeholders
// until the 雙北 court data build (docs/PRD.md F4, 資料建置) replaces them.

export const COURTS: Court[] = [
  {
    id: "daan", name: "大安運動中心", district: "大安區", address: "台北市大安區辛亥路三段 55 號",
    kind: "室內", courtCount: 4, surface: "PU 多功能球場", free: false, priceNote: "每面每小時約 NT$400（依時段）",
    hours: "每天 06:00–22:00", amenities: ["冷氣", "淋浴", "停車", "租拍"], aircon: true, lights: true,
    booking: "公立預約系統", bookingNote: "運動中心官網線上預約，開放 14 天內的時段", rules: "需穿室內運動鞋；每次預約最多 2 小時。",
    verified: "2026/09", distance: "1.2 km", map: [44, 58],
  },
  {
    id: "xinyi", name: "信義運動中心", district: "信義區", address: "台北市信義區松勤街 100 號",
    kind: "室內", courtCount: 3, surface: "PU 多功能球場", free: false, priceNote: "每面每小時約 NT$450（依時段）",
    hours: "每天 06:00–22:00", amenities: ["冷氣", "淋浴", "停車"], aircon: true, lights: true,
    booking: "公立預約系統", bookingNote: "運動中心官網線上預約", rules: "需穿室內運動鞋。",
    verified: "2026/09", distance: "2.6 km", map: [70, 52],
  },
  {
    id: "dajia", name: "大佳河濱公園", district: "中山區", address: "台北市中山區濱江街 5 號",
    kind: "室外", courtCount: 6, surface: "硬地", free: true, priceNote: "免費",
    hours: "全天開放・夜間照明到 22:00", amenities: ["夜間照明", "停車"], aircon: false, lights: true,
    booking: "免預約", bookingNote: "先到先打，週末早上人多", rules: "下雨地滑請勿使用；請自備球網以外的器材。",
    verified: "2026/09", distance: "3.8 km", map: [40, 20],
  },
  {
    id: "zhongshan", name: "中山運動中心", district: "中山區", address: "台北市中山區中山北路二段 44 巷 2 號",
    kind: "室內", courtCount: 4, surface: "PU 多功能球場", free: false, priceNote: "每面每小時約 NT$400（依時段）",
    hours: "每天 06:00–22:00", amenities: ["冷氣", "淋浴", "租拍"], aircon: true, lights: true,
    booking: "公立預約系統", bookingNote: "運動中心官網線上預約", rules: "需穿室內運動鞋。",
    distance: "4.1 km", map: [30, 34],
  },
  {
    id: "neihu", name: "內湖運動中心", district: "內湖區", address: "台北市內湖區洲子街 12 號",
    kind: "室內", courtCount: 3, surface: "PU 多功能球場", free: false, priceNote: "每面每小時約 NT$350（依時段）",
    hours: "每天 06:00–22:00", amenities: ["冷氣", "停車"], aircon: true, lights: true,
    booking: "公立預約系統", bookingNote: "運動中心官網線上預約", rules: "需穿室內運動鞋。",
    distance: "7.9 km", map: [82, 18],
  },
  {
    id: "banqiao", name: "新北市板橋第一運動場風雨球場", district: "板橋區", address: "新北市板橋區漢生東路 278 號",
    kind: "風雨", courtCount: 2, surface: "硬地", free: false, priceNote: "每小時約 NT$200",
    hours: "每天 06:00–22:00", amenities: ["夜間照明", "停車"], aircon: false, lights: true,
    booking: "電話預約", bookingNote: "打電話到場館管理室預約", rules: "颱風與豪雨停開。",
    distance: "9.5 km", map: [12, 76],
  },
];

export const getCourt = (id: string) => COURTS.find((c) => c.id === id);

/** Every 雙北 district, for onboarding and filters. */
export const DISTRICTS = [
  "中正區", "大同區", "中山區", "松山區", "大安區", "萬華區", "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區",
  "板橋區", "新莊區", "中和區", "永和區", "三重區", "新店區", "土城區", "蘆洲區", "汐止區", "林口區",
];

/** 大安區・信義區 → 大安・信義 */
export const shortAreas = (areas: string[]) => (areas.length ? areas.map((a) => a.replace(/區$/, "")).join("・") : "還沒設定區域");
