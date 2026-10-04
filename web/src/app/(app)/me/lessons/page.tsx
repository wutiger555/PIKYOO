import type { Metadata } from "next";
import { myBookings } from "@pikyoo/core/source/bookings";
import { MyLessonsScreen } from "@/features/me/MyLessonsScreen";
import { getMe, supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "我的課" };

export default async function Page() {
  const me = await getMe();
  // real sign-in: the student's bookings (a visitor sees the empty state); the demo keeps its in-memory lessons
  return <MyLessonsScreen live={me === undefined ? undefined : me ? await myBookings(await supabaseServer(), me.id) : []} />;
}
