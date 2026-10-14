import { Link, router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shortAreas } from "@pikyoo/core/data/courts";
import { useCatalog } from "@/data/catalog";
import { useSession } from "@/data/session";
import { LevelChip } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Icon, type IconName } from "@/ui/Icon";
import { LoginSheet } from "@/ui/LoginSheet";
import { PkMark } from "@/ui/Logo";
import { color, radius } from "@/ui/theme";

const web = (path: string) => WebBrowser.openBrowserAsync(`https://pikyoo.vercel.app${path}`);

/** 我的 (website: MeScreen): who I am, the coach console, then one list (球局, 通知, 收藏, 新手). A visitor gets a sign-in card. */
export default function Me() {
  const insets = useSafeAreaInsets();
  const { signedIn, signOut, mine, profile: me, notices, favs } = useSession();
  const { catalog } = useCatalog();
  const [login, setLogin] = useState(false);
  useFocusEffect(useCallback(() => { setStatusBarStyle("light"); return () => setStatusBarStyle("dark"); }, []));
  const joined = (catalog?.games ?? []).filter((g) => mine[g.id]);
  const unread = notices.filter((n) => !n.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} contentInsetAdjustmentBehavior="never">
        <View style={[s.hero, { paddingTop: insets.top + 16 }]}>
          {signedIn ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={s.avatar}><Text style={{ fontSize: 22, fontWeight: "800" }}>{me.name.slice(0, 1)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>{me.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="pin" size={13} tint={color.onCarbonMuted} /><Text style={{ color: color.onCarbonMuted, fontSize: 14 }}>{shortAreas(me.areas)}</Text></View>
                </View>
                <Btn kind="onCarbon" label="編輯" lg={false} onPress={() => router.push("/me/profile")} style={{ borderRadius: 999 }} />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 14 }}>
                <LevelChip min={me.level} lg />
                <Pressable onPress={() => web("/learn/level-check")}><Text style={{ color: "#fff", textDecorationLine: "underline", fontSize: 14 }}>重新自評</Text></Pressable>
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
          {signedIn && (
            <Pressable onPress={() => router.push("/coach")} style={[s.rowCard, { backgroundColor: color.carbon, borderColor: color.carbon }]}>
              <Icon name="whistle" size={22} tint={color.accent} />
              <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "800", color: "#fff" }}>我是教練：教練後台</Text><Text style={{ fontSize: 13, color: color.onCarbonMuted }}>接預約、看課表、收錢（示範：Mia 教練）</Text></View>
              <Icon name="right" size={14} tint={color.onCarbonMuted} />
            </Pressable>
          )}

          <View style={{ gap: 12 }}>
                        <View style={s.card}>
              {signedIn && <Row icon="users" label="我的球局" sub={joined.length ? `報名中 ${joined.length} 場` : "還沒報名球局"} onPress={() => router.push("/games")} />}
              {signedIn && <Row icon="bell" label="通知" sub={unread ? `${unread} 則未讀` : undefined} onPress={() => router.push("/me/notifications")} />}
              {signedIn && <Row icon="heart" label="收藏的教練" sub={favs.length ? `${favs.length} 位` : "在教練頁按愛心收藏"} onPress={() => router.push("/me/saved")} />}
              {!signedIn && <Row icon="whistle" label="我是教練：教練後台" sub="登入後使用" onPress={() => setLogin(true)} />}
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
  rowCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 14 },
  card: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: color.n100 },
});
