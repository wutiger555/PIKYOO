import { Text } from "react-native";
import { color } from "./theme";

export type StatusTone = "open" | "almost" | "full" | "ended" | "info";
const TONE: Record<StatusTone, [string, string]> = {
  open: [color.successBg, color.success], almost: [color.warningBg, color.warning], full: ["#F9E1DE", "#9B2C1F"],
  ended: [color.n100, color.n700], info: ["#E3ECF5", "#24507A"],
};

/** Status pill (website: Status), colour plus words. */
export function Status({ tone, children }: { tone: StatusTone; children: string }) {
  const [bg, fg] = TONE[tone];
  return <Text style={{ alignSelf: "flex-start", overflow: "hidden", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, fontSize: 13, fontWeight: "700", backgroundColor: bg, color: fg }}>{children}</Text>;
}
