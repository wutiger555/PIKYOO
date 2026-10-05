import { router } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { useSession } from "@/data/session";
import { c, SecHead } from "@/ui/console";
import { AnswerCard, RequestCard } from "@/ui/coachCards";
import { color } from "@/ui/theme";

/** 待處理: booking requests to confirm and questions to answer (website: the top of CoachTodayScreen). */
export default function CoachInbox() {
  const { requests, questions, myCoach } = useSession();
  const pend = requests.filter((r) => r.status === "pending");
  const done = requests.filter((r) => r.status !== "pending");
  const ask = questions.filter((q) => q.coachId === myCoach?.id && !q.answer);
  return (
    <ScrollView style={{ backgroundColor: color.bg }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 48 }}>
      <SecHead en="Requests" title={`待確認預約 ${pend.length}`} right={<Text style={c.hint}>確認後自動送付款資訊</Text>} />
      {pend.length ? pend.map((r) => <RequestCard key={r.id} r={r} />) : <Text style={c.hint}>沒有待確認的預約。</Text>}
      <SecHead en="Questions" title={`學生提問 ${ask.length}`} right={myCoach && <Pressable onPress={() => router.push(`/coaches/${myCoach.id}`)}><Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>看教練頁</Text></Pressable>} />
      {ask.length ? ask.map((q) => <AnswerCard key={q.id} q={q} />) : <Text style={c.hint}>沒有待回覆的提問。回覆會公開在教練頁，其他學生也看得到。</Text>}
      {done.length > 0 && <SecHead en="Done" title="已處理" />}
      {done.map((r) => <RequestCard key={r.id} r={r} />)}
    </ScrollView>
  );
}
