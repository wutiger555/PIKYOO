import { Pressable, Text, type ViewStyle } from "react-native";
import { Icon, type IconName } from "./Icon";
import { color, radius } from "./theme";

/** The website's .btn: primary (lime, one per screen), secondary (white outline), ink (carbon), line (LINE green). */
export function Btn({ label, onPress, kind = "secondary", icon, disabled, lg = true, style }: {
  label: string; onPress: () => void; kind?: "primary" | "secondary" | "ink" | "line" | "ghost"; icon?: IconName; disabled?: boolean; lg?: boolean; style?: ViewStyle;
}) {
  const bg = { primary: color.accent, secondary: color.surface, ink: color.text, line: "#06C755", ghost: "transparent" }[kind];
  const fg = kind === "ink" || kind === "line" ? "#fff" : color.text;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
      style={({ pressed }) => [{
        minHeight: lg ? 52 : 40, paddingHorizontal: lg ? 22 : 14, borderRadius: lg ? 999 : radius.md, backgroundColor: bg,
        borderWidth: kind === "secondary" ? 1.5 : 0, borderColor: color.n300, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
      }, style]}>
      {icon && <Icon name={icon} size={17} tint={fg} />}
      <Text style={{ color: fg, fontSize: lg ? 17 : 15, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
