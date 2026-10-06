import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { DISTRICTS, shortAreas } from "@pikyoo/core/data/courts";
import { useSession } from "@/data/session";
import { Btn } from "@/ui/Btn";
import { Field, PickerRow } from "@/ui/form";
import { LevelPicker } from "@/ui/LevelPicker";
import { color, radius } from "@/ui/theme";
import { toast } from "@/ui/Toast";

/** 編輯個人資料 (website: /welcome): name, level and areas. Home's 適合你的教練 and 找教練 use the level right away. */
export default function EditProfile() {
  const { profile, setProfile, setFilters } = useSession();
  const [p, setP] = useState(profile);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 48 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <View style={{ backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, padding: 16, gap: 16 }}>
        <Field label="名字" value={p.name} onChange={(name) => setP({ ...p, name })} max={20} hint="教練和團主看到的名字" />
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: "700" }}>程度</Text>
          <LevelPicker value={p.level} onPick={(level) => setP({ ...p, level })} />
          <Text style={{ fontSize: 13, color: color.muted }}>不確定的話選低一點，教練會再幫你看。</Text>
        </View>
        <PickerRow label="常打的區域" multi values={p.areas} options={DISTRICTS} summary={shortAreas} onChange={(areas) => setP({ ...p, areas })} />
      </View>
      <Btn kind="primary" label="儲存" disabled={!p.name.trim() || !p.areas.length} onPress={() => {
        setProfile({ ...p, name: p.name.trim() });
        setFilters((f) => ({ ...f, level: p.level }));
        toast("已更新個人資料");
        router.back();
      }} />
    </ScrollView>
  );
}
