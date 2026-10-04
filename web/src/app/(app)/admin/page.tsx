import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminOverview, reviewQueue } from "@pikyoo/core/source/review";
import { ReviewScreen } from "@/features/admin/ReviewScreen";
import { getMe, supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "管理", robots: { index: false } };

/** PIKYOO 管理 (B4 審核, B7 數字與下架): staff only. Anyone else, and the demo, gets a 404. */
export default async function Page() {
  const me = await getMe();
  if (!me?.isAdmin) notFound();
  const sb = await supabaseServer();
  const [queue, overview] = await Promise.all([reviewQueue(sb), adminOverview(sb)]);
  return <ReviewScreen queue={queue} overview={overview} />;
}
