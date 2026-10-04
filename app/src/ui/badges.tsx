import { Pressable, StyleSheet, Text, View, type TextStyle } from "react-native";
import { LEVELS, levelText } from "@pikyoo/core/format";
import type { Credential, Level } from "@pikyoo/core/types";
import { Icon } from "./Icon";
import { color, font, levelColor, radius } from "./theme";

// The website's badges (web/src/components/pk/Badges.tsx) in React Native.

/** Times, prices and counts in Barlow Condensed (the website's `.num`). */
export const Num = ({ children, style }: { children: React.ReactNode; style?: TextStyle | TextStyle[] }) => (
  <Text style={[{ fontFamily: font.num, fontVariant: ["tabular-nums"], color: color.text }, style]}>{children}</Text>
);

/** 程度徽章: 7-step ladder (height + olive depth) plus the level written out. `bare` drops the ladder (card grids). */
export function LevelChip({ min, max = min, lg, bare }: { min: Level; max?: Level; lg?: boolean; bare?: boolean }) {
  const words = min === max && min === 0;
  return (
    <View style={[b.level, lg && { height: 32, paddingHorizontal: 8 }, bare && { height: 22, paddingHorizontal: 5 }]}>
      {!bare && (
        <View style={b.ladder}>
          {LEVELS.map((_, i) => <View key={i} style={{ width: 3, height: 5 + i * 1.5, borderRadius: 1, backgroundColor: i >= min && i <= max ? levelColor[i] : color.n200, borderWidth: i >= min && i <= max && i < 2 ? StyleSheet.hairlineWidth : 0, borderColor: levelColor[4] }} />)}
        </View>
      )}
      {words ? <Text style={{ fontSize: 13, fontWeight: "500" }}>{LEVELS[0]}</Text> : <Num style={{ fontSize: lg ? 18 : bare ? 14 : 15 }}>{levelText(min, max)}</Num>}
    </View>
  );
}

/** 認證徽章: verified = solid with the issuer on carbon; self-reported = dashed + 自填. `onCarbon` for the coach page hero. */
export function Cred({ c, onCarbon, small }: { c: Credential; onCarbon?: boolean; small?: boolean }) {
  const pad = small ? { paddingHorizontal: 6, paddingVertical: 4 } : { paddingHorizontal: 8, paddingVertical: 6 };
  const fs = small ? 12 : 13;
  const self = !c.verified;
  return (
    <View style={[b.cred, self && { borderStyle: "dashed", borderColor: onCarbon ? "rgba(255,255,255,.35)" : color.n500 }, onCarbon && !self && { borderColor: color.accent }, onCarbon && { backgroundColor: "transparent" }]}>
      <Text style={[pad, { fontSize: fs, fontWeight: "700" }, self
        ? { backgroundColor: onCarbon ? "rgba(255,255,255,.14)" : color.n100, color: onCarbon ? "#fff" : color.n800 }
        : { backgroundColor: onCarbon ? color.accent : color.text, color: onCarbon ? color.text : "#fff" }]}>{c.issuer}</Text>
      {self
        ? <Num style={[pad, { fontSize: small ? 14 : 15, color: onCarbon ? "#fff" : color.text }]}>{c.level}</Num>
        : <Text style={[pad, { fontSize: fs, fontWeight: "700", color: onCarbon ? "#fff" : color.text }]}>{c.level}</Text>}
      <View style={[pad, b.state, onCarbon && { borderLeftColor: "rgba(255,255,255,.2)" }]}>
        {!self && <Icon name="check" size={11} tint={onCarbon ? color.accent : color.success} />}
        <Text style={{ fontSize: fs, fontWeight: self ? "500" : "700", color: self ? (onCarbon ? color.onCarbonMuted : color.muted) : onCarbon ? color.accent : color.success }}>{self ? "自填" : "已驗證"}</Text>
      </View>
    </View>
  );
}

export function Rating({ rating, reviews, big, onCarbon }: { rating: number; reviews: number; big?: boolean; onCarbon?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Icon name="star" size={big ? 15 : 12} tint={onCarbon ? color.accent : color.text} />
      <Num style={{ fontSize: big ? 20 : 15, color: onCarbon ? "#fff" : color.text }}>{rating}</Num>
      <Text style={{ fontSize: 12, color: onCarbon ? color.onCarbonMuted : color.muted }}>{big ? `${reviews} 則` : `(${reviews})`}</Text>
    </View>
  );
}

/** Tag pills: neutral (default), accent (lime), olive (擅長), outline. */
export function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "olive" | "outline" }) {
  const bg = { neutral: color.n100, accent: color.accent, olive: color.oliveSoft, outline: "transparent" }[tone];
  return <Text style={[b.tag, { backgroundColor: bg }, tone === "outline" && { borderWidth: 1, borderColor: color.n300 }]}>{children}</Text>;
}

/** Filter chip (the website's `.chip`): pressed = lime with a carbon border. */
export function Chip({ on, onPress, children }: { on?: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} accessibilityState={{ selected: !!on }}
      style={[b.chip, on && { backgroundColor: color.accent, borderColor: color.text }]}>
      {typeof children === "string" ? <Text style={{ fontSize: 15, fontWeight: "600" }}>{children}</Text> : children}
    </Pressable>
  );
}

const b = StyleSheet.create({
  level: { flexDirection: "row", alignItems: "center", gap: 6, height: 26, paddingLeft: 6, paddingRight: 8, borderWidth: 1, borderColor: color.n300, borderRadius: radius.sm, backgroundColor: color.surface, alignSelf: "flex-start" },
  ladder: { flexDirection: "row", alignItems: "flex-end", gap: 1.5, height: 14 },
  cred: { flexDirection: "row", alignItems: "stretch", borderWidth: 1, borderColor: color.text, borderRadius: radius.sm, overflow: "hidden", backgroundColor: color.surface, alignSelf: "flex-start" },
  state: { flexDirection: "row", alignItems: "center", gap: 3, borderLeftWidth: 1, borderLeftColor: color.line },
  tag: { overflow: "hidden", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, fontSize: 13, color: color.text, alignSelf: "flex-start" },
  chip: { minHeight: 40, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1.5, borderColor: color.n300, backgroundColor: color.surface, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
});
