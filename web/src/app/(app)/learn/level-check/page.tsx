import type { Metadata } from "next";
import { LevelCheckScreen } from "@/features/learn/LevelCheckScreen";

export const metadata: Metadata = { title: "程度自評" };

export default function Page() {
  return <LevelCheckScreen />;
}
