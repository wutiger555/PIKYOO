import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { shortAreas } from "@pikyoo/core/data/courts";
import { AREAS } from "@pikyoo/core/data/games";
import { emptyGameFilters, filterGames, sheetFilterCount, type GameFilters } from "@pikyoo/core/game-filters";
import { useSession } from "@/data/session";
import { Chip } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Icon } from "@/ui/Icon";
import { LevelPicker } from "@/ui/LevelPicker";
import { Page, WithCatalog } from "@/ui/Page";
import { Sheet } from "@/ui/Sheet";
import { GameTicket } from "@/ui/Ticket";
import { color } from "@/ui/theme";

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
const HOME_AREAS = ["大安區", "信義區", "中山區"];

/** F2 球局列表 (website: GamesScreen): quick chips, the filter sheet, tickets grouped by day, empty state. */
export default function Games() {
  const { gameFilters: f, setGameFilters: set, mine } = useSession();
  const [sheet, setSheet] = useState(false);
  const fc = sheetFilterCount(f);
  const day = (k: NonNullable<GameFilters["day"]>, l: string) => <Chip key={k} on={f.day === k} onPress={() => set((p) => ({ ...p, day: p.day === k ? null : k, date: null }))}>{l}</Chip>;
  const chip = (k: GameFilters["chips"][number], l: string) => <Chip key={k} on={f.chips.includes(k)} onPress={() => set((p) => ({ ...p, chips: toggle(p.chips, k) }))}>{l}</Chip>;
  return (
    <Page>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 28, fontWeight: "800" }}>找球友打球</Text>
        <Text style={{ fontSize: 14, color: color.muted }}>{shortAreas(HOME_AREAS)}</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flex: 1 }}>
          {day("today", "今天")}{day("tomorrow", "明天")}{day("weekend", "週末")}{chip("eve", "晚上")}{chip("beg", "新手友善")}{chip("open", "有空位")}
        </ScrollView>
        <Pressable onPress={() => setSheet(true)} accessibilityLabel="更多篩選" style={s.filterBtn}>
          <Icon name="filter" size={20} />
          {fc > 0 && <Text style={s.dot}>{fc}</Text>}
        </Pressable>
      </View>
      <WithCatalog>{(cat) => {
        const list = filterGames(cat.games, f, mine);
        return (
          <>
            {list.length ? Object.keys(cat.dayGroups).map((k) => {
              const gs = list.filter((g) => g.group === k);
              if (!gs.length) return null;
              return (
                <View key={k} style={{ gap: 10 }}>
                  <View style={s.dateH}><Text style={{ fontSize: 17, fontWeight: "800" }}>{cat.dayGroups[k]}</Text><Text style={{ color: color.muted, fontSize: 13 }}>{gs.length} 局</Text></View>
                  {gs.map((g) => <GameTicket key={g.id} game={g} />)}
                </View>
              );
            }) : (
              <View style={{ alignItems: "center", gap: 8, paddingVertical: 32 }}>
                <Text style={{ fontSize: 18, fontWeight: "800" }}>最近還沒有局</Text>
                <Text style={{ color: color.muted }}>放寬篩選條件看看。開團請到網站。</Text>
                <Btn label="清除篩選" lg={false} onPress={() => set(emptyGameFilters)} />
              </View>
            )}
            {sheet && <FilterSheet count={list.length} dayGroups={cat.dayGroups} onClose={() => setSheet(false)} />}
          </>
        );
      }}</WithCatalog>
    </Page>
  );
}

function FilterSheet({ count, dayGroups, onClose }: { count: number; dayGroups: Record<string, string>; onClose: () => void }) {
  const { gameFilters: f, setGameFilters: set } = useSession();
  const times: [NonNullable<GameFilters["time"]>, string][] = [["am", "早上"], ["pm", "下午"], ["eve", "晚上"]];
  return (
    <Sheet title="篩選" onClose={onClose} action={
      <Pressable onPress={() => set((p) => ({ ...p, date: null, areas: [], time: null, openOnly: false, level: null }))} hitSlop={8}>
        <Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>清除</Text>
      </Pressable>
    }>
      <Text style={s.label}>日期</Text>
      <View style={s.wrap}>
        {Object.entries(dayGroups).map(([k, l]) => <Chip key={k} on={f.date === k} onPress={() => set((p) => ({ ...p, day: null, date: p.date === k ? null : k }))}>{l.replace(/（.）/, "")}</Chip>)}
      </View>
      <Text style={s.label}>區域</Text>
      <View style={s.wrap}>{AREAS.map((a) => <Chip key={a} on={f.areas.includes(a)} onPress={() => set((p) => ({ ...p, areas: toggle(p.areas, a) }))}>{a}</Chip>)}</View>
      <Text style={s.label}>時段</Text>
      <View style={s.seg}>
        {times.map(([k, l]) => (
          <Pressable key={k} onPress={() => set((p) => ({ ...p, time: p.time === k ? null : k }))} style={[s.segOpt, f.time === k && s.segOn]}><Text style={{ fontWeight: "700" }}>{l}</Text></Pressable>
        ))}
      </View>
      <Text style={s.label}>我的程度可以打</Text>
      <LevelPicker value={f.level} onPick={(lv) => set((p) => ({ ...p, level: p.level === lv ? null : lv }))} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <Text style={s.label}>只看有空位</Text>
        <Switch value={f.openOnly} onValueChange={(v) => set((p) => ({ ...p, openOnly: v }))} trackColor={{ true: color.accent700 }} />
      </View>
      <Btn kind="primary" label={`顯示 ${count} 局`} onPress={onClose} />
    </Sheet>
  );
}

const s = StyleSheet.create({
  filterBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: color.text, alignItems: "center", justifyContent: "center", backgroundColor: color.surface },
  dot: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, overflow: "hidden", textAlign: "center", lineHeight: 18, fontSize: 11, fontWeight: "800", backgroundColor: color.accent },
  dateH: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 },
  label: { fontSize: 16, fontWeight: "800", color: color.text },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  seg: { flexDirection: "row", backgroundColor: color.n100, borderRadius: 999, padding: 4 },
  segOpt: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 999 },
  segOn: { backgroundColor: color.surface },
});
