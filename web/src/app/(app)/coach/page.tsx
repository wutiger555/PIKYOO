import type { Metadata } from "next";
import { CoachTodayScreen } from "@/features/console/ConsoleScreens";

export const metadata: Metadata = { title: "教練模式" };

export default function Page() {
  return <CoachTodayScreen />;
}
