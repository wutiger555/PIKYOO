import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BookScreen } from "@/features/coaches/BookScreen";
import { getCoach } from "@/lib/data/coaches";

export const metadata: Metadata = { title: "預約課程" };

export default async function Page({ params, searchParams }: PageProps<"/coaches/[id]/book">) {
  const { id } = await params;
  const { plan } = await searchParams;
  const c = getCoach(id);
  if (!c) notFound();
  if (!c.profile) redirect(`/coaches/${id}`);
  return <BookScreen key={String(plan)} coach={c} profile={c.profile} planId={typeof plan === "string" ? plan : c.profile.plans[0].id} />;
}
