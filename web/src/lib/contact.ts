// Keeps 問與答 inside PIKYOO: questions and replies can't carry phone numbers, emails, LINE / IG handles or
// "add me" requests. Deliberately loose — a false positive only asks the writer to rephrase.

const RULES: [RegExp, string][] = [
  [/\d[\d\s-]{6,}\d/, "電話號碼"],
  [/[\w.+-]+@[\w-]+\.[a-z]{2,}/i, "Email"],
  [/(line|賴|ig|instagram|wechat|微信)\s*(id)?\s*[:：@]/i, "LINE／IG 帳號"],
  [/加\s*(我|一下)?\s*(的)?\s*(line|賴|好友|ig|instagram|微信)/i, "LINE／IG 帳號"],
  [/(私訊|私下|直接找我|dm\s*我)/i, "私下聯絡"],
];

/** What kind of contact detail the text contains, or null if it's clean. */
export function findContact(text: string): string | null {
  for (const [re, what] of RULES) if (re.test(text)) return what;
  return null;
}

export const contactHint = (what: string) => `請不要留${what}。為了保障雙方，預約前後的聯絡都在 PIKYOO 裡進行。`;
