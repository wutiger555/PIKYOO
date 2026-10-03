import type { Catalog } from "@pikyoo/core/source/types";
import type { DayGroup, Level } from "@pikyoo/core/types";

// AI 一貼成局 (docs/PRD.md F2-8). This rule-based parser stands in for the LLM call so the
// flow works offline; it returns the same shape — a pre-filled draft plus the fields that
// need the host's confirmation — so the LLM can replace parseGameText() without UI changes.

export type PayKind = "現場付現" | "轉帳" | "免費";

export interface Draft {
  group: DayGroup | null;
  start: string;
  end: string;
  /** courts.id, or "other" with venueText */
  courtId: string;
  venueText: string;
  levelMin: Level;
  levelMax: Level;
  capacity: number;
  hostCounts: boolean;
  fee: string;
  pay: PayKind;
  cancelHours: number;
  beginner: boolean;
  notes: string;
}

export type DraftField = keyof Draft;

export const emptyDraft = (): Draft => ({
  group: null, start: "", end: "", courtId: "", venueText: "", levelMin: 1, levelMax: 3,
  capacity: 8, hostCounts: true, fee: "", pay: "現場付現", cancelHours: 12, beginner: false, notes: "",
});

export const SAMPLE_TEXT = "🔥週六 10/3 14:00-16:00 大安運動中心 2.5-3.0 徵8人 缺2 每人150 現場付 新手勿入";

const LEVEL_OF: Record<string, Level> = { "2.0": 1, "2.5": 2, "3.0": 3, "3.5": 4, "4.0": 5, "4.5": 6, "5.0": 6 };
const lv = (x: string): Level | undefined => LEVEL_OF[Number(x).toFixed(1)];
/** what people type in a 揪團 post, e.g. 「大安」 for 大安運動中心 — a match on these stays unsure */
const SHORT_NAME: Record<string, string> = { daan: "大安", xinyi: "信義", dajia: "大佳", zhongshan: "中山", neihu: "內湖", banqiao: "板橋" };
const hhmm = (h: string, m = "00") => `${h.padStart(2, "0")}:${m}`;

export function parseGameText(text: string, { courts, dayGroups }: Pick<Catalog, "courts" | "dayGroups">): { draft: Draft; unsure: DraftField[] } {
  const d = emptyDraft();
  const sure = new Set<DraftField>();
  const t = text.replace(/[：]/g, ":").replace(/[～〜~－—]/g, "-");

  // date: 今天 / 明天 / 週六 / 週日, or a date that is in the demo calendar
  const day = t.match(/今天|今晚|明天|明晚|週六|周六|星期六|週日|周日|星期日|禮拜六|禮拜天/)?.[0];
  if (day) {
    d.group = /今/.test(day) ? "today" : /明/.test(day) ? "tomorrow" : /六/.test(day) ? "sat" : "sun";
    sure.add("group");
  }
  const md = t.match(/(\d{1,2})\/(\d{1,2})/)?.[0];
  if (md) {
    const hit = (Object.keys(dayGroups) as DayGroup[]).find((k) => dayGroups[k].includes(md));
    if (hit && (!d.group || d.group === hit)) { d.group = hit; sure.add("group"); }
    else if (hit) d.group = hit; // weekday and date disagree → keep unsure
  }

  // time range: 14:00-16:00 / 14-16 / 下午2-4
  for (const r of t.matchAll(/(?<![\d./])(\d{1,2})(?::(\d{2}))?\s*-\s*(\d{1,2})(?::(\d{2}))?(?![\d./])/g)) {
    let [sh, eh] = [Number(r[1]), Number(r[3])];
    if (/下午|晚上|今晚|明晚/.test(t) && sh < 12) { sh += 12; if (eh < 12) eh += 12; }
    if (sh < 24 && eh < 24 && eh > sh) {
      d.start = hhmm(String(sh), r[2]);
      d.end = hhmm(String(eh), r[4]);
      sure.add("start").add("end");
      break;
    }
  }

  // venue: court database first (full name sure, short name unsure), then free text
  const full = courts.find((c) => t.includes(c.name));
  const short = full ?? courts.find((c) => t.includes(SHORT_NAME[c.id] ?? c.name));
  if (full) { d.courtId = full.id; sure.add("courtId"); }
  else if (short) d.courtId = short.id;

  // level: 2.5-3.0 / 3.0+ / 新手
  const lr = t.match(/([2-5]\.[05])\s*-\s*([2-5]\.[05])/);
  const lp = t.match(/([2-5]\.[05])\s*\+/);
  if (lr && lv(lr[1]) != null && lv(lr[2]) != null) {
    d.levelMin = lv(lr[1])!; d.levelMax = lv(lr[2])!; sure.add("levelMin").add("levelMax");
  } else if (lp && lv(lp[1]) != null) {
    d.levelMin = lv(lp[1])!; d.levelMax = 6; sure.add("levelMin").add("levelMax");
  } else if (/新手(團|局|場|可|友善|歡迎)/.test(t)) {
    d.levelMin = 0; d.levelMax = 2;
  }

  // capacity: 徵8人 / 8人 / 共8位；「缺2」alone does not say the total
  const cap = t.match(/(?<!缺\s*)(\d{1,2})\s*(?:人|位)(?!\s*以)/);
  if (cap) { d.capacity = Math.min(24, Math.max(2, Number(cap[1]))); sure.add("capacity"); }

  // fee: 每人150 / $150 / 150元 / 免費
  const fee = t.match(/(?:每人|一人|\$|NT\$?)\s*(\d{2,4})|(\d{2,4})\s*(?:元|塊)/);
  if (/免費/.test(t)) { d.fee = "0"; d.pay = "免費"; sure.add("fee").add("pay"); }
  else if (fee) { d.fee = fee[1] ?? fee[2]; sure.add("fee"); }
  if (/轉帳|匯款/.test(t)) { d.pay = "轉帳"; sure.add("pay"); }
  else if (/現場|付現|現金/.test(t)) { d.pay = "現場付現"; sure.add("pay"); }

  // beginners: 新手勿入 → no; 新手友善 / 新手可 / 歡迎新手 → yes
  if (/新手勿|不收新手|限.*以上/.test(t)) { d.beginner = false; sure.add("beginner"); }
  else if (/新手(友善|可|歡迎|團|局)|歡迎新手/.test(t)) { d.beginner = true; sure.add("beginner"); }

  sure.add("notes").add("hostCounts").add("cancelHours");
  if (d.courtId === "") sure.delete("courtId");

  const ask: DraftField[] = ["group", "start", "end", "courtId", "levelMin", "capacity", "fee", "pay", "beginner"];
  return { draft: d, unsure: ask.filter((f) => !sure.has(f)) };
}
