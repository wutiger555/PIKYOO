import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameDetailScreen } from "@/features/games/GameDetailScreen";
import { HostedGameDetail } from "@/features/games/HostedGameDetail";
import { getGame } from "@/lib/source";

export async function generateMetadata({ params }: PageProps<"/games/[id]">): Promise<Metadata> {
  const g = await getGame((await params).id);
  return g ? { title: `${g.dayLabel} ${g.startsAt} ${g.venue}` } : {};
}

export default async function Page({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const g = await getGame(id);
  // ids starting with "h" are games opened in this browser session (開團); they exist only client-side
  if (!g) return id.startsWith("h") ? <HostedGameDetail id={id} /> : notFound();
  return <GameDetailScreen game={g} />;
}
