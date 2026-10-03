import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoachPageScreen } from "@/features/coaches/CoachPageScreen";
import { getCoach } from "@/lib/source";

export async function generateMetadata({ params }: PageProps<"/coaches/[id]">): Promise<Metadata> {
  const c = await getCoach((await params).id);
  return c ? { title: `${c.name} 教練`, description: c.tagline } : {};
}

export default async function Page({ params }: PageProps<"/coaches/[id]">) {
  const c = await getCoach((await params).id);
  if (!c) notFound();
  return <CoachPageScreen coach={c} />;
}
