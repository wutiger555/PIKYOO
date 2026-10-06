import { useEffect, useState } from "react";
import { Animated, Platform, Text, View } from "react-native";
import { FullWindowOverlay } from "react-native-screens";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "./Icon";
import { color, radius } from "./theme";

// The website's toast: a short note that something happened, gone after a few seconds. Alerts with an OK button stay
// for questions only (are you sure? / needs permission), so a done action never needs an extra tap.

type Msg = { id: number; title: string; sub?: string };
let show: ((m: Msg) => void) | null = null;
let seq = 0;

const Layer = Platform.OS === "ios" ? FullWindowOverlay
  : ({ children }: { children: React.ReactNode }) => <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>{children}</View>;

/** Callable from anywhere, including event handlers outside React. */
export function toast(title: string, sub?: string) {
  show?.({ id: ++seq, title, sub });
}

/** Rendered once at the root. On iOS native screens and sheets sit above plain views, so the toast goes in a full-window overlay. */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = useState<Msg | null>(null);
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => {
    show = (m) => setMsg(m);
    return () => { show = null; };
  }, []);
  useEffect(() => {
    if (!msg) return;
    y.setValue(0);
    Animated.spring(y, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 6 }).start();
    const t = setTimeout(() => Animated.timing(y, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setMsg((cur) => (cur?.id === msg.id ? null : cur))), msg.sub ? 3600 : 2600);
    return () => clearTimeout(t);
  }, [msg, y]);
  if (!msg) return null;
  return (
    <Layer>
    <Animated.View pointerEvents="none" accessibilityLiveRegion="polite"
      style={{ position: "absolute", left: 16, right: 16, top: insets.top + 8, opacity: y, transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: color.carbon, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 12, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color.accent, alignItems: "center", justifyContent: "center" }}><Icon name="check" size={12} /></View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>{msg.title}</Text>
          {msg.sub && <Text style={{ color: color.onCarbonMuted, fontSize: 13, marginTop: 1 }}>{msg.sub}</Text>}
        </View>
      </View>
    </Animated.View>
    </Layer>
  );
}
