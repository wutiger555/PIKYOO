import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "./Icon";
import { color, radius } from "./theme";

// Shared pieces of the coach console screens.

/** A console tab's page: an optional carbon hero under the status bar, then content; tabs sit over the bottom. */
export function ConsolePage({ hero, title, action, children }: { hero?: React.ReactNode; title?: string; action?: React.ReactNode; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  useFocusEffect(useCallback(() => { if (hero) { setStatusBarStyle("light"); return () => setStatusBarStyle("dark"); } }, [hero]));
  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        {hero ? <View style={[c.hero, { paddingTop: insets.top + 12 }]}>{hero}</View> : (
          <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ flex: 1, fontSize: 30, fontWeight: "800" }}>{title}</Text>
            {action}
          </View>
        )}
        <View style={{ padding: 16, gap: 16 }}>{children}</View>
      </ScrollView>
      <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: insets.top, backgroundColor: hero ? color.carbon : "rgba(242,243,239,.94)" }} />
    </View>
  );
}

export const RolePill = () => (
  <View style={c.pill}><Icon name="cap" size={13} tint={color.text} /><Text style={{ fontSize: 12, fontWeight: "800" }}>教練模式</Text></View>
);

/** 切換到學生: back to the student tabs. */
export const ToStudent = () => (
  <Pressable onPress={() => router.dismissTo("/me")} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
    <Icon name="swap" size={14} tint="#fff" /><Text style={{ color: "#fff", fontSize: 14, textDecorationLine: "underline" }}>切換到學生</Text>
  </Pressable>
);

export function SecHead({ en, title, right }: { en: string; title: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
      <View><Text style={c.en}>{en.toUpperCase()}</Text><Text style={{ fontSize: 22, fontWeight: "800" }}>{title}</Text></View>
      {right}
    </View>
  );
}

export const Avatar = ({ t, size = 40 }: { t: string; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.n800, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.4 }}>{t}</Text>
  </View>
);

export const c = StyleSheet.create({
  hero: { backgroundColor: color.carbon, paddingHorizontal: 16, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: color.accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  en: { fontFamily: "BarlowCondensed_700Bold", fontSize: 12, letterSpacing: 1.5, color: color.muted },
  card: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 14, gap: 10 },
  input: { borderWidth: 1, borderColor: color.n300, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: color.text, backgroundColor: color.surface },
  label: { fontSize: 14, fontWeight: "700", color: color.n700 },
  hint: { fontSize: 13, color: color.muted, lineHeight: 19 },
});
