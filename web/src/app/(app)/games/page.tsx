import type { Metadata } from "next";
import { GamesScreen } from "@/features/games/GamesScreen";

export const metadata: Metadata = { title: "球局" };

export default function Page() {
  return <GamesScreen />;
}
