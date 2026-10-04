import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { filterCoaches, emptyCoachFilters } from "@pikyoo/core/coach-filters";
import { LEVELS, levelText, money } from "@pikyoo/core/format";
import type { Coach, LessonType } from "@pikyoo/core/types";
import { useCatalog } from "@/data/catalog";
import { useSession } from "@/data/session";
import { Chip, Num, Tag } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { CoachCard, Photo } from "@/ui/CoachCard";
import { Icon } from "@/ui/Icon";
import { LevelPicker } from "@/ui/LevelPicker";
import { Page, WithCatalog } from "@/ui/Page";
import { Sheet } from "@/ui/Sheet";
import { color, radius } from "@/ui/theme";

const TYPES: LessonType[] = ["體驗課", "一對一", "小班", "團體"];

/** F3-3 找教練 (website: FindCoachesScreen): "我是【程度】，想上【類型】", standard cards, compare up to 3. */
export default function FindCoaches() {
  const { filters: f, setFilters, compare } = useSession();
  const [sheet, setSheet] = useState<"lv" | "cmp" | null>(null);
  const any = f.level != null || f.type != null || f.cert || f.beg;
  return (
    <View style={{ flex: 1 }}>
      <Page title="找教練">
        <View style={s.need}>
          <Text style={s.q}>我是</Text>
          <Pressable style={s.pick} onPress={() => setSheet("lv")}>
            <Text style={s.pickText}>{f.level != null ? LEVELS[f.level] : "選程度"}</Text><Icon name="down" size={14} />
          </Pressable>
          <Text style={s.q}>，想上</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
          {TYPES.map((t) => <Chip key={t} on={f.type === t} onPress={() => setFilters((p) => ({ ...p, type: p.type === t ? null : t }))}>{t}</Chip>)}
          <Chip on={f.cert} onPress={() => setFilters((p) => ({ ...p, cert: !p.cert }))}>已認證教練</Chip>
          <Chip on={f.beg} onPress={() => setFilters((p) => ({ ...p, beg: !p.beg }))}>新手友善</Chip>
          <View style={{ width: 24 }} />
        </ScrollView>
        <WithCatalog>{(cat) => {
          const list = filterCoaches(cat.coaches, f);
          return (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Text style={{ flex: 1, fontSize: 15 }}><Num style={{ fontSize: 17 }}>{list.length}</Num> 位教練符合</Text>
                {any && <Pressable onPress={() => setFilters(emptyCoachFilters)}><Text style={{ fontSize: 14, fontWeight: "700", textDecorationLine: "underline" }}>清除條件</Text></Pressable>}
              </View>
              {list.length ? list.map((c) => <CoachCard key={c.id} coach={c} />) : (
                <View style={{ alignItems: "center", gap: 8, paddingVertical: 32 }}>
                  <Text style={{ fontSize: 18, fontWeight: "700" }}>沒有符合的教練</Text>
                  <Text style={{ color: color.muted }}>放寬程度或類型看看。</Text>
                  <Btn label="清除條件" lg={false} onPress={() => setFilters(emptyCoachFilters)} />
                </View>
              )}
              <Text style={{ fontSize: 12, color: color.muted, lineHeight: 18, marginBottom: compare.length ? 72 : 0 }}>所有教練用同一張卡片格式，價格、程度、認證都寫在同一個位置，方便比較。標「示意照」的是免費圖庫照片，不是教練本人。</Text>
              {sheet === "cmp" && <CompareSheet coaches={compare.map((id) => cat.coaches.find((c) => c.id === id)).filter((c): c is Coach => !!c)} onClose={() => setSheet(null)} />}
            </>
          );
        }}</WithCatalog>
      </Page>

      {compare.length > 0 && (
        <View style={s.tray}>
          <Text style={{ flex: 1, color: "#fff", fontSize: 15, fontWeight: "600" }}>已選 {compare.length} 位</Text>
          <Btn kind="primary" icon="cols" label="比較" lg={false} disabled={compare.length < 2} onPress={() => setSheet("cmp")} style={{ borderRadius: 999 }} />
        </View>
      )}

      {sheet === "lv" && (
        <Sheet title="你現在的程度？" onClose={() => setSheet(null)}>
          <Text style={{ color: color.muted, fontSize: 14 }}>不確定就選「新手」。</Text>
          <LevelPicker value={f.level} onPick={(lv) => { setFilters((p) => ({ ...p, level: p.level === lv ? null : lv })); setSheet(null); }} />
        </Sheet>
      )}
    </View>
  );
}

/** 比較教練: same field in the same row; lowest price flagged; DUPR marked self-reported (website: CompareSheet). */
function CompareSheet({ coaches: cs, onClose }: { coaches: Coach[]; onClose: () => void }) {
  const low = Math.min(...cs.map((c) => c.priceFrom));
  const row = (label: string, cell: (c: Coach) => React.ReactNode) => (
    <View style={s.cmpRow}>
      <Text style={s.cmpTh}>{label}</Text>
      {cs.map((c) => <View key={c.id} style={s.cmpTd}>{cell(c)}</View>)}
    </View>
  );
  const t = (x: string) => <Text style={{ fontSize: 14 }}>{x}</Text>;
  return (
    <Sheet title="比較教練" onClose={onClose}>
      <View style={s.cmpRow}>
        <View style={s.cmpTh} />
        {cs.map((c) => (
          <View key={c.id} style={[s.cmpTd, { gap: 6 }]}>
            {c.profile.photos[0] ? <Photo src={c.profile.photos[0].src} alt={c.name} tag={false} style={{ width: 48, height: 48, borderRadius: 24 }} /> : null}
            <Text style={{ fontWeight: "800", fontSize: 15 }}>{c.name}</Text>
          </View>
        ))}
      </View>
      {row("認證", (c) => { const xs = c.creds.filter((x) => x.issuer !== "DUPR"); return xs.length ? xs.map((x, i) => <Text key={i} style={{ fontSize: 14 }}>{x.issuer} {x.level}</Text>) : <Text style={{ color: color.muted }}>未提供</Text>; })}
      {row("DUPR", (c) => { const d = c.creds.find((x) => x.issuer === "DUPR"); return d ? <Text><Num style={{ fontSize: 16 }}>{d.level}</Num> <Text style={{ fontSize: 12, color: color.muted }}>自填</Text></Text> : t("—"); })}
      {row("程度", (c) => t(levelText(c.levelMin, c.levelMax)))}
      {row("起價", (c) => <><Num style={{ fontSize: 19 }}>{money(c.priceFrom)}</Num>{c.priceFrom === low && <Tag tone="accent">最低</Tag>}</>)}
      {row("類型", (c) => t(c.types.join("\n")))}
      {row("區域", (c) => t(c.areas.join("・")))}
      {row("教學年資", (c) => t(`${c.years} 年`))}
      {row("評價", (c) => (c.rating != null ? t(`${c.rating}（${c.reviews}）`) : <Text style={{ color: color.muted }}>尚無</Text>))}
      {row("最近可約", (c) => t(c.nextSlot))}
      <View style={s.cmpRow}>
        <View style={s.cmpTh} />
        {cs.map((c) => (
          <View key={c.id} style={s.cmpTd}>
            <Link href={`/coaches/${c.id}`} asChild onPress={onClose}><Pressable style={s.cmpBtn}><Text style={{ fontWeight: "700", fontSize: 13 }}>看教練頁</Text></Pressable></Link>
          </View>
        ))}
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  need: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  q: { fontSize: 20, fontWeight: "700", color: color.text },
  pick: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: color.accent, borderWidth: 1.5, borderColor: color.text, borderRadius: 999, paddingLeft: 14, paddingRight: 10, paddingVertical: 3 },
  pickText: { fontSize: 18, fontWeight: "700" },
  tray: { position: "absolute", left: 16, right: 16, bottom: 104, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.carbon, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 10 },
  cmpRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: color.n100, paddingVertical: 10 },
  cmpTh: { width: 64, fontSize: 13, fontWeight: "700", color: color.muted },
  cmpTd: { flex: 1, paddingHorizontal: 4, gap: 2 },
  cmpBtn: { borderWidth: 1.5, borderColor: color.n300, borderRadius: 999, paddingVertical: 8, alignItems: "center" },
});
