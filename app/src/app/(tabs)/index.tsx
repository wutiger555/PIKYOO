import { Link, router, useFocusEffect, type Href } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bookingDays, slotsFor } from "@pikyoo/core/data/coaches";
import { ME } from "@pikyoo/core/data/games";
import { LEVELS, money } from "@pikyoo/core/format";
import type { Catalog } from "@pikyoo/core/source/types";
import type { LessonType } from "@pikyoo/core/types";
import { useCatalog } from "@/data/catalog";
import { useSession } from "@/data/session";
import { Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { CoachMini } from "@/ui/CoachMini";
import { Icon, type IconName } from "@/ui/Icon";
import { LoginSheet } from "@/ui/LoginSheet";
import { PkMark } from "@/ui/Logo";
import { WithCatalog } from "@/ui/Page";
import { color, radius } from "@/ui/theme";

const TYPES: [LessonType, IconName][] = [["體驗課", "sprout"], ["一對一", "user"], ["小班", "users"], ["團體", "users"]];
const MY_AREAS = "大安・信義・中山";

/** 首頁 (website: HomeScreen): a visitor gets the PIKYOO landing that asks them to sign up; a signed-in student gets
 *  their own home, courses first (docs memory: course-first), games and courts below. */
export default function Home() {
  const { signedIn, refreshing, refresh } = { ...useSession(), ...useCatalog() };
  const insets = useSafeAreaInsets();
  const [login, setLogin] = useState(false);
  // the carbon hero sits under the status bar: light text while this tab is showing
  useFocusEffect(useCallback(() => { setStatusBarStyle("light"); return () => setStatusBarStyle("dark"); }, []));
  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} contentInsetAdjustmentBehavior="never" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#fff" />}>
        <WithCatalog>{(cat) => (signedIn ? <MemberHome cat={cat} top={insets.top} /> : <GuestHome cat={cat} top={insets.top} onSignUp={() => setLogin(true)} />)}</WithCatalog>
      </ScrollView>
      <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, height: insets.top, backgroundColor: color.carbon }} />
      {login && <LoginSheet reason="註冊後可以預約課程、揪朋友、報名球局" onClose={() => setLogin(false)} />}
    </View>
  );
}

function MemberHome({ cat, top }: { cat: Catalog; top: number }) {
  const { setFilters, booking } = useSession();
  const fit = cat.coaches.filter((c) => ME.level >= c.levelMin && ME.level <= c.levelMax);
  const rail = [...fit, ...cat.coaches.filter((c) => !fit.includes(c))];
  // the soonest open sessions across coaches whose level range fits me
  const soon = bookingDays().flatMap((d) => fit.flatMap((c) => slotsFor(c, d).filter(([, left]) => left > 0).map(([t, left]) => ({ c, d, t, left, plan: c.profile.plans[0] })))).slice(0, 4);
  const want = (t: LessonType) => { setFilters((p) => ({ ...p, type: t, level: ME.level })); router.push("/coaches"); };
  return (
    <>
      <View style={[s.hero, { paddingTop: top + 12 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <PkMark />
          <View style={s.loc}><Icon name="pin" size={13} tint="#fff" /><Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{MY_AREAS}</Text></View>
        </View>
        <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 24 }}>嗨，{ME.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}><Text style={{ color: color.onCarbonMuted, fontSize: 15 }}>你是 </Text><Num style={s.hl}>{LEVELS[ME.level]}</Num><Text style={{ color: color.onCarbonMuted, fontSize: 15 }}>，想上什麼課？</Text></View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          {TYPES.map(([t, ic]) => (
            <Pressable key={t} onPress={() => want(t)} style={({ pressed }) => [s.want, pressed && { backgroundColor: "rgba(255,255,255,.14)" }]}>
              <Icon name={ic} size={20} tint={color.accent} /><Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ padding: 16, gap: 24 }}>
        {booking?.slot && (
          <Link href="/me/booking" asChild>
            <Pressable style={s.next}>
              <Icon name="cal" size={22} />
              <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "800" }}>你的下一堂課</Text><Text style={{ fontSize: 13, color: color.muted }}>點進去看進度</Text></View>
              <Icon name="right" size={16} tint={color.muted} />
            </Pressable>
          </Link>
        )}

        <View style={{ gap: 12 }}>
          <SecHead en="Coaches" title="適合你的教練" more="看全部" href="/coaches" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }} style={{ marginHorizontal: -16 }}>
            {rail.map((c) => <CoachMini key={c.id} coach={c} />)}
          </ScrollView>
        </View>

        {soon.length > 0 && (
          <View style={{ gap: 12 }}>
            <SecHead en="Book soon" title="近期可約" more="更多時段" href="/coaches" />
            <View style={s.card}>
              {soon.map(({ c, d, t, left, plan }, i) => (
                <Link key={c.id + d.key + t} href={{ pathname: "/coaches/[id]/book", params: { id: c.id, plan: plan.id, day: d.key, slot: t } }} asChild>
                  <Pressable style={StyleSheet.flatten([s.row, i === soon.length - 1 && { borderBottomWidth: 0 }])}>
                    <View style={{ width: 64 }}><Num style={{ fontSize: 22 }}>{t}</Num><Text style={{ fontSize: 11, color: color.muted }}>{d.date} 週{d.weekday}</Text></View>
                    <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "800" }}>{plan.name}</Text><Text style={{ fontSize: 13, color: color.muted }}>{c.name}・剩 {left} 位</Text></View>
                    <Num style={{ fontSize: 19 }}>{money(plan.price)}</Num>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}

        <Pressable onPress={() => { setFilters((p) => ({ ...p, type: "小班" })); router.push("/coaches"); }} style={s.friends}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.en}>BRING FRIENDS</Text>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>揪朋友一起上課</Text>
            <Text style={{ fontSize: 14, color: color.n700, lineHeight: 20 }}>選一堂小班課，找朋友一起上，各自用自己的帳號加入、各自付款，每人比一對一便宜。</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 3 }}>
            {[color.accent, color.n800, null, null].map((bg, i) => <View key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: bg ?? "transparent", borderWidth: bg ? 0 : 1.5, borderStyle: "dashed", borderColor: color.n500 }} />)}
          </View>
        </Pressable>

        <More cat={cat} />
      </View>
    </>
  );
}

const STEPS: [string, string][] = [
  ["用 LINE 登入", "免費，第一次登入就自動建立帳號，不用填表。"],
  ["選教練與時段", "每位教練都用同一種格式列出價格、程度和認證，選好時段直接送出。"],
  ["教練確認後付款上課", "教練確認才需要付款，LINE Pay、轉帳或現場付都可以。"],
];

/** Visitor landing (website: GuestHome): what PIKYOO is, the three ways in, featured coaches, how it works, sign up. */
function GuestHome({ cat, top, onSignUp }: { cat: Catalog; top: number; onSignUp: () => void }) {
  const entries: [Href, string, string, IconName][] = [
    ["/coaches", "找教練", `${cat.coaches.length} 位教練，價格、程度、認證一眼比較`, "cap"],
    ["/games", "找球局", `這兩週 ${cat.games.length} 場球局，照程度找人一起打`, "users"],
    ["/courts", "找球場", `雙北 ${cat.courts.length} 個球場與預約方式`, "pin"],
  ];
  return (
    <>
      <View style={[s.hero, { paddingTop: top + 12, paddingBottom: 28 }]}>
        <PkMark />
        <Text style={[s.en, { color: color.accent, marginTop: 24 }]}>PICKLEBALL IN TAIPEI</Text>
        <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800", lineHeight: 42, marginTop: 6 }}>雙北匹克球，{"\n"}從第一堂課開始。</Text>
        <Text style={{ color: color.onCarbonMuted, fontSize: 15, lineHeight: 23, marginTop: 10 }}>比較教練的價格、程度和認證，選好時段直接預約。也能揪朋友一起上，或找程度差不多的球局。</Text>
        <View style={{ gap: 10, marginTop: 20 }}>
          <Btn kind="primary" label="用 LINE 免費註冊" onPress={onSignUp} />
          <Btn kind="onCarbon" label="先看看教練" onPress={() => router.push("/coaches")} />
        </View>
      </View>
      <View style={{ padding: 16, gap: 24 }}>
        <View style={{ gap: 10 }}>
          {entries.map(([href, t, sub, ic]) => (
            <Link key={t} href={href} asChild>
              <Pressable style={s.entry}>
                <View style={s.entryIc}><Icon name={ic} size={22} /></View>
                <View style={{ flex: 1 }}><Text style={{ fontSize: 17, fontWeight: "800" }}>{t}</Text><Text style={{ fontSize: 14, color: color.muted }}>{sub}</Text></View>
                <Icon name="right" size={16} tint={color.muted} />
              </Pressable>
            </Link>
          ))}
        </View>
        <View style={{ gap: 12 }}>
          <SecHead en="Coaches" title="精選教練" more="看全部" href="/coaches" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }} style={{ marginHorizontal: -16 }}>
            {cat.coaches.map((c) => <CoachMini key={c.id} coach={c} />)}
          </ScrollView>
        </View>
        <View style={{ gap: 12 }}>
          <SecHead en="How it works" title="怎麼開始" />
          {STEPS.map(([t, d], i) => (
            <View key={t} style={{ flexDirection: "row", gap: 12 }}>
              <Num style={s.stepNo}>{i + 1}</Num>
              <View style={{ flex: 1, gap: 2 }}><Text style={{ fontSize: 16, fontWeight: "800" }}>{t}</Text><Text style={{ fontSize: 14, color: color.n700, lineHeight: 21 }}>{d}</Text></View>
            </View>
          ))}
        </View>
        <View style={[s.friends, { flexDirection: "column", alignItems: "stretch", gap: 12 }]}>
          <Text style={{ fontSize: 20, fontWeight: "800" }}>第一次打匹克球？</Text>
          <Text style={{ fontSize: 14, color: color.n700, lineHeight: 21 }}>註冊後做 3 分鐘程度自評，我們幫你找適合的體驗課與新手友善局。</Text>
          <Btn kind="primary" label="用 LINE 免費註冊" onPress={onSignUp} />
        </View>
        <More cat={cat} />
      </View>
    </>
  );
}

/** 也可以: games, courts, and the beginners' page (still on the website). */
function More({ cat }: { cat: Catalog }) {
  const row = (ic: IconName, t: string, sub: string, go: () => void, last?: boolean) => (
    <Pressable onPress={go} style={StyleSheet.flatten([s.row, last && { borderBottomWidth: 0 }])}>
      <Icon name={ic} size={20} /><View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "700" }}>{t}</Text><Text style={{ fontSize: 13, color: color.muted }}>{sub}</Text></View><Icon name="right" size={14} tint={color.muted} />
    </Pressable>
  );
  return (
    <View style={{ gap: 12 }}>
      <SecHead en="More" title="也可以" />
      <View style={s.card}>
        {row("users", "找球友打球", `這兩週 ${cat.games.length} 局，找一局程度差不多的來打`, () => router.push("/games"))}
        {row("pin", "找球場", "雙北球場與預約方式", () => router.push("/courts"))}
        {row("sprout", "第一次打匹克球？", "規則與程度自評（網站）", () => WebBrowser.openBrowserAsync("https://pikyoo.vercel.app/learn"), true)}
      </View>
    </View>
  );
}

function SecHead({ en, title, more, href }: { en: string; title: string; more?: string; href?: Href }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
      <View><Text style={s.en}>{en.toUpperCase()}</Text><Text style={{ fontSize: 24, fontWeight: "800" }}>{title}</Text></View>
      {more && href && <Link href={href} asChild><Pressable hitSlop={8}><Text style={{ fontSize: 14, fontWeight: "700", textDecorationLine: "underline" }}>{more}</Text></Pressable></Link>}
    </View>
  );
}

const s = StyleSheet.create({
  hero: { backgroundColor: color.carbon, paddingHorizontal: 16, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  loc: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "rgba(255,255,255,.25)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  hl: { backgroundColor: color.accent, color: color.text, fontSize: 16, paddingHorizontal: 6, borderRadius: 4, overflow: "hidden" },
  want: { flex: 1, alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(255,255,255,.18)", backgroundColor: "rgba(255,255,255,.06)" },
  next: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: color.text, padding: 14 },
  en: { fontFamily: "BarlowCondensed_700Bold", fontSize: 12, letterSpacing: 1.5, color: color.muted },
  card: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.n100 },
  friends: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.accentSoft, borderWidth: 1.5, borderColor: color.accent700, borderRadius: radius.md, padding: 16 },
  entry: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 14 },
  entryIc: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.accent, alignItems: "center", justifyContent: "center" },
  stepNo: { width: 28, height: 28, borderRadius: 14, overflow: "hidden", textAlign: "center", lineHeight: 28, fontSize: 17, backgroundColor: color.accent },
});
