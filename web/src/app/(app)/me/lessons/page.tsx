import type { Metadata } from "next";
import { MyLessonsScreen } from "@/features/me/MyLessonsScreen";

export const metadata: Metadata = { title: "我的課" };

export default function Page() {
  return <MyLessonsScreen />;
}
