import { Pressable, Text, View } from "react-native";
import { LEVELS } from "@pikyoo/core/format";
import type { Level } from "@pikyoo/core/types";
import { color, levelColor, radius } from "./theme";

/** 7-step level picker; bar height and olive depth grow with the level (website: LevelPicker). */
export function LevelPicker({ value, onPick }: { value: Level | null; onPick: (lv: Level) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {LEVELS.map((l, i) => {
        const on = value === i;
        return (
          <Pressable key={l} onPress={() => onPick(i as Level)} accessibilityState={{ selected: on }}
            style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 6, height: 76, paddingBottom: 8, borderRadius: radius.md, borderWidth: on ? 2 : 1, borderColor: on ? color.text : color.n300, backgroundColor: on ? color.accentSoft : color.surface }}>
            <View style={{ width: 14, height: 4 + i * 4, borderRadius: 2, backgroundColor: levelColor[i], borderWidth: i < 2 ? 1 : 0, borderColor: levelColor[4] }} />
            <Text style={{ fontSize: 13, fontWeight: on ? "800" : "600" }}>{l}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
