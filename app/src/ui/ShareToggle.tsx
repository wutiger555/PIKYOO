import { Pressable, Text, View } from "react-native";
import { Icon } from "./Icon";
import { color } from "./theme";

/** 分享給學生: the student sees the note under 我的課 → 上過的. */
export function ShareToggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={{ flexDirection: "row", alignItems: "center", gap: 8 }} hitSlop={8}>
      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: color.text, backgroundColor: on ? color.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
        {on && <Icon name="check" size={13} />}
      </View>
      <Text style={{ fontSize: 14 }}>分享給學生</Text>
    </Pressable>
  );
}
