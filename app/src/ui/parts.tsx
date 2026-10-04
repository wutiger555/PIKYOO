import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { color, space } from "./theme";

// Small building blocks shared by the screens: a card row that links somewhere, a section heading, a tag.

export function Card({ href, children, style }: { href?: Href; children: React.ReactNode; style?: ViewStyle }) {
  const body = <View style={[s.card, style]}>{children}</View>;
  return href ? <Link href={href} asChild><Pressable>{body}</Pressable></Link> : body;
}

export const Heading = ({ children }: { children: React.ReactNode }) => <Text style={s.heading}>{children}</Text>;

export const Tag = ({ children, strong }: { children: React.ReactNode; strong?: boolean }) => (
  <Text style={[s.tag, strong && { backgroundColor: color.accent }]}>{children}</Text>
);

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { padding: space[4], gap: space[3] },
  card: { backgroundColor: color.surface, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: color.line, padding: space[4], gap: space[1] },
  heading: { fontSize: 20, fontWeight: "700", color: color.text, marginTop: space[3] },
  title: { fontSize: 17, fontWeight: "700", color: color.text },
  body: { fontSize: 15, color: color.text, lineHeight: 22 },
  muted: { fontSize: 13, color: color.muted },
  num: { fontVariant: ["tabular-nums"] },
  row: { flexDirection: "row", alignItems: "center", gap: space[2] },
  tag: { alignSelf: "flex-start", overflow: "hidden", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, color: color.text, backgroundColor: "#EBECE7" },
});
