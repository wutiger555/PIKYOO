import type { Question } from "../types";

// Mock 問與答 per coach. q-mia-4 is unanswered so the coach console has one to reply to.

export const initialQuestions = (): Question[] => [
  { id: "q-mia-1", coachId: "mia", name: "小芸", level: "新手", text: "完全沒打過球，也沒有球拍，可以直接報體驗課嗎？", askedAt: "9/12",
    answer: { text: "可以！體驗課會借你球拍和球，穿運動鞋來就好。第一堂從握拍開始，下課前一定能對打。", at: "9/12" } },
  { id: "q-mia-2", coachId: "mia", name: "Jason", level: "2.5", text: "打網球很多年，揮拍習慣會不會很難改？適合上一對一還是小班？", askedAt: "9/18",
    answer: { text: "網球底子其實是優勢，主要是改揮拍幅度和網前的手腕。建議先上 1–2 堂一對一把習慣拆掉，再來小班練實戰。", at: "9/18" } },
  { id: "q-mia-3", coachId: "mia", name: "阿凱", level: "新手", text: "兩個人可以一起報小班課嗎？還是要湊滿 3 個人？", askedAt: "9/25",
    answer: { text: "小班最少 3 人。兩個人的話可以用「揪朋友一起上」先佔時段，再找一位朋友，或是改上體驗課（2 人就開）。", at: "9/25" } },
  { id: "q-mia-4", coachId: "mia", name: "Wendy", level: "2.0", text: "週末早上 9 點的課，遇到下雨會停課嗎？", askedAt: "今天 08:40" },
  { id: "q-zhao-1", coachId: "zhao", name: "Peggy", level: "3.0", text: "我是 3.0，第三拍常常掛網，一對一大概要上幾堂才會有感？", askedAt: "9/20",
    answer: { text: "通常 3–4 堂會有感。第一堂我會先看你打一局，確定是準備太慢還是拍面角度，之後每堂只練那個。", at: "9/20" } },
  { id: "q-zhao-2", coachId: "zhao", name: "阿睿", level: "3.5", text: "戰術小班可以自己組同一隊的 4 個人嗎？", askedAt: "9/27",
    answer: { text: "可以，用「揪朋友一起上」開團，4 個人都加入後送給我確認。固定隊友一起練雙打換位效果最好。", at: "9/27" } },
  { id: "q-ann-1", coachId: "ann", name: "葉子", level: "新手", text: "一個人報團體課會不會很尷尬？", askedAt: "9/15",
    answer: { text: "完全不會，大部分人都是一個人來的！我會依程度分組輪轉，下課大家常常就約下一次一起打了。", at: "9/15" } },
  { id: "q-ann-2", coachId: "ann", name: "Emily", level: "2.0", text: "Is the weekend class taught in English?", askedAt: "9/22",
    answer: { text: "Yes! I teach in both Chinese and English. Just mention it in the booking note.", at: "9/22" } },
  { id: "q-ray-1", coachId: "ray", name: "Leo", level: "3.5", text: "我 DUPR 3.6，跟得上陪練的強度嗎？", askedAt: "9/26",
    answer: { text: "3.5 以上就可以。第一堂我會先用中等強度對抽，看你的狀況再往上加。", at: "9/26" } },
];

/** Tap-to-fill starters for the ask sheet. */
export const QUESTION_STARTERS = ["完全沒打過可以上嗎？", "需要自己帶球拍嗎？", "可以兩個人一起上嗎？", "下雨會停課嗎？"];
