import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db.types";

// 站內通知 (B6 part 1). The database queues a row in notifications for every event (notify()); this turns them
// into what the bell shows. LINE push (part 2) sends the same rows.

type Sb = SupabaseClient<Database>;

export interface Notice { id: string; title: string; body?: string; href?: string; at: string; read: boolean }

type Payload = { booking_id?: string; game_id?: string; question_id?: string; group_id?: string; note?: string; verified?: boolean; changed?: string[]; at?: string };

/** Copy and link per kind (the kinds notify() is called with in supabase/migrations). Unknown kinds get a generic line. */
export function describe(kind: string, p: Payload): Pick<Notice, "title" | "body" | "href"> {
  const booking = p.booking_id ? `/me/booking?id=${p.booking_id}` : "/me/lessons";
  const game = p.game_id ? `/games/${p.game_id}` : "/me";
  switch (kind) {
    case "booking_requested": return { title: "有新的預約申請", body: "48 小時內確認或婉拒", href: "/coach" };
    case "booking_confirmed": return { title: "教練確認了你的預約", body: "照付款資訊付款就完成了", href: booking };
    case "booking_declined": return { title: "教練婉拒了這個時段", body: "換一個時段再試試", href: booking };
    case "booking_cancelled": return { title: "學生取消了預約", href: "/coach" };
    case "booking_expired": return { title: "預約已逾時取消", body: "教練 48 小時內沒有回覆，沒有任何費用", href: booking };
    case "payment_reported": return { title: "學生回報已付款", body: "到「收款」確認收到", href: "/coach/payments" };
    case "payment_received": return { title: "教練確認收到款項", body: "準備好上課了！", href: booking };
    case "payment_not_received": return { title: "教練說還沒收到款項", body: "請確認轉帳後再回報一次", href: booking };
    case "game_promoted": return { title: "候補成功！你遞補上球局了", href: game };
    case "game_removed": return { title: "團主把你從球局移除了", href: game };
    case "game_cancelled": return { title: "你報名的球局取消了", href: game };
    case "game_changed": return { title: "你報名的球局資訊有變動", body: "時間、地點或費用有更新，點進去看看", href: game };
    case "question_asked": return { title: "有學生在你的教練頁提問", href: "/coach" };
    case "question_answered": return { title: "教練回覆了你的問題", href: "/coaches" };
    case "coach_approved": return { title: "你的教練頁已公開", body: "學生現在找得到你了", href: "/coach/profile" };
    case "coach_returned": return { title: "教練頁需要再補充", body: p.note || "請依說明修改後再送出審核", href: "/coach/profile" };
    case "credential_reviewed": return { title: p.verified ? "證照已查驗" : "證照未通過查驗", href: "/coach/profile" };
    case "group_joined": return { title: "有朋友加入你的揪團", href: "/me/lessons" };
    case "group_expired": return { title: "揪團人數不足，已取消", href: "/me/lessons" };
    case "lesson_reminder": return { title: `明天 ${p.at ?? ""} 有課`, body: "記得帶球拍、提早 10 分鐘到", href: "/me/lessons" };
    case "game_reminder": return { title: `明天 ${p.at ?? ""} 有球局`, body: "不能去請盡早取消，讓候補的人遞補", href: game };
    case "line_test": return { title: "LINE 通知測試", body: "收到這則就代表 PIKYOO 的 LINE 通知設定好了", href: "/me/notifications" };
    default: return { title: "PIKYOO 有新消息" };
  }
}

/** Kinds also pushed over LINE (PRD F6 plus D9's payment round trip). LINE bills per message, so the rest stay in-app. */
export const LINE_KINDS = new Set([
  "booking_requested", "booking_confirmed", "booking_declined", "booking_cancelled", "booking_expired",
  "payment_reported", "payment_received", "payment_not_received",
  "game_promoted", "game_changed", "game_cancelled", "game_removed",
  "coach_approved", "coach_returned", "lesson_reminder", "game_reminder",
  "line_test", // queued by hand (select public.notify(<user>, 'line_test', '{}')) to check the LINE setup
]);

/** The LINE text for a queued row: the same title and body as the bell, plus a link back to the site. */
export function lineText(kind: string, payload: unknown, origin: string): string {
  const d = describe(kind, (payload ?? {}) as Payload);
  return [d.title, d.body, `${origin}${d.href ?? "/me/notifications"}`].filter(Boolean).join("\n");
}

const when = (t: string) => {
  const d = new Date(Date.parse(t) + 8 * 3600e3); // Taipei
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${d.toISOString().slice(11, 16)}`;
};

export async function myNotices(sb: Sb, userId: string, limit = 50): Promise<Notice[]> {
  const r = await sb.from("notifications").select("id, kind, payload, read_at, created_at").eq("user_id", userId)
    .order("created_at", { ascending: false }).limit(limit);
  if (r.error) throw new Error(`Supabase: ${r.error.message}`);
  return r.data.map((n) => ({ id: n.id, ...describe(n.kind, (n.payload ?? {}) as Payload), at: when(n.created_at), read: !!n.read_at }));
}

/** The bell's badge. Read on every page with the signed-in person, so a failure shows 0 instead of breaking the page. */
export async function unreadCount(sb: Sb, userId: string): Promise<number> {
  const r = await sb.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("read_at", null);
  return r.error ? 0 : r.count ?? 0;
}

export async function markAllRead(sb: Sb, userId: string): Promise<void> {
  const r = await sb.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", userId).is("read_at", null);
  if (r.error) throw new Error(`Supabase: ${r.error.message}`);
}


