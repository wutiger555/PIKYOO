import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Court } from "@pikyoo/core/types";
import { Chip, Num, Tag } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Photo } from "@/ui/CoachCard";
import { Icon } from "@/ui/Icon";
import { Page, WithCatalog } from "@/ui/Page";
import { color, radius } from "@/ui/theme";

type ChipKey = "室內" | "室外" | "風雨" | "free" | "aircon" | "lights";
const CHIPS: [ChipKey, string][] = [["室內", "室內"], ["室外", "室外"], ["風雨", "風雨球場"], ["free", "免費"], ["aircon", "有冷氣"], ["lights", "夜間照明"]];

const match = (c: Court, on: ChipKey[]) => {
  const kinds = on.filter((x) => x === "室內" || x === "室外" || x === "風雨");
  if (kinds.length && !kinds.includes(c.kind)) return false;
  if (on.includes("free") && !c.free) return false;
  if (on.includes("aircon") && !c.aircon) return false;
  if (on.includes("lights") && !c.lights) return false;
  return true;
};

/** F4-1 球場列表 (website: CourtsScreen): quick filters, the booking method on every row. The website's map is still a
 *  placeholder (Google Maps comes later), so the app shows the list only. */
export default function Courts() {
  const [on, setOn] = useState<ChipKey[]>([]);
  return (
    <Page>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
        {CHIPS.map(([k, l]) => <Chip key={k} on={on.includes(k)} onPress={() => setOn((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))}>{l}</Chip>)}
        <View style={{ width: 24 }} />
      </ScrollView>
      <WithCatalog>{(cat) => {
        const list = cat.courts.filter((c) => match(c, on));
        return list.length ? (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
              <Text style={{ fontSize: 17, fontWeight: "800" }}>雙北球場</Text>
              <Text style={{ fontSize: 13, color: color.muted }}>{list.length} 處・依距離</Text>
            </View>
            <View style={s.list}>{list.map((c, i) => <CourtRow key={c.id} c={c} last={i === list.length - 1} />)}</View>
          </>
        ) : (
          <View style={{ alignItems: "center", gap: 8, paddingVertical: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>沒有符合的球場</Text>
            <Text style={{ color: color.muted }}>少選幾個條件看看。</Text>
            <Btn label="清除篩選" lg={false} onPress={() => setOn([])} />
          </View>
        );
      }}</WithCatalog>
    </Page>
  );
}

function CourtRow({ c, last }: { c: Court; last: boolean }) {
  return (
    <Link href={`/courts/${c.id}`} asChild>
      <Pressable style={StyleSheet.flatten([s.row, !last && { borderBottomWidth: 1, borderBottomColor: color.n100 }])}>
        {c.photo ? <Photo src={c.photo.src} alt="" tag={false} style={s.thumb} /> : <View style={[s.thumb, { backgroundColor: color.n200 }]} />}
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "800" }}>{c.name}</Text>
          <Text style={{ fontSize: 13, color: color.muted }}>{c.district}・{c.kind} {c.courtCount} 面・{c.free ? "免費" : "付費"}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
            <Tag tone="outline">{c.booking}</Tag>
            {c.verified && <Tag>✓ PIKYOO 已確認 {c.verified}</Tag>}
          </View>
        </View>
        {!!c.distance && <Num style={{ fontSize: 15, color: color.muted }}>{c.distance}</Num>}
        <Icon name="right" size={14} tint={color.muted} />
      </Pressable>
    </Link>
  );
}

const s = StyleSheet.create({
  list: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, paddingHorizontal: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  thumb: { width: 64, height: 48, borderRadius: radius.sm },
});
