import { Link, router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ME } from "@pikyoo/core/data/games";
import { demoNotices } from "@pikyoo/core/data/notifications";
import { useCatalog } from "@/data/catalog";
import { useSession } from "@/data/session";
import { LevelChip, Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Icon, type IconName } from "@/ui/Icon";
import { LoginSheet } from "@/ui/LoginSheet";
import { PkMark } from "@/ui/Logo";
import { GameTicket } from "@/ui/Ticket";
import { color, radius } from "@/ui/theme";

// F8 匹友信用 v0, the website's mock numbers: only the player sees the detail; hosts see the rate.
const RECORD = { played: 12, attended: 11, late: 1 };
const web = (path: string) => WebBrowser.openBrowserAsync(`https://pikyoo.vercel.app${path}`);

/** 我的 (website: MeScreen): profile and attendance, my lessons, my games, settings. A visitor gets a sign-in card. */
export default function Me() {
  const insets = useSafeAreaInsets();
  const { signedIn, signOut, mine } = useSession();
  const { catalog } = useCatalog();
  const [login, setLogin] = useState(false);
  const [tab, setTab] = useState<"joined" | "history">("joined");
  useFocusEffect(useCallback(() => { setStatusBarStyle("light"); return () => setStatusBarStyle("dark"); }, []));
  const joined = (catalog?.games ?? []).filter((g) => mine[g.id]);
  const unread = demoNotices().filter((n) => !n.read).length;
  const rate = Math.round((RECORD.attended / RECORD.played) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} contentInsetAdjustmentBehavior="never">
        <View style={[s.hero, { paddingTop: insets.top + 16 }]}>
          {signedIn ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={s.avatar}><Text style={{ fontSize: 22, fontWeight: "800" }}>{ME.name.slice(0, 1)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>{ME.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="pin" size={13} tint={color.onCarbonMuted} /><Text style={{ color: color.onCarbonMuted, fontSize: 14 }}>大安・信義・中山</Text></View>
                </View>
                <Btn kind="onCarbon" label="編輯" lg={false} onPress={() => web("/welcome")} style={{ borderRadius: 999 }} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 }}>
                <LevelChip min={ME.level} lg />
                <Pressable onPress={() => web("/learn/level-check")}><Text style={{ color: "#fff", textDecorationLine: "underline", fontSize: 14 }}>重新自評</Text></Pressable>
              </View>
              <View style={s.stats}>
                <Stat n={String(RECORD.played)} label="打過的局" />
                <Stat n={`${rate}%`} label="出席率" />
                <Stat n={String(RECORD.late)} label="晚取消" last />
              </View>
            </>
          ) : (
            <View style={{ gap: 10 }}>
              <PkMark />
              <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 8 }}>登入 PIKYOO</Text>
              <Text style={{ color: color.onCarbonMuted, fontSize: 15, lineHeight: 22 }}>預約課程、報名球局、看出席紀錄與通知，都在這裡。</Text>
              <Btn kind="primary" label="用 LINE 登入／註冊" onPress={() => setLogin(true)} style={{ marginTop: 6 }} />
            </View>
          )}
        </View>

        <View style={{ padding: 16, gap: 20 }}>
          {signedIn && <Text style={{ fontSize: 12, color: color.muted, marginTop: -8 }}>出席紀錄只有你看得到；團主在名單上只會看到出席率。</Text>}

          <Link href="/lessons" asChild>
            <Pressable style={s.rowCard}>
              <Icon name="cal" size={22} />
              <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "800" }}>我的課</Text><Text style={{ fontSize: 13, color: color.muted }}>即將上課、上過的課</Text></View>
              <Icon name="right" size={14} tint={color.muted} />
            </Pressable>
          </Link>

          {signedIn && (
            <Pressable onPress={() => router.push("/coach")} style={[s.rowCard, { backgroundColor: color.carbon, borderColor: color.carbon }]}>
              <Icon name="whistle" size={22} tint={color.accent} />
              <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>我是教練：教練後台</Text><Text style={{ fontSize: 13, color: color.onCarbonMuted }}>確認預約、收款對帳、回覆提問、編輯教練頁（示範：Mia 教練）</Text></View>
              <Icon name="right" size={14} tint={color.onCarbonMuted} />
            </Pressable>
          )}

          {signedIn && (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
                <View><Text style={s.en}>MY GAMES</Text><Text style={{ fontSize: 24, fontWeight: "800" }}>我的球局</Text></View>
                <Link href="/games" asChild><Pressable><Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>找球友打球</Text></Pressable></Link>
              </View>
              <View style={s.seg}>
                {([["joined", `報名中 ${joined.length}`], ["history", "打過的"]] as const).map(([k, l]) => (
                  <Pressable key={k} onPress={() => setTab(k)} style={[s.segOpt, tab === k && s.segOn]}><Text style={{ fontWeight: "700" }}>{l}</Text></Pressable>
                ))}
              </View>
              {tab === "joined" && joined.length ? joined.map((g) => <GameTicket key={g.id} game={g} />) : (
                <View style={s.empty}>
                  <Text style={{ color: color.muted }}>{tab === "joined" ? "還沒報名任何一局" : "打完的局會出現在這裡"}</Text>
                  <Btn label="找一局來打" lg={false} onPress={() => router.push("/games")} style={{ borderRadius: 999 }} />
                </View>
              )}
            </View>
          )}

          <View style={{ gap: 12 }}>
            <View><Text style={s.en}>SETTINGS</Text><Text style={{ fontSize: 24, fontWeight: "800" }}>設定</Text></View>
            <View style={s.card}>
              {signedIn && <Row icon="bell" label="通知" sub={unread ? `${unread} 則未讀` : undefined} onPress={() => router.push("/me/notifications")} />}
              <Row icon="heart" label="收藏的球場與教練" sub="下一輪推出" onPress={() => Alert.alert("收藏", "收藏功能下一輪推出")} />
              <Row icon="whistle" label="我是教練：教練後台" sub={signedIn ? "示範：以 Mia 教練的身分" : "登入後使用"} onPress={() => (signedIn ? router.push("/coach") : setLogin(true))} />
              <Row icon="sprout" label="第一次打匹克球？" sub="規則與程度自評（網站）" onPress={() => web("/learn")} />
              {signedIn
                ? <Row icon="logout" label="登出（示範：看訪客畫面）" onPress={signOut} last />
                : <Row icon="user" label="登入／註冊" onPress={() => setLogin(true)} last />}
            </View>
            <Text style={{ textAlign: "center", fontSize: 12, color: color.muted }}>PIKYOO 匹友 {Constants.expoConfig?.version}</Text>
          </View>
        </View>
      </ScrollView>
      <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: insets.top, backgroundColor: color.carbon }} />
      {login && <LoginSheet reason="登入後可以預約課程、報名球局" webPath="/me" onClose={() => setLogin(false)} />}
    </View>
  );
}

const Stat = ({ n, label, last }: { n: string; label: string; last?: boolean }) => (
  <View style={[{ flex: 1, gap: 2 }, !last && { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,.14)" }]}>
    <Num style={{ fontSize: 26, color: "#fff" }}>{n}</Num><Text style={{ fontSize: 12, color: color.onCarbonMuted }}>{label}</Text>
  </View>
);
function Row({ icon, label, sub, onPress, last }: { icon: IconName; label: string; sub?: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={StyleSheet.flatten([s.row, last && { borderBottomWidth: 0 }])}>
      <Icon name={icon} size={20} />
      <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "600" }}>{label}</Text>{sub && <Text style={{ fontSize: 13, color: color.muted }}>{sub}</Text>}</View>
      <Icon name="right" size={14} tint={color.muted} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: color.carbon, paddingHorizontal: 16, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: color.accent, alignItems: "center", justifyContent: "center" },
  stats: { flexDirection: "row", gap: 12, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,.14)" },
  en: { fontFamily: "BarlowCondensed_700Bold", fontSize: 12, letterSpacing: 1.5, color: color.muted },
  rowCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 14 },
  card: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: color.n100 },
  seg: { flexDirection: "row", backgroundColor: color.n100, borderRadius: 999, padding: 4 },
  segOpt: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 999 },
  segOn: { backgroundColor: color.surface },
  empty: { alignItems: "center", gap: 10, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 20 },
});
