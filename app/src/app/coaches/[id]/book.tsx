import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PAY_HINT } from "@pikyoo/core/data/coaches";
import { slotKey, type BookingCalendar } from "@pikyoo/core/source/bookings";
import { money } from "@pikyoo/core/format";
import type { Booking, Coach } from "@pikyoo/core/types";
import { bookingTotal, loadCalendar } from "@/data/booking";
import { useCatalog } from "@/data/catalog";
import { useSession } from "@/data/session";
import { Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Icon } from "@/ui/Icon";
import { LoginSheet } from "@/ui/LoginSheet";
import { color, radius } from "@/ui/theme";

// F3-7 預約 (website: BookScreen): ① plan ② day + slot ③ headcount + note ④ pay method, sticky live total.
// 揪朋友一起上 stays on the demo website for now (PLAN D7), as on the live website.

export default function BookPage() {
  const { id, plan } = useLocalSearchParams<{ id: string; plan?: string }>();
  const coach = useCatalog().catalog?.coaches.find((x) => x.id === id);
  const [cal, setCal] = useState<BookingCalendar | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (coach) loadCalendar(coach).then(setCal, (e: Error) => setErr(e.message)); }, [coach]);
  if (!coach) return null;
  if (!cal) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>{err ? <Text style={{ color: color.muted }}>讀不到時段，請稍後再試。</Text> : <ActivityIndicator />}</View>;
  return <BookForm c={coach} cal={cal} planId={plan} />;
}

function BookForm({ c, cal, planId }: { c: Coach; cal: BookingCalendar; planId?: string }) {
  const p = c.profile;
  const insets = useSafeAreaInsets();
  const { signedIn, setBooking } = useSession();
  const [login, setLogin] = useState(false);
  const slotsOf = (pid: string, dk: string) => cal.slots[slotKey(pid, dk)] ?? [];
  const [b, setB] = useState<Booking>(() => {
    const first = p.plans.find((x) => x.id === planId) ?? p.plans[0];
    const open = cal.days.find((d) => slotsOf(first.id, d.key).some((s) => s[1] > 0));
    return { coachId: c.id, planId: first.id, dayKey: open?.key ?? cal.days[0]?.key ?? "", slot: null, headcount: 1, note: "", pay: p.pay[0], status: "pending" };
  });
  const set = (patch: Partial<Booking>) => setB((prev) => ({ ...prev, ...patch }));
  const { plan, total } = bookingTotal(b, p);
  const perHead = plan.unit === "/人";
  const day = cal.days.find((d) => d.key === b.dayKey) ?? cal.days[0];
  const slots = day ? slotsOf(b.planId, day.key) : [];
  const when = b.slot && day ? `${day.date}（${day.weekday}）${b.slot}` : null;
  const submit = () => {
    if (!signedIn) return setLogin(true);
    setBooking({ ...b, status: "pending" });
    router.replace("/me/booking");
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <Stack.Screen options={{ title: `預約 ${c.name}` }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 + insets.bottom, gap: 4 }}>
        <Step n={1} title="選課程">
          {p.plans.map((x) => (
            <Radio key={x.id} on={x.id === b.planId} onPress={() => set({ planId: x.id, slot: slotsOf(x.id, b.dayKey).some(([t, left]) => t === b.slot && left > 0) ? b.slot : null })}>
              <View style={{ flex: 1 }}><Text style={s.b}>{x.name}</Text><Text style={s.small}>{x.durationMin} 分・{x.size}</Text></View>
              <Text><Num style={{ fontSize: 19 }}>{money(x.price)}</Num><Text style={s.small}>{x.unit}</Text></Text>
            </Radio>
          ))}
        </Step>

        <Step n={2} title="選時段">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {cal.days.map((d) => {
              const open = slotsOf(b.planId, d.key).filter((x) => x[1] > 0).length;
              const on = d.key === b.dayKey;
              return (
                <Pressable key={d.key} disabled={!open} onPress={() => set({ dayKey: d.key, slot: null })} style={[s.dcell, on && { backgroundColor: color.text, borderColor: color.text }, !open && { opacity: 0.35 }]}>
                  <Text style={{ fontSize: 12, color: on ? color.onCarbonMuted : color.muted }}>週{d.weekday}</Text>
                  <Num style={{ fontSize: 22, color: on ? "#fff" : color.text }}>{d.date.split("/")[1]}</Num>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: open ? color.accent700 : "transparent" }} />
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {slots.length ? slots.map(([t, left]) => {
              const on = b.slot === t;
              return (
                <Pressable key={t} disabled={!left} onPress={() => set({ slot: t })} style={[s.slot, on && { backgroundColor: color.accent, borderColor: color.text }, !left && { opacity: 0.4 }]}>
                  <Num style={{ fontSize: 19 }}>{t}</Num><Text style={s.small}>{left ? `剩 ${left} 位` : "額滿"}</Text>
                </Pressable>
              );
            }) : <Text style={{ color: color.muted }}>這天沒有開放時段</Text>}
          </View>
          <Text style={s.fine}>{p.venues[0]?.name}・時段由教練開放，選了之後送出申請</Text>
        </Step>

        <Step n={3} title="人數與備註">
          {perHead && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={s.b}>人數</Text>
              <View style={s.stepper}>
                <Pressable onPress={() => set({ headcount: Math.max(1, b.headcount - 1) })} accessibilityLabel="減少" style={s.stepBtn}><Icon name="minus" size={16} /></Pressable>
                <Num style={{ fontSize: 20, minWidth: 28, textAlign: "center" }}>{b.headcount}</Num>
                <Pressable onPress={() => set({ headcount: Math.min(4, b.headcount + 1) })} accessibilityLabel="增加" style={s.stepBtn}><Icon name="plus" size={16} /></Pressable>
              </View>
            </View>
          )}
          <TextInput value={b.note} onChangeText={(note) => set({ note })} multiline placeholder="例：第一次打、之前打過網球、想加強發球" placeholderTextColor={color.n500} style={s.input} accessibilityLabel="備註" />
        </Step>

        <Step n={4} title="付款方式" last>
          <Text style={s.fine}>教練確認後才需要付款，現在不會扣款。</Text>
          {p.pay.map((x) => (
            <Radio key={x} on={b.pay === x} onPress={() => set({ pay: x })}>
              <View style={{ flex: 1 }}><Text style={s.b}>{x}</Text><Text style={s.small}>{PAY_HINT[x]}</Text></View>
            </Radio>
          ))}
          <Text style={s.fine}>{p.policy}</Text>
        </Step>
      </ScrollView>

      <View style={[s.cta, { paddingBottom: insets.bottom + 10 }]}>
        <View style={{ flex: 1 }}>
          <Num style={{ fontSize: 26, color: "#fff" }}>{money(total)}</Num>
          <Text style={{ color: color.onCarbonMuted, fontSize: 13 }} numberOfLines={1}>{when ? `${when}・${plan.name}` : "請選時段"}</Text>
        </View>
        <Btn kind="primary" label={!signedIn ? "登入後送出" : "送出預約"} disabled={!b.slot} onPress={submit} />
      </View>
      {login && <LoginSheet reason={`登入後就能送出 ${c.name} 的預約`} webPath={`/coaches/${c.id}/book?plan=${b.planId}`} onClose={() => setLogin(false)} />}
    </View>
  );
}

function Step({ n, title, children, last }: { n: number; title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[{ paddingVertical: 16, gap: 10 }, !last && { borderBottomWidth: 1, borderBottomColor: color.line }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Num style={s.stepNo}>{n}</Num><Text style={{ fontSize: 19, fontWeight: "800" }}>{title}</Text></View>
      {children}
    </View>
  );
}
function Radio({ on, onPress, children }: { on: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }} style={[s.radio, on && { borderColor: color.text, backgroundColor: color.accentSoft }]}>
      <View style={[s.dot, on && { borderColor: color.text, borderWidth: 6 }]} />
      {children}
    </Pressable>
  );
}

const s = StyleSheet.create({
  b: { fontSize: 16, fontWeight: "700", color: color.text },
  small: { fontSize: 13, color: color.muted },
  fine: { fontSize: 12, color: color.muted, lineHeight: 18 },
  stepNo: { width: 26, height: 26, borderRadius: 13, overflow: "hidden", textAlign: "center", lineHeight: 26, fontSize: 16, backgroundColor: color.accent },
  radio: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.surface, borderWidth: 1.5, borderColor: color.line, borderRadius: radius.md, padding: 14 },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: color.n300, backgroundColor: color.surface },
  dcell: { width: 54, alignItems: "center", gap: 2, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1.5, borderColor: color.line, backgroundColor: color.surface },
  slot: { minWidth: 96, alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1.5, borderColor: color.n300, backgroundColor: color.surface },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: color.n300, borderRadius: 999, padding: 4 },
  stepBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: color.n100 },
  input: { minHeight: 90, borderWidth: 1, borderColor: color.n300, borderRadius: radius.md, padding: 12, fontSize: 16, textAlignVertical: "top", backgroundColor: color.surface, color: color.text },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.carbon, paddingHorizontal: 16, paddingTop: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});
