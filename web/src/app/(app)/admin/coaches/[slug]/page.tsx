import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readCoachBySlug } from "@pikyoo/core/source/me-coach";
import { CoachPageScreen } from "@/features/coaches/CoachPageScreen";
import { SUPABASE_URL } from "@/lib/env";
import { getMe, supabaseServer } from "@/lib/supabase";

export const metadata: Metadata = { title: "審核預覽", robots: { index: false } };

/** A coach page under review, exactly as students will see it once approved. Staff only. */
export default async function Page({ params }: PageProps<"/admin/coaches/[slug]">) {
  const me = await getMe();
  if (!me?.isAdmin) notFound();
  const c = await readCoachBySlug(await supabaseServer(), SUPABASE_URL, (await params).slug);
  if (!c) notFound();
  return <CoachPageScreen coach={c.coach} />;
}
