import type { Metadata } from "next";
import { demoNotices } from "@pikyoo/core/data/notifications";
import { myNotices } from "@pikyoo/core/source/notifications";
import { NotificationsScreen } from "@/features/me/NotificationsScreen";
import { getMe, supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "通知" };

export default async function Page() {
  const me = await getMe();
  // demo: sample notices; real sign-in: the signed-in person's (a visitor sees the sign-in prompt)
  const notices = me === undefined ? demoNotices() : me ? await myNotices(await supabaseServer(), me.id) : [];
  return <NotificationsScreen notices={notices} />;
}
