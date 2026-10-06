import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lessons as demoLessons } from "@pikyoo/core/data/games";
import { money } from "@pikyoo/core/format";
import type { Court } from "@pikyoo/core/types";
import { isLive, useCatalog } from "@/data/catalog";
import { Num, Tag } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Photo } from "@/ui/CoachCard";
import { Icon } from "@/ui/Icon";
import { Page, WithCatalog } from "@/ui/Page";
import { GameTicket } from "@/ui/Ticket";
import { color } from "@/ui/theme";
import { toast } from "@/ui/Toast";

const BOOK_CTA: Record<Court["booking"], string> = {
  公立預約系統: "前往預約系統", 官網預約: "前往官網預約", "LINE 預約": "用 LINE 預約", 電話預約: "打電話預約", 免預約: "直接去打",
};

/** F4-2 球場詳情 (website: CourtDetailScreen): facts, how to book, rules, location, and the games and lessons held here. */
export default function CourtPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { catalog } = useCatalog();
  const c = catalog?.courts.find((x) => x.id === id);
  const insets = useSafeAreaInsets();
  if (!catalog || !c) return <Page><WithCatalog>{() => <Text style={{ fontSize: 16 }}>找不到這個球場</Text>}</WithCatalog></Page>;
  const games = catalog.games.filter((g) => g.courtId === c.id);
  // the website shows the demo's sample lessons here too; live lessons per court come with the booking data
  const lessons = isLive ? [] : demoLessons().filter((l) => l.courtId === c.id);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`;
  const book = () => (c.booking === "免預約" ? Linking.openURL(maps) : Alert.alert(BOOK_CTA[c.booking], c.bookingNote));

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <Stack.Screen options={{ title: "球場" }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}>
        {c.photo ? <Photo src={c.photo.src} alt={c.photo.alt} style={{ height: 220 }} /> : <View style={{ height: 160, backgroundColor: color.n200 }} />}
        <View style={{ paddingHorizontal: 16 }}>
          <Block>
            <Text style={{ fontSize: 24, fontWeight: "800" }}>{c.name}</Text>
            <Text style={{ fontSize: 14, color: color.muted }}>{c.district}・{c.kind} {c.courtCount} 面・{c.surface}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{c.amenities.map((a) => <Tag key={a}>{a}</Tag>)}</View>
            {c.verified && <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="check" size={12} tint={color.muted} /><Text style={{ fontSize: 13, color: color.muted }}>PIKYOO 已確認 {c.verified}</Text></View>}
          </Block>
          <Block title="怎麼預約">
            <Tag tone="accent">{c.booking}</Tag>
            <Text style={s.body}>{c.bookingNote}</Text>
          </Block>
          <Block>
            <KV k="開放" v={c.hours} /><KV k="收費" v={c.priceNote} /><KV k="規則" v={c.rules} />
          </Block>
          <Block title="地點">
            <Text style={{ fontSize: 14, color: color.muted }}>{c.address}</Text>
            <Btn label="導航" icon="pin" lg={false} onPress={() => Linking.openURL(maps)} style={{ alignSelf: "flex-start", borderRadius: 999 }} />
          </Block>
          <Block title="這裡的球局">
            {games.length ? games.map((g) => <GameTicket key={g.id} game={g} />) : <Text style={{ color: color.muted }}>這週還沒有人在這裡開團。開團請到網站。</Text>}
          </Block>
          {lessons.length > 0 && (
            <Block title="這裡的課">
              {lessons.map((l) => (
                <Link key={l.id} href={`/coaches/${l.coachId}`} asChild>
                  <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 }}>
                    <View style={s.avatar}><Text style={{ color: "#fff", fontWeight: "700" }}>{l.initial}</Text></View>
                    <View style={{ flex: 1 }}><Text style={{ fontWeight: "800", fontSize: 15 }}>{l.title}</Text><Text style={{ fontSize: 13, color: color.muted }}>{l.when}・{l.coach}</Text></View>
                    <Num style={{ fontSize: 18 }}>{money(l.price)}</Num>
                  </Pressable>
                </Link>
              ))}
            </Block>
          )}
          <Pressable onPress={() => toast("謝謝回報！", "我們會再確認這個球場的資料")} style={{ paddingVertical: 16 }}>
            <Text style={{ color: color.muted, textDecorationLine: "underline" }}>資料有誤？回報給我們</Text>
          </Pressable>
        </View>
      </ScrollView>
      <View style={[s.cta, { paddingBottom: insets.bottom + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{c.free ? "免費" : c.booking}</Text>
          <Text style={{ color: color.onCarbonMuted, fontSize: 13 }} numberOfLines={1}>{c.hours}</Text>
        </View>
        <Btn kind="primary" label={BOOK_CTA[c.booking]} onPress={book} />
      </View>
    </View>
  );
}

function Block({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingVertical: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: color.line }}>
      {title && <Text style={{ fontSize: 18, fontWeight: "800" }}>{title}</Text>}
      {children}
    </View>
  );
}
const KV = ({ k, v }: { k: string; v: string }) => (
  <View style={{ flexDirection: "row", gap: 16 }}><Text style={{ width: 40, fontSize: 15, fontWeight: "700", color: color.n700 }}>{k}</Text><Text style={[s.body, { flex: 1 }]}>{v}</Text></View>
);

const s = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 22, color: color.text },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: color.n800, alignItems: "center", justifyContent: "center" },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.carbon, paddingHorizontal: 16, paddingTop: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});
