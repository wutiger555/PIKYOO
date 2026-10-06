// 台灣Pay / TWQR transfer codes (docs/PAYMENTS.md §1.5): a QR any Taiwanese bank app or e-wallet can scan to transfer
// straight to the coach's own account, so the student doesn't type the account number. No API or sign-up: the code is
// just a string. FISC hasn't published the spec; this follows the community format (open-source generator twpay):
//   TWQRP://<ascii name>/158/02/V1?D6=<account, 16 digits>&D5=<bank code>&D10=901&D1=<amount × 100>
// 158 = Taiwan, 02 = transfer, D10 901 = NT$. Some bank apps fill only the account, so the amount is shown too.
// The memo field (D9) is left out until it has been tested on real bank apps.

/** Banks a coach can pick, by the 3-digit code transfers use. */
export const BANKS: [code: string, name: string][] = [
  ["004", "臺灣銀行"], ["005", "土地銀行"], ["006", "合作金庫"], ["007", "第一銀行"], ["008", "華南銀行"], ["009", "彰化銀行"],
  ["011", "上海商銀"], ["012", "台北富邦"], ["013", "國泰世華"], ["017", "兆豐銀行"], ["048", "王道銀行"], ["050", "臺灣企銀"],
  ["052", "渣打銀行"], ["053", "台中銀行"], ["054", "京城銀行"], ["081", "匯豐銀行"], ["103", "新光銀行"], ["108", "陽信銀行"],
  ["700", "中華郵政"], ["803", "聯邦銀行"], ["805", "遠東商銀"], ["806", "元大銀行"], ["807", "永豐銀行"], ["808", "玉山銀行"],
  ["809", "凱基銀行"], ["810", "星展銀行"], ["812", "台新銀行"], ["816", "安泰銀行"], ["822", "中國信託"], ["823", "將來銀行"],
  ["824", "連線銀行"], ["826", "樂天銀行"],
];

/** How a bank is stored in the coach's payout details: 「台新銀行 812」 (older free-text entries also carry the code). */
export const bankLabel = (code: string) => `${BANKS.find(([c]) => c === code)?.[1] ?? "銀行"} ${code}`;

/** The 3-digit bank code inside 「台新銀行 812」 / 「台新（812）」, or null. */
export const bankCode = (bank: string) => bank.match(/(?:^|\D)(\d{3})(?:\D|$)/)?.[1] ?? null;

/** The TWQR transfer string, or null when the bank code or account isn't usable. `amount` in NT$. */
export function twqrTransfer({ bank, account, amount }: { bank: string; account: string; amount?: number }) {
  const code = bankCode(bank);
  const acct = account.replace(/\D/g, "");
  if (!code || !acct || acct.length > 16) return null;
  let s = `TWQRP://${code}NTTransfer/158/02/V1?D6=${acct.padStart(16, "0")}&D5=${code}&D10=901`;
  if (amount && amount >= 1 && amount <= 9_999_999) s += `&D1=${Math.round(amount) * 100}`;
  return s;
}
