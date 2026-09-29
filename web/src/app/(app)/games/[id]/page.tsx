import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameDetailScreen } from "@/features/games/GameDetailScreen";
import { GAMES, getGame } from "@/lib/data/games";

export const generateStaticParams = () => GAMES.map((g) => ({ id: g.id }));

export async function generateMetadata({ params }: PageProps<"/games/[id]">): Promise<Metadata> {
  const g = getGame((await params).id);
  return g ? { title: `${g.dayLabel} ${g.startsAt} ${g.venue}` } : {};
}

export default async function Page({ params }: PageProps<"/games/[id]">) {
  const g = getGame((await params).id);
  if (!g) notFound();
  return <GameDetailScreen game={g} />;
}
