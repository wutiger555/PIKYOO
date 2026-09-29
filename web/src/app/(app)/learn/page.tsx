import type { Metadata } from "next";
import { LearnScreen } from "@/features/learn/LearnScreen";

export const metadata: Metadata = { title: "新手專區：第一次打匹克球" };

export default function Page() {
  return <LearnScreen />;
}
