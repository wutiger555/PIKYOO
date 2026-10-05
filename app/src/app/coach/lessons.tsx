import { useState } from "react";
import { Alert, Pressable, Switch, Text, TextInput, View } from "react-native";
import { money } from "@pikyoo/core/format";
import type { Coach, Plan, Weekday } from "@pikyoo/core/types";
import { useSession } from "@/data/session";
import { Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { c, ConsolePage, SecHead } from "@/ui/console";
import { Field, MoneyInput, Segmented, Stepper, TimeSheet } from "@/ui/form";
import { Icon } from "@/ui/Icon";
import { color, radius } from "@/ui/theme";

const WEEK: Weekday[] = ["一", "二", "三", "四", "五", "六", "日"];
const UNITS: Plan["unit"][] = ["/人", "/堂", "/10 堂"];
/** 起價 = the lowest price a student can pay for one lesson (website: priceFrom). */
const priceFrom = (plans: Plan[]) => Math.min(...plans.filter((p) => p.unit !== "/10 堂").map((p) => p.price), Infinity);

/** F5-3/F5-4 課程時段 (website: CoachLessonsScreen): plan templates and the weekly open times students book from.
 *  Edits show on the coach page and the booking page right away. */
export default function CoachLessons() {
  const { myCoach: co, setMyCoach } = useSession();
  const [adding, setAdding] = useState<Weekday | null>(null);
  if (!co) return null;
  const p = co.profile;
  const setPlans = (plans: Plan[]) => setMyCoach((x): Coach => {
    const from = priceFrom(plans);
    return { ...x, priceFrom: Number.isFinite(from) ? from : x.priceFrom, profile: { ...x.profile, plans } };
  });
  const setPlan = (i: number, patch: Partial<Plan>) => setPlans(p.plans.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setDay = (d: Weekday, times: string[]) => setMyCoach((x) => ({ ...x, profile: { ...x.profile, availability: { ...x.profile.availability, [d]: [...times].sort() } } }));
  const open = WEEK.reduce((n, d) => n + (p.availability[d]?.length ?? 0), 0);

  return (
    <ConsolePage title="課程與時段">
      <SecHead en="Plans" title="課程方案" right={<Text style={{ fontSize: 13, color: color.muted }}>起價 {money(co.priceFrom)}</Text>} />
      <Text style={c.hint}>開啟「可揪朋友」的方案，學生可以發起揪團、邀朋友各自用帳號加入，人數到了才送給你確認。</Text>
      {p.plans.map((pl, i) => (
        <View key={pl.id} style={c.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TextInput value={pl.name} onChangeText={(name) => setPlan(i, { name })} style={[c.input, { flex: 1, fontWeight: "800", fontSize: 17 }]} accessibilityLabel="方案名稱" />
            <Pressable disabled={p.plans.length === 1} onPress={() => Alert.alert(`刪除「${pl.name}」？`, undefined, [{ text: "先不要", style: "cancel" }, { text: "刪除", style: "destructive", onPress: () => setPlans(p.plans.filter((_, j) => j !== i)) }])} accessibilityLabel={`刪除 ${pl.name}`} hitSlop={8}>
              <Icon name="x" size={18} tint={p.plans.length === 1 ? color.n300 : color.text} />
            </Pressable>
          </View>
          <MoneyInput label="價格" value={pl.price} step={pl.unit === "/10 堂" ? 500 : 50} onChange={(price) => setPlan(i, { price })} />
          <Segmented label="計價" value={pl.unit} options={UNITS} format={(u) => ({ "/人": "每人", "/堂": "每堂", "/10 堂": "10 堂" })[u]} onChange={(unit) => setPlan(i, { unit })} />
          <Segmented label="時長" value={pl.durationMin} options={[45, 60, 90, 120] as const} format={(m) => `${m} 分`} onChange={(durationMin) => setPlan(i, { durationMin })} />
          <Field label="人數" value={pl.size} placeholder="例：1 人、3–4 人" onChange={(size) => setPlan(i, { size })} />
          <Field label="說明" value={pl.note} onChange={(note) => setPlan(i, { note })} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="users" size={16} /><Text style={{ fontSize: 15, fontWeight: "700" }}>可揪朋友一起上</Text></View>
            <Switch value={!!pl.group} onValueChange={(v) => setPlan(i, { group: v ? { min: 2, max: 4 } : undefined })} trackColor={{ true: color.accent700 }} />
          </View>
          {pl.group && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
              <Stepper label="最少" value={pl.group.min} min={2} max={pl.group.max} onChange={(v) => setPlan(i, { group: { ...pl.group!, min: v } })} />
              <Stepper label="最多" value={pl.group.max} min={pl.group.min} max={12} onChange={(v) => setPlan(i, { group: { ...pl.group!, max: v } })} />
              <Text style={c.hint}>人到齊才送給你</Text>
            </View>
          )}
        </View>
      ))}
      <Btn label="新增方案" icon="plus" onPress={() => setPlans([...p.plans, { id: "n" + Date.now().toString(36), name: "新方案", durationMin: 60, size: "1 人", price: 1000, unit: "/堂", note: "" }])} />

      <SecHead en="Weekly" title="每週開放時段" right={<Text style={{ fontSize: 13, color: color.muted }}>{open} 個時段</Text>} />
      <Text style={c.hint}>學生預約頁會直接用這些時段。</Text>
      <View style={[c.card, { gap: 0, paddingVertical: 4 }]}>
        {WEEK.map((d, i) => {
          const times = p.availability[d] ?? [];
          return (
            <View key={d} style={[{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }, i > 0 && { borderTopWidth: 1, borderTopColor: color.n100 }]}>
              <Text style={{ width: 36, fontWeight: "800", fontSize: 15 }}>週{d}</Text>
              <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {times.map((t) => (
                  <Pressable key={t} onPress={() => setDay(d, times.filter((x) => x !== t))} accessibilityLabel={`移除週${d} ${t}`}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: color.accentSoft, borderWidth: 1, borderColor: color.accent700, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 }}>
                    <Num style={{ fontSize: 15 }}>{t}</Num><Icon name="x" size={10} />
                  </Pressable>
                ))}
                {!times.length && <Text style={{ fontSize: 13, color: color.muted }}>不開放</Text>}
              </View>
              <Pressable onPress={() => setAdding(d)} accessibilityLabel={`新增週${d}時段`} style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: color.n300, alignItems: "center", justifyContent: "center" }}>
                <Icon name="plus" size={15} />
              </Pressable>
            </View>
          );
        })}
      </View>

      {adding && (
        <TimeSheet title={`週${adding} 開放時段`} taken={p.availability[adding] ?? []} onClose={() => setAdding(null)}
          onAdd={(t) => setDay(adding, [...(p.availability[adding] ?? []), t])} />
      )}
    </ConsolePage>
  );
}
