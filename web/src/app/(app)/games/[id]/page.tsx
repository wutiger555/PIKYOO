import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GameDetailScreen } from "@/features/games/GameDetailScreen";
import { HostedGameDetail } from "@/features/games/HostedGameDetail";
import { getGame } from "@/lib/source";
import { levelText } from "@pikyoo/core/format";

export async function generateMetadata({ params }: PageProps<"/games/[id]">): Promise<Metadata> {
  const g = await getGame((await params).id);
  if (!g) return {};
  const title = `${g.dayLabel} ${g.startsAt} ${g.venue}`;
  const spots = g.capacity - g.participants.length;
  // what LINE shows under the preview image (opengraph-image.tsx)
  const description = `${g.date} ${g.startsAt}–${g.endsAt}・程度 ${levelText(g.levelMin, g.levelMax)}・每人 NT$${g.fee}・${spots > 0 ? `缺 ${spots}` : "額滿可候補"}`;
  return { title, description, openGraph: { title: `${title}｜PIKYOO 匹友`, description } };
}

export default async function Page({ params }: PageProps<"/games/[id]">) {
  const { id } = await params;
  const g = await getGame(id);
  // ids starting with "h" are games opened in this browser session (開團); they exist only client-side
  if (!g) return id.startsWith("h") ? <HostedGameDetail id={id} /> : notFound();
  return <GameDetailScreen game={g} />;
}
