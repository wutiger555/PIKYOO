import type { Metadata } from "next";
import { HostScreen } from "@/features/host/HostScreen";

export const metadata: Metadata = { title: "開團" };

export default function Page() {
  return <HostScreen />;
}
