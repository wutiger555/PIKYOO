import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { reviewQueue } from "@pikyoo/core/source/review";
import { ReviewScreen } from "@/features/admin/ReviewScreen";
import { getMe, supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "審核", robots: { index: false } };

/** PIKYOO 審核 (B4): staff only. Anyone else, and the demo, gets a 404. */
export default async function Page() {
  const me = await getMe();
  if (!me?.isAdmin) notFound();
  return <ReviewScreen queue={await reviewQueue(await supabaseServer())} />;
}
