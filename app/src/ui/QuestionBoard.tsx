import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { contactHint, findContact } from "@pikyoo/core/contact";
import { QUESTION_STARTERS } from "@pikyoo/core/data/questions";
import type { Coach, Question } from "@pikyoo/core/types";
import { isLive } from "@/data/catalog";
import { usePublicQuestions, useSession } from "@/data/session";
import { Chip } from "./badges";
import { Btn } from "./Btn";
import { Icon } from "./Icon";
import { Sheet } from "./Sheet";
import { color, radius } from "./theme";
import { toast } from "./Toast";

const SHOWN = 3;

/** F3-11 問與答 (website: QuestionBoard): public Q&A in place of "ask on LINE", so the conversation stays in PIKYOO. */
export function QuestionBoard({ coach: c, onAsk }: { coach: Coach; onAsk: () => void }) {
  const qs = usePublicQuestions(c.id);
  const [all, setAll] = useState(false);
  const list = [...qs].reverse().sort((a, b) => Number(!!a.answer) - Number(!!b.answer));
  return (
    <View style={{ gap: 10 }}>
      {list.length ? (all ? list : list.slice(0, SHOWN)).map((q) => <QaItem key={q.id} q={q} coachName={c.name} />)
        : <Text style={{ color: color.muted, fontSize: 15 }}>還沒有人發問，上課前想確認的事都可以先問 {c.name}。</Text>}
      {!all && list.length > SHOWN && <Pressable onPress={() => setAll(true)}><Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>看全部 {list.length} 則</Text></Pressable>}
      <Btn icon="msg" label={`問 ${c.name} 問題`} onPress={onAsk} lg={false} style={{ borderRadius: 999, minHeight: 46 }} />
      <Text style={{ fontSize: 12, color: color.muted }}>問題和教練的回覆會公開在這一頁，其他學生也看得到。</Text>
    </View>
  );
}

function QaItem({ q, coachName }: { q: Question; coachName: string }) {
  return (
    <View style={s.item}>
      <Row mark="問" text={q.text} meta={[q.mine ? "你" : q.name, q.level, q.askedAt].filter(Boolean).join("・")} />
      {q.answer ? <Row mark="答" text={q.answer.text} meta={`${coachName}・${q.answer.at}`} answer />
        : <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}><Icon name="clock" size={13} tint={color.muted} /><Text style={{ flex: 1, fontSize: 13, color: color.muted }}>等 {coachName} 回覆，回覆後會通知你。只有你看得到這則。</Text></View>}
    </View>
  );
}

function Row({ mark, text, meta, answer }: { mark: string; text: string; meta: string; answer?: boolean }) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Text style={[s.mark, answer && { backgroundColor: color.accent }]}>{mark}</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, lineHeight: 22, color: color.text }}>{text}</Text>
        <Text style={{ fontSize: 12, color: color.muted }}>{meta}</Text>
      </View>
    </View>
  );
}

/** Ask the coach (website: AskSheet). Phone numbers, LINE IDs and 「私訊我」 are refused, like the website and the database. */
export function AskSheet({ coach: c, onClose }: { coach: Coach; onClose: () => void }) {
  const { ask } = useSession();
  const [text, setText] = useState("");
  const hit = findContact(text);
  const ok = text.trim().length >= 4 && !hit;
  const send = () => {
    if (isLive) return toast("App 登入即將推出", "現在可以先在網站登入後發問");
    ask(c.id, text.trim());
    toast("已送出提問", `${c.name} 回覆後會通知你`);
    onClose();
  };
  return (
    <Sheet title={`問 ${c.name} 問題`} onClose={onClose}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {QUESTION_STARTERS.map((x) => <Chip key={x} onPress={() => setText(x)}>{x}</Chip>)}
      </View>
      <Text style={{ fontWeight: "700", marginTop: 4 }}>你的問題</Text>
      <TextInput value={text} onChangeText={setText} multiline placeholder="例：我打過羽球，第一堂適合上體驗課還是一對一？" placeholderTextColor={color.n500}
        style={[s.input, !!hit && { borderColor: "#B3261E" }]} />
      {hit ? <Text style={{ color: "#B3261E", fontSize: 13 }}>{contactHint(hit)}</Text> : <Text style={{ fontSize: 12, color: color.muted }}>會公開顯示在教練頁。{c.profile.reply}。</Text>}
      <Btn kind="primary" label="送出問題" disabled={!ok} onPress={send} />
    </Sheet>
  );
}

const s = StyleSheet.create({
  item: { gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.n100 },
  mark: { width: 24, height: 24, borderRadius: 12, overflow: "hidden", textAlign: "center", lineHeight: 24, fontSize: 13, fontWeight: "800", backgroundColor: color.n100 },
  input: { minHeight: 110, borderWidth: 1, borderColor: color.n300, borderRadius: radius.md, padding: 12, fontSize: 16, textAlignVertical: "top", color: color.text },
});
