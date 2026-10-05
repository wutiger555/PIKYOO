import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ME } from "@pikyoo/core/data/games";
import { LEVELS, levelText } from "@pikyoo/core/format";
import type { Game } from "@pikyoo/core/types";
import { isLive, useCatalog } from "@/data/catalog";
import { useGameView, useSession } from "@/data/session";
import { Num, Tag } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Icon } from "@/ui/Icon";
import { LoginSheet } from "@/ui/LoginSheet";
import { Page, WithCatalog } from "@/ui/Page";
import { Sheet } from "@/ui/Sheet";
import { GameTicket, Seats } from "@/ui/Ticket";
import { color, radius } from "@/ui/theme";

/** F2 球局詳情 (website: GameDetailScreen): big ticket, seats, fee / cancel / level, location, host, roster, sticky CTA
 *  (join / waitlist / cancel). Hosting tools stay on the website (docs/APP.md §4). */
export default function GamePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const g = useCatalog().catalog?.games.find((x) => x.id === id);
  if (!g) return <Page><WithCatalog>{() => <Text style={{ fontSize: 16 }}>找不到這個球局</Text>}</WithCatalog></Page>;
  return <GameDetail g={g} />;
}

function GameDetail({ g }: { g: Game }) {
  const insets = useSafeAreaInsets();
  const { signedIn, join, leave } = useSession();
  const { my, count, spots, waitN } = useGameView(g);
  const [sheet, setSheet] = useState<"confirm" | "cancel" | "login" | null>(null);
  const cancelHours = g.cancelHours ?? 12;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.address)}`;
  const askJoin = () => setSheet(signedIn ? "confirm" : "login");
  const share = () => Share.share({ message: `${g.dayLabel} ${g.date} ${g.startsAt} ${g.venue}｜PIKYOO 匹友 https://pikyoo.vercel.app/games/${g.id}` });

  let info: [string, string, boolean?];
  let action: React.ReactNode;
  if (my === "joined") {
    info = ["你已報名", `開始前 ${cancelHours} 小時可免責取消`, true];
    action = <Btn label="取消報名" onPress={() => setSheet("cancel")} />;
  } else if (my === "wait") {
    info = [`候補第 ${waitN} 位`, "有人取消會自動遞補", true];
    action = <Btn label="取消候補" onPress={() => setSheet("cancel")} />;
  } else if (spots > 0) {
    info = [`NT$${g.fee}`, `還有 ${spots} 個位子`];
    action = <Btn kind="primary" label="報名" onPress={askJoin} />;
  } else {
    info = [`NT$${g.fee}`, `額滿・已有 ${g.waitlist} 人候補`];
    action = <Btn kind="secondary" label={`加入候補（第 ${g.waitlist + 1} 位）`} onPress={askJoin} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 + insets.bottom }}>
        <GameTicket game={g} lg />
        <Block title={`名額 ${count}/${g.capacity}`}><Seats game={g} lg /></Block>
        <Block>
          <KV k="費用"><Text style={s.body}><Num style={{ fontSize: 19 }}>NT${g.fee}</Num>／人・{g.payNote}</Text></KV>
          <KV k="取消"><Text style={s.body}>開始前 {cancelHours} 小時可免責取消</Text></KV>
          <KV k="程度"><Text style={s.body}>{levelText(g.levelMin, g.levelMax)}{g.beginnerFriendly ? "・新手友善" : ""}</Text></KV>
        </Block>
        <Block title="地點">
          <Text style={{ fontSize: 16, fontWeight: "700" }}>{g.venue}</Text>
          <Text style={{ fontSize: 14, color: color.muted }}>{g.address}</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <Btn label="導航" icon="pin" lg={false} onPress={() => Linking.openURL(maps)} style={{ borderRadius: 999 }} />
            {g.courtId && <Btn label="球場資訊" lg={false} onPress={() => router.push(`/courts/${g.courtId}`)} style={{ borderRadius: 999 }} />}
          </View>
        </Block>
        <Block title="團主">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={[s.avatar, { width: 44, height: 44, borderRadius: 22 }]}><Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{g.host.initial}</Text></View>
            <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "800" }}>{g.host.name}</Text><Text style={{ fontSize: 13, color: color.muted }}>{g.host.summary}</Text></View>
          </View>
          {!!g.notes && <Text style={[s.body, { marginTop: 4 }]}>{g.notes}</Text>}
        </Block>
        <Block title="名單" last>
          {g.participants.map((p, i) => (
            <View key={i} style={s.person}>
              <View style={s.avatar}><Text style={{ color: "#fff", fontWeight: "700" }}>{p.initial}</Text></View>
              <Text style={[s.body, { flex: 1 }]}>{p.name}</Text>
              {i === 0 && <Tag tone="accent">團主</Tag>}
            </View>
          ))}
          {my === "joined" && (
            <View style={s.person}>
              <View style={[s.avatar, { backgroundColor: color.accent, borderWidth: 1.5, borderColor: color.text }]}><Text style={{ fontWeight: "800" }}>你</Text></View>
              <Text style={[s.body, { flex: 1 }]}>{ME.name}（你）</Text>
            </View>
          )}
          {g.waitlist > 0 && <Text style={{ fontSize: 14, color: color.muted }}>另有 {waitN} 人候補中</Text>}
        </Block>
      </ScrollView>

      <View style={[s.cta, { paddingBottom: insets.bottom + 10 }]}>
        <View style={{ flex: 1 }}>
          {info[2] ? <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>{info[0]}</Text> : <Num style={{ color: "#fff", fontSize: 26 }}>{info[0]}</Num>}
          <Text style={{ color: color.onCarbonMuted, fontSize: 13 }}>{info[1]}</Text>
        </View>
        <Pressable onPress={share} accessibilityLabel="分享" style={s.share}><Icon name="share" size={18} tint="#fff" /></Pressable>
        {action}
      </View>

      {sheet === "login" && <LoginSheet reason="登入後就能報名球局" webPath={`/games/${g.id}`} onClose={() => setSheet(null)} />}
      {sheet === "confirm" && (
        <Sheet title={spots <= 0 ? "確認加入候補" : "確認報名"} onClose={() => setSheet(null)}>
          <Summary g={g} />
          {!isLive && (ME.level < g.levelMin || ME.level > g.levelMax) && (
            <Text style={s.notice}>這局程度 {levelText(g.levelMin, g.levelMax)}，你目前是 {LEVELS[ME.level]}。還是可以報名，團主會看到你的程度。</Text>
          )}
          <Text style={{ fontSize: 14, color: color.muted, lineHeight: 21 }}>
            {spots <= 0 ? `你會是第 ${g.waitlist + 1} 位候補。有人取消時自動遞補，並用 LINE 通知你。` : `開始前 ${cancelHours} 小時可免責取消，之後取消會記一次晚取消。`}
          </Text>
          <Btn kind="primary" label={spots <= 0 ? "確認候補" : "確認報名"} onPress={() => { join(g.id, spots <= 0); setSheet(null); Alert.alert(spots <= 0 ? "已加入候補" : "報名成功！", spots <= 0 ? "有人取消會自動遞補" : `${g.dayLabel} ${g.startsAt} 見`); }} />
        </Sheet>
      )}
      {sheet === "cancel" && (
        <Sheet title={my === "wait" ? "取消候補？" : "取消報名？"} onClose={() => setSheet(null)}>
          <Summary g={g} />
          <Text style={{ fontSize: 14, color: color.muted, lineHeight: 21 }}>
            {my === "wait" ? "取消後會失去目前的候補順位，之後再候補要重新排。" : `位子會讓給候補的人。開始前 ${cancelHours} 小時內取消會記一次晚取消，團主看得到。`}
          </Text>
          <Btn label={my === "wait" ? "確定取消候補" : "確定取消報名"} onPress={() => { leave(g.id); setSheet(null); Alert.alert(my === "wait" ? "已取消候補" : "已取消報名", my === "wait" ? undefined : "位子會釋出給候補的人"); }} />
          <Btn kind="ghost" label={my === "wait" ? "繼續候補" : "保留報名"} onPress={() => setSheet(null)} />
        </Sheet>
      )}
    </View>
  );
}

const Summary = ({ g }: { g: Game }) => (
  <View style={s.sum}>
    <Text style={{ fontSize: 13, color: color.muted }}>{g.dayLabel} {g.date}・{g.venue}</Text>
    <Num style={{ fontSize: 30 }}>{g.startsAt}–{g.endsAt}</Num>
    <Text style={s.body}>NT${g.fee}・{g.payNote}</Text>
  </View>
);
function Block({ title, children, last }: { title?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[{ paddingVertical: 16, gap: 10 }, !last && { borderBottomWidth: 1, borderBottomColor: color.line }]}>
      {title && <Text style={{ fontSize: 18, fontWeight: "800" }}>{title}</Text>}
      {children}
    </View>
  );
}
const KV = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <View style={{ flexDirection: "row", gap: 16 }}><Text style={{ width: 40, fontSize: 15, fontWeight: "700", color: color.n700 }}>{k}</Text><View style={{ flex: 1 }}>{children}</View></View>
);

const s = StyleSheet.create({
  body: { fontSize: 15, lineHeight: 22, color: color.text },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: color.n800, alignItems: "center", justifyContent: "center" },
  person: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  sum: { backgroundColor: color.bg, borderRadius: radius.md, padding: 14, gap: 2 },
  notice: { backgroundColor: "#E3ECF5", color: "#24507A", borderRadius: radius.md, padding: 12, fontSize: 14, lineHeight: 20, overflow: "hidden" },
  share: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,.25)", alignItems: "center", justifyContent: "center" },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: color.carbon, paddingHorizontal: 16, paddingTop: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});
