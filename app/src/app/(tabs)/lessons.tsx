import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { bookingDays } from "@pikyoo/core/data/coaches";
import { demoDate } from "@pikyoo/core/data/today";
import { money } from "@pikyoo/core/format";
import { bookingTotal } from "@/data/booking";
import { isLive } from "@/data/catalog";
import { useSession } from "@/data/session";
import { Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Icon } from "@/ui/Icon";
import { LoginSheet } from "@/ui/LoginSheet";
import { Page, WithCatalog } from "@/ui/Page";
import { Status } from "@/ui/Status";
import { color, radius } from "@/ui/theme";

const BOOKING_STATE = { pending: ["待教練確認", "almost"], confirmed: ["待付款", "info"], reported: ["等教練對帳", "info"], paid: ["已付款", "open"] } as const;

/** 我的課 (website: MyLessonsScreen): 即將上課 and 上過的. Live bookings need sign-in (step 17); 揪團 stays on the demo website (PLAN D7). */
export default function Lessons() {
  const { booking: b, signedIn } = useSession();
  const [tab, setTab] = useState<"next" | "done">("next");
  const [login, setLogin] = useState(false);
  return (
    <Page title="我的課">
      {(!isLive || signedIn) && <View style={s.seg}>
        {([["next", "即將上課"], ["done", "上過的"]] as const).map(([k, l]) => (
          <Pressable key={k} onPress={() => setTab(k)} style={[s.segOpt, tab === k && s.segOn]}><Text style={{ fontWeight: "700", fontSize: 15 }}>{l}</Text></Pressable>
        ))}
      </View>}
      {isLive && !signedIn ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 18, fontWeight: "800" }}>登入後就看得到你的課</Text>
          <Text style={{ color: color.muted, textAlign: "center", lineHeight: 21 }}>預約、付款狀態、上課提醒都會在這裡。</Text>
          <Btn kind="primary" label="用 LINE 登入" onPress={() => setLogin(true)} />
        </View>
      ) : (
        <WithCatalog>{(cat) => {
          if (tab === "done") {
            const mia = cat.coaches.find((c) => c.id === "mia");
            return mia ? (
              <View style={s.row}>
                <View style={{ flex: 1, gap: 4 }}><Text style={s.title}>新手體驗課</Text><Text style={s.muted}>{mia.name}・{demoDate(-9)}10:00</Text><Status tone="ended">已完成</Status></View>
                <Btn label="給評價" lg={false} onPress={() => {}} disabled />
              </View>
            ) : <Empty />;
          }
          const c = b?.slot ? cat.coaches.find((x) => x.id === b.coachId) : null;
          const plan = c?.profile.plans.find((p) => p.id === b?.planId);
          const d = b && bookingDays().find((x) => x.key === b.dayKey);
          if (!b || !c || !plan || !d) return <Empty />;
          return (
            <Link href="/me/booking" asChild>
              <Pressable style={s.row}>
                <View style={{ width: 52 }}><Num style={{ fontSize: 20 }}>{d.date}</Num><Text style={s.muted}>週{d.weekday}</Text><Num style={{ fontSize: 16 }}>{b.slot}</Num></View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={s.title}>{plan.name}</Text>
                  <Text style={s.muted}>{c.name}・{c.profile.venues[0]?.name}・{money(bookingTotal(b, c.profile).total)}</Text>
                  <Status tone={BOOKING_STATE[b.status][1]}>{BOOKING_STATE[b.status][0]}</Status>
                </View>
                <Icon name="right" size={16} tint={color.muted} />
              </Pressable>
            </Link>
          );
        }}</WithCatalog>
      )}
      {login && <LoginSheet reason="登入後就看得到你的課" webPath="/me/lessons" onClose={() => setLogin(false)} />}
    </Page>
  );
}

function Empty() {
  return (
    <View style={s.empty}>
      <Text style={{ color: color.muted }}>還沒有預約的課</Text>
      <Link href="/coaches" asChild><Pressable style={s.cta}><Text style={{ fontWeight: "800", fontSize: 16 }}>找教練</Text></Pressable></Link>
    </View>
  );
}

const s = StyleSheet.create({
  seg: { flexDirection: "row", backgroundColor: color.n100, borderRadius: 999, padding: 4 },
  segOpt: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 999 },
  segOn: { backgroundColor: color.surface, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 14 },
  title: { fontSize: 17, fontWeight: "800", color: color.text },
  muted: { fontSize: 13, color: color.muted },
  empty: { alignItems: "center", gap: 10, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 24 },
  cta: { backgroundColor: color.accent, borderRadius: 999, paddingHorizontal: 22, paddingVertical: 12 },
});
