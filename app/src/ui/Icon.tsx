import { SymbolView } from "expo-symbols";
import type { ColorValue } from "react-native";
import { color } from "./theme";

// The website's icon names (web/src/components/pk/Icon.tsx) drawn with SF Symbols on iOS and Material Symbols on Android.
const MAP = {
  left: ["chevron.left", "arrow_back"], right: ["chevron.right", "chevron_right"], down: ["chevron.down", "expand_more"],
  heart: ["heart", "favorite"], share: ["square.and.arrow.up", "share"], star: ["star.fill", "star"],
  check: ["checkmark", "check"], plus: ["plus", "add"], minus: ["minus", "remove"], x: ["xmark", "close"],
  clock: ["clock", "schedule"], pin: ["mappin.and.ellipse", "location_on"], users: ["person.2", "group"],
  sprout: ["leaf", "eco"], lock: ["lock", "lock"], msg: ["bubble.left", "chat_bubble"], cols: ["rectangle.split.3x1", "view_column"],
  shield: ["checkmark.shield", "verified_user"], trophy: ["trophy", "emoji_events"], cap: ["graduationcap", "school"],
  cal: ["calendar", "calendar_month"], filter: ["line.3.horizontal.decrease", "filter_list"],
} as const;
export type IconName = keyof typeof MAP;

export function Icon({ name, size = 18, tint = color.text }: { name: IconName; size?: number; tint?: ColorValue }) {
  const [ios, android] = MAP[name];
  return <SymbolView name={{ ios, android }} size={size} tintColor={tint} weight="medium" />;
}
