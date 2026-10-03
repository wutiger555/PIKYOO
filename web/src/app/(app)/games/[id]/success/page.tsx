import { notFound } from "next/navigation";
import { JoinSuccessScreen } from "@/features/games/JoinSuccessScreen";
import { getGame } from "@/lib/source";

export default async function Page({ params }: PageProps<"/games/[id]/success">) {
  const g = await getGame((await params).id);
  if (!g) notFound();
  return <JoinSuccessScreen game={g} />;
}
