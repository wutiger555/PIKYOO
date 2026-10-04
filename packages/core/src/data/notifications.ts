import type { Notice } from "../source/notifications";
import { demoDay } from "./today.ts"; // .ts: plain Node may import data files (seed generator)

/** The demo's bell: a few of the events a student and Mia would get, dated relative to today. */
export const demoNotices = (): Notice[] => [
  { id: "n1", title: "教練確認了你的預約", body: "照付款資訊付款就完成了", href: "/me/booking?demo=confirmed", at: `${demoDay(0).date} 09:12`, read: false },
  { id: "n2", title: "候補成功！你遞補上球局了", href: "/games/g5", at: `${demoDay(0).date} 08:40`, read: false },
  { id: "n3", title: "教練回覆了你的問題", href: "/coaches/mia", at: `${demoDay(-1).date} 21:05`, read: true },
  { id: "n4", title: "你報名的球局資訊有變動", body: "時間、地點或費用有更新，點進去看看", href: "/games/g1", at: `${demoDay(-2).date} 18:30`, read: true },
];
