import type { Metadata } from "next";
import { CoachLessonsScreen } from "@/features/console/CoachLessonsScreen";

export const metadata: Metadata = { title: "課程與時段" };

export default function Page() {
  return <CoachLessonsScreen />;
}
