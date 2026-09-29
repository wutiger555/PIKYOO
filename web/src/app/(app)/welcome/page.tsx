import type { Metadata } from "next";
import { OnboardingScreen } from "@/features/me/OnboardingScreen";

export const metadata: Metadata = { title: "歡迎來到匹友" };

export default function Page() {
  return <OnboardingScreen />;
}
