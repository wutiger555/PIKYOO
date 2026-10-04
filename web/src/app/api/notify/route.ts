import { NextResponse } from "next/server";
import { LINE_KINDS, lineText } from "@pikyoo/core/source/notifications";
import { supabaseAdmin } from "@/lib/supabase";

// B6 part 2: sends the notification queue over LINE. pg_cron calls POST every minute while rows are queued
// (kick_notify in supabase/migrations), with NOTIFY_SECRET; GET with the same secret checks the LINE token.

const BOT = "https://api.line.me/v2/bot";
const STALE_MS = 24 * 3600e3;
const MAX_ATTEMPTS = 3;

const authorized = (req: Request) => !!process.env.NOTIFY_SECRET && req.headers.get("authorization") === `Bearer ${process.env.NOTIFY_SECRET}`;
const lineToken = () => process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN ?? "";

/** Health check: is the token valid, and which official account is it (its basic ID is the add-friend link). */
export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const r = await fetch(`${BOT}/info`, { headers: { Authorization: `Bearer ${lineToken()}` } });
  const bot = (await r.json().catch(() => ({}))) as { basicId?: string; displayName?: string };
  return NextResponse.json({ ok: r.ok, basicId: bot.basicId, displayName: bot.displayName });
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!lineToken()) return NextResponse.json({ error: "LINE token not set" }, { status: 503 });
  const sb = supabaseAdmin();
  const q = await sb.from("notifications").select("id, user_id, kind, payload, channel, attempts, created_at")
    .eq("status", "queued").order("created_at").limit(100);
  if (q.error) throw q.error;
  const ids = [...new Set(q.data.map((n) => n.user_id))];
  const p = await sb.from("profile_private").select("id, line_user_id, notify").in("id", ids);
  if (p.error) throw p.error;
  const people = new Map(p.data.map((x) => [x.id, x]));
  const origin = new URL(req.url).origin;
  const count = { sent: 0, skipped: 0, failed: 0, retry: 0 };

  for (const n of q.data) {
    const who = people.get(n.user_id);
    const wantsLine = (who?.notify as { line?: boolean } | null)?.line !== false;
    const skip = n.channel !== "line" || !LINE_KINDS.has(n.kind) ? "in-app only"
      : Date.now() - Date.parse(n.created_at) > STALE_MS ? "stale"
      : !who?.line_user_id || !wantsLine ? "no LINE" : null;
    let done: { status: "sent" | "skipped" | "failed" | "queued"; error?: string };
    if (skip) done = { status: "skipped", error: skip };
    else {
      // The retry key makes a resend of the same row a no-op on LINE's side (409), so overlapping runs can't double-push.
      const r = await fetch(`${BOT}/message/push`, {
        method: "POST",
        headers: { Authorization: `Bearer ${lineToken()}`, "Content-Type": "application/json", "X-Line-Retry-Key": n.id },
        body: JSON.stringify({ to: who!.line_user_id, messages: [{ type: "text", text: lineText(n.kind, n.payload, origin) }] }),
      }).catch((e: Error) => e);
      if (!(r instanceof Error) && (r.ok || r.status === 409)) done = { status: "sent" };
      else {
        const error = r instanceof Error ? r.message : `${r.status} ${(await r.text()).slice(0, 200)}`;
        // 4xx other than rate limiting won't get better by retrying (e.g. the user blocked the official account).
        const final = !(r instanceof Error) && r.status < 500 && r.status !== 429;
        done = { status: final || n.attempts + 1 >= MAX_ATTEMPTS ? "failed" : "queued", error };
      }
    }
    const u = await sb.from("notifications").update({
      status: done.status, error: done.error ?? null, attempts: n.attempts + (skip ? 0 : 1),
      sent_at: done.status === "sent" ? new Date().toISOString() : null,
    }).eq("id", n.id);
    if (u.error) throw u.error;
    count[done.status === "queued" ? "retry" : done.status]++;
  }
  return NextResponse.json(count);
}
