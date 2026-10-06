import { Link, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { money } from "@pikyoo/core/format";
import { useSession } from "@/data/session";
import { LevelChip, Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Photo } from "@/ui/CoachCard";
import { Icon } from "@/ui/Icon";
import { color, radius } from "@/ui/theme";

/** 收藏的教練: the coaches saved with the heart on their page, to come back to and book. */
export default function Saved() {
  const { favs, coaches } = useSession();
  const list = favs.map((id) => coaches.find((c) => c.id === id)).filter((c) => c != null);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      {list.length ? list.map((c) => (
        <Link key={c.id} href={`/coaches/${c.id}`} asChild>
          <Pressable style={s.row}>
            {c.profile.photos[0] ? <Photo src={c.profile.photos[0].src} alt={c.name} tag={false} style={{ width: 56, height: 56, borderRadius: 28 }} /> : null}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 17, fontWeight: "800" }}>{c.name}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><LevelChip min={c.levelMin} max={c.levelMax} /><Text style={{ fontSize: 13, color: color.muted }}>{c.areas.join("・")}</Text></View>
            </View>
            <View style={{ alignItems: "flex-end" }}><Text style={{ fontSize: 12, color: color.muted }}>起價</Text><Num style={{ fontSize: 20 }}>{money(c.priceFrom)}</Num></View>
            <Icon name="right" size={14} tint={color.muted} />
          </Pressable>
        </Link>
      )) : (
        <View style={s.empty}>
          <Icon name="heart" size={26} tint={color.muted} />
          <Text style={{ fontSize: 16, fontWeight: "800" }}>還沒有收藏的教練</Text>
          <Text style={{ color: color.muted, textAlign: "center", lineHeight: 20 }}>在教練頁右上角按愛心，之後就能從這裡回來預約。</Text>
          <Btn kind="primary" label="找教練" lg={false} style={{ borderRadius: 999 }} onPress={() => router.replace("/coaches")} />
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 12 },
  empty: { alignItems: "center", gap: 8, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 24 },
});
