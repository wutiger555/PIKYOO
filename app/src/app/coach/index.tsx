import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { contactHint, findContact } from "@pikyoo/core/contact";
import { TODAY_AGENDA } from "@pikyoo/core/data/coaches";
import { money } from "@pikyoo/core/format";
import type { BookingRequest, Question } from "@pikyoo/core/types";
import { useSession } from "@/data/session";
import { Num, Tag } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Avatar, c, ConsolePage, RolePill, SecHead, ToStudent } from "@/ui/console";
import { Icon } from "@/ui/Icon";
import { Status } from "@/ui/Status";
import { color } from "@/ui/theme";

/** F5-5 教練首頁「今天」 (website: CoachTodayScreen): requests to confirm, questions to answer, today's lessons. */
export default function CoachToday() {
  const { requests, payments, questions, myCoach } = useSession();
  const pend = requests.filter((r) => r.status === "pending");
  const ask = questions.filter((q) => q.coachId === myCoach?.id && !q.answer);
  const due = payments.filter((p) => p.status !== "paid").reduce((a, p) => a + p.amount, 0);
  return (
    <ConsolePage hero={
      <>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <RolePill />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <ToStudent />
            <Pressable onPress={() => router.push("/me/notifications")} accessibilityLabel="通知"><Icon name="bell" size={20} tint="#fff" /></Pressable>
          </View>
        </View>
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 20 }}>早安，{myCoach?.name.split(" ")[0]}</Text>
        <Text style={{ color: color.onCarbonMuted, fontSize: 15, marginTop: 2 }}>
          今天 2 堂課，<Text style={{ backgroundColor: color.accent, color: color.text, fontWeight: "800" }}> {pend.length} 筆預約 </Text>等你確認{ask.length > 0 ? `、${ask.length} 則提問待回覆` : ""}
        </Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,.14)" }}>
          <Stat n={String(pend.length)} label="待確認" />
          <Stat n="6" label="本週課" />
          <Stat n={money(due)} label="待收款" onPress={() => router.push("/coach/payments")} last />
        </View>
      </>
    }>
      <SecHead en="Requests" title="待確認預約" right={<Text style={{ fontSize: 13, color: color.muted }}>確認後自動送付款資訊</Text>} />
      {requests.map((r) => <RequestCard key={r.id} r={r} />)}

      <SecHead en="Questions" title="學生提問" right={myCoach && <Pressable onPress={() => router.push(`/coaches/${myCoach.id}`)}><Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>看教練頁</Text></Pressable>} />
      {ask.length ? ask.map((q) => <AnswerCard key={q.id} q={q} />) : <Text style={c.hint}>沒有待回覆的提問。回覆會公開在教練頁，其他學生也看得到。</Text>}

      <SecHead en="Today" title="今天的課" />
      <View style={[c.card, { gap: 0, paddingVertical: 4 }]}>
        {TODAY_AGENDA.map((a, i) => (
          <View key={a.start} style={[{ flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 12 }, i > 0 && { borderTopWidth: 1, borderTopColor: color.n100 }]}>
            <View style={{ width: 52 }}><Num style={{ fontSize: 20 }}>{a.start}</Num><Num style={{ fontSize: 13, color: color.muted }}>{a.end}</Num></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: "800" }}>{a.title}</Text>
              <Text style={{ fontSize: 13, color: color.muted }}>{a.who}</Text>
              <Text style={{ fontSize: 13, color: color.muted }}>{a.where}</Text>
            </View>
            <Status tone={a.tone}>{a.status}</Status>
          </View>
        ))}
      </View>
    </ConsolePage>
  );
}

function Stat({ n, label, onPress, last }: { n: string; label: string; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={[{ flex: 1, gap: 2 }, !last && { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,.14)" }]}>
      <Num style={{ fontSize: 24, color: "#fff" }}>{n}</Num>
      <Text style={{ fontSize: 12, color: color.onCarbonMuted }}>{label}{onPress ? " ›" : ""}</Text>
    </Pressable>
  );
}

/** 確認／婉拒 a booking request, saying what the student gets (website: RequestCard). */
function RequestCard({ r }: { r: BookingRequest }) {
  const { decide } = useSession();
  const done = r.status !== "pending";
  return (
    <View style={[c.card, done && { opacity: 0.75 }, r.id === "mine" && !done && { borderColor: color.accent700, borderWidth: 1.5 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Avatar t={r.initial} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Text style={{ fontSize: 16, fontWeight: "800" }}>{r.name}</Text>{r.id === "mine" && <Tag tone="accent">剛剛</Tag>}</View>
          <Text style={{ fontSize: 13, color: color.muted }}>{r.level}・{r.firstTime ? "第一次上你的課" : `上過 ${r.times} 次`}</Text>
        </View>
        <Num style={{ fontSize: 22 }}>{money(r.amount)}</Num>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="cal" size={14} tint={color.muted} /><Text style={{ fontSize: 14 }}>{r.when}・{r.plan}</Text></View>
      {!!r.note && <Text style={{ fontSize: 14, color: color.n700, backgroundColor: color.bg, padding: 10, borderRadius: 8, overflow: "hidden" }}>「{r.note}」</Text>}
      {r.status === "pending" ? (
        <>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Btn label="婉拒" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => Alert.alert(`婉拒 ${r.name} 的預約？`, "會通知學生並推薦其他時段", [{ text: "先不要", style: "cancel" }, { text: "婉拒", style: "destructive", onPress: () => decide(r.id, false) }])} />
            <Btn kind="primary" label="確認預約" lg={false} style={{ flex: 2, borderRadius: 999 }} onPress={() => { decide(r.id, true); Alert.alert("已確認", `已用 LINE 傳 ${r.pay} 付款資訊給 ${r.name}`); }} />
          </View>
          <Text style={c.hint}>{r.expiresIn}內未處理會自動取消</Text>
        </>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {r.status === "ok" ? <><Status tone="open">已確認</Status><Text style={c.hint}>已通知學生並送出 {r.pay} 付款資訊</Text></> : <Status tone="ended">已婉拒</Status>}
        </View>
      )}
    </View>
  );
}

/** Reply to a question; the reply goes public on the coach page (website: AnswerCard). */
function AnswerCard({ q }: { q: Question }) {
  const { answer } = useSession();
  const [text, setText] = useState("");
  const hit = findContact(text);
  return (
    <View style={c.card}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Avatar t={q.name.slice(0, 1)} size={34} />
        <View style={{ flex: 1 }}><Text style={{ fontWeight: "800" }}>{q.name}</Text><Text style={{ fontSize: 13, color: color.muted }}>{[q.level, q.askedAt].filter(Boolean).join("・")}</Text></View>
      </View>
      <Text style={{ fontSize: 15, lineHeight: 22 }}>「{q.text}」</Text>
      <TextInput value={text} onChangeText={setText} multiline placeholder="回覆會公開在你的教練頁" placeholderTextColor={color.n500} style={[c.input, { minHeight: 80, textAlignVertical: "top" }, !!hit && { borderColor: "#B3261E" }]} />
      {hit && <Text style={{ color: "#B3261E", fontSize: 13 }}>{contactHint(hit)}</Text>}
      <Btn kind="primary" label="公開回覆" lg={false} disabled={text.trim().length < 2 || !!hit} style={{ alignSelf: "flex-end", borderRadius: 999 }}
        onPress={() => { answer(q.id, text.trim()); Alert.alert("已回覆", `會公開在你的教練頁並通知 ${q.name}`); }} />
    </View>
  );
}
