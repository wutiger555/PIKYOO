import { notFound } from "next/navigation";
import { JoinSuccessScreen } from "@/features/games/JoinSuccessScreen";
import { GAMES, getGame } from "@/lib/data/games";

export const generateStaticParams = () => GAMES.map((g) => ({ id: g.id }));

export default async function Page({ params }: PageProps<"/games/[id]/success">) {
  const g = getGame((await params).id);
  if (!g) notFound();
  return <JoinSuccessScreen game={g} />;
}
