import { NextResponse } from "next/server";
import { readMe } from "@pikyoo/core/source/me";
import { realAuth } from "@/lib/env";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase";

/** LINE accounts have no email, but Supabase issues sessions per email. The .invalid TLD can never receive mail. */
const lineEmail = (sub: string) => `${sub.toLowerCase()}-${Date.now().toString(36)}@line.pikyoo.invalid`;

/** 用 LINE 登入 (docs/SETUP.md §4.2): LIFF ID token → verified by LINE → find or create the user → session cookie. */
export async function POST(req: Request) {
  if (!realAuth) return NextResponse.json({ error: "not enabled" }, { status: 404 });
  const { idToken } = (await req.json().catch(() => ({}))) as { idToken?: unknown };
  const channelId = process.env.LINE_CHANNEL_ID;
  if (typeof idToken !== "string" || !channelId) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const verified = await fetch("https://api.line.me/oauth2/v2.1/verify", { method: "POST", body: new URLSearchParams({ id_token: idToken, client_id: channelId }) });
  if (!verified.ok) return NextResponse.json({ error: "expired" }, { status: 401 });
  const line = (await verified.json()) as { sub: string; name?: string; picture?: string };

  const admin = supabaseAdmin();
  const found = await admin.from("profile_private").select("id").eq("line_user_id", line.sub).maybeSingle();
  if (found.error) throw found.error;
  const user = found.data
    ? await admin.auth.admin.getUserById(found.data.id)
    : await admin.auth.admin.createUser({
        email: lineEmail(line.sub), email_confirm: true,
        // app_metadata is server-only; handle_new_user copies line_user_id from it into profile_private
        app_metadata: { line_user_id: line.sub },
        user_metadata: { name: line.name ?? "", avatar_url: line.picture ?? null },
      });
  if (user.error || !user.data.user.email) throw user.error ?? new Error("LINE user has no email");

  const link = await admin.auth.admin.generateLink({ type: "magiclink", email: user.data.user.email });
  if (link.error) throw link.error;
  const sb = await supabaseServer();
  const session = await sb.auth.verifyOtp({ type: "magiclink", token_hash: link.data.properties.hashed_token });
  if (session.error || !session.data.user) throw session.error ?? new Error("no session");

  const me = await readMe(sb, session.data.user.id);
  return NextResponse.json({ onboarded: !!me?.onboarded });
}
