import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { money } from "@pikyoo/core/format";
import { useSession } from "@/data/session";
import { Btn } from "@/ui/Btn";
import { Avatar, c, SecHead } from "@/ui/console";
import { AnswerCard, RequestCard } from "@/ui/coachCards";
import { color } from "@/ui/theme";
import { toast } from "@/ui/Toast";

/** 待辦: everything that needs the coach, in one list — bookings to answer, students who say they've paid, questions.
 *  Each section shows only when it has something in it. */
export default function CoachInbox() {
  const { requests, questions, myCoach, payments, markPaid, rejectReport } = useSession();
  const pend = requests.filter((r) => r.status === "pending");
  const paid = payments.filter((p) => p.status === "reported");
  const ask = questions.filter((q) => q.coachId === myCoach?.id && !q.answer);
  const none = !pend.length && !paid.length && !ask.length;
  return (
    <ScrollView style={{ backgroundColor: color.bg }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
      {none && <Text style={[c.hint, { textAlign: "center", paddingVertical: 32 }]}>都處理完了。</Text>}
      {pend.length > 0 && <SecHead en="Bookings" title={`預約要回覆 ${pend.length}`} right={<Text style={c.hint}>確認後學生會拿到付款資訊</Text>} />}
      {pend.map((r) => <RequestCard key={r.id} r={r} />)}
      {paid.length > 0 && <SecHead en="Paid" title={`學生說付好了 ${paid.length}`} right={<Text style={c.hint}>看過銀行入帳再按</Text>} />}
      {paid.map((p) => (
        <View key={p.id} style={c.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Avatar t={p.initial} />
            <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "800" }}>{p.name}</Text><Text style={c.hint}>{p.what}・{p.via}{p.ref ? `・末五碼 ${p.ref}` : ""}</Text></View>
            <Text style={{ fontSize: 20, fontWeight: "800" }}>{money(p.amount)}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Btn label="還沒收到" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => { rejectReport(p.id); toast("已請學生再確認一次", `${p.name} 會收到通知`); }} />
            <Btn kind="primary" label="收到了" lg={false} style={{ flex: 2, borderRadius: 999 }} onPress={() => { markPaid(p.id); toast("已記下收到", "學生會收到通知"); }} />
          </View>
        </View>
      ))}
      {ask.length > 0 && <SecHead en="Questions" title={`學生提問 ${ask.length}`} right={myCoach && <Pressable onPress={() => router.push(`/coaches/${myCoach.id}`)}><Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>看教練頁</Text></Pressable>} />}
      {ask.map((q) => <AnswerCard key={q.id} q={q} />)}
    </ScrollView>
  );
}
