import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { contactHint, findContact } from "@pikyoo/core/contact";
import { money } from "@pikyoo/core/format";
import type { BookingRequest, Question } from "@pikyoo/core/types";
import { useSession } from "@/data/session";
import { Num, Tag } from "./badges";
import { Btn } from "./Btn";
import { Avatar, c } from "./console";
import { Icon } from "./Icon";
import { Status } from "./Status";
import { color } from "./theme";

// The coach's inbox cards (website: RequestCard, AnswerCard), used on 待處理 and the calendar.

/** 確認／婉拒 a booking request, saying what the student gets (website: RequestCard). */
export function RequestCard({ r }: { r: BookingRequest }) {
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
export function AnswerCard({ q }: { q: Question }) {
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
