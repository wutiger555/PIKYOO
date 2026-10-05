import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { LEVELS } from "@pikyoo/core/format";
import type { Coach, CoachProfile, Level, PayMethod, PlayProfile } from "@pikyoo/core/types";
import { useCatalog } from "@/data/catalog";
import { useSession } from "@/data/session";
import { Chip, Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Photo } from "@/ui/CoachCard";
import { c, ConsolePage, SecHead } from "@/ui/console";
import { Choice, Field, Multi } from "@/ui/form";
import { Icon } from "@/ui/Icon";
import { color, radius } from "@/ui/theme";

// The website's option lists (web/src/features/console/CoachPageEditor.tsx).
const STRENGTHS = ["零基礎入門", "發球與接發球", "網前小球（dink）", "第三拍 drop", "重置球（reset）", "截擊", "快速對抽（hands battle）", "雙打站位與換位", "單打戰術", "比賽策略", "網球轉匹克球的揮拍修正", "親子課"];
const AUDIENCE = ["第一次拿拍", "打過網球、羽球想轉項", "想先上課再去打新手局", "2.5–3.0 想升級", "準備參加積分賽", "一個人想找球伴", "跟朋友一起來的小班", "親子一起學", "銀髮族", "英文授課需求"];
const AREAS = ["大安", "信義", "中山", "松山", "大同", "中正", "內湖", "南港", "士林", "北投", "文山", "萬華", "板橋", "新店", "中和", "永和"];
const PAYS: PayMethod[] = ["LINE Pay", "銀行轉帳", "現場付現"];
const REPLY = ["通常 1 小時內回覆", "通常 2 小時內回覆", "通常當天回覆", "通常 1–2 天內回覆"] as const;

/** Page-completeness checks (website: completeness). */
const completeness = (co: Coach): [string, boolean][] => {
  const p = co.profile;
  return [
    ["照片 3 張以上", p.photos.length >= 3], ["自我介紹 40 字以上", p.bio.length >= 40], ["匹克球檔案：擅長 2 項以上", p.play.strengths.length >= 2],
    ["適合誰 2 項以上", p.audience.length >= 2], ["課程方案", p.plans.length > 0], ["每週開放時段", Object.values(p.availability).some((x) => x && x.length)],
    ["授課地點", p.venues.length > 0], ["教學影片", false],
  ];
};

/** 我的教練頁（編輯） (website: CoachPageEditor): every section of the public page as a form; edits show on the page at once. */
export default function CoachProfileEditor() {
  const { myCoach: co, setMyCoach } = useSession();
  const { catalog } = useCatalog();
  if (!co) return null;
  const p = co.profile;
  const setC = (patch: Partial<Coach>) => setMyCoach((x) => ({ ...x, ...patch }));
  const setP = (patch: Partial<CoachProfile>) => setMyCoach((x) => ({ ...x, profile: { ...x.profile, ...patch } }));
  const setPlay = (patch: Partial<PlayProfile>) => setP({ play: { ...p.play, ...patch } });
  const checks = completeness(co);
  const pct = Math.round((checks.filter((x) => x[1]).length / checks.length) * 100);
  const preview = () => router.push(`/coaches/${co.id}`);
  const addPhotos = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: 6, quality: 0.8 });
    if (r.canceled) return;
    setP({ photos: [...p.photos, ...r.assets.map((a) => ({ src: a.uri, alt: `${co.name} 的上課照片`, caption: "" }))] });
  };
  const movePhoto = (i: number, to: number) => { const xs = [...p.photos]; const [ph] = xs.splice(i, 1); xs.splice(to, 0, ph); setP({ photos: xs }); };

  return (
    <ConsolePage title="我的教練頁" action={<Pressable onPress={preview} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="image" size={18} /><Text style={{ fontWeight: "700" }}>預覽</Text></Pressable>}>
      <View style={c.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1 }}><Text style={c.hint}>你的專屬連結，放在 IG／Threads 個人簡介</Text><Num style={{ fontSize: 20 }}>{p.slug}</Num></View>
          <Btn label="看公開頁" lg={false} onPress={preview} style={{ borderRadius: 999 }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}><Text style={{ fontWeight: "800", fontSize: 16 }}>頁面完整度</Text><Num style={{ fontSize: 22 }}>{pct}%</Num></View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: color.n100, overflow: "hidden" }}><View style={{ height: 6, width: `${pct}%`, backgroundColor: color.accent700 }} /></View>
        {checks.map(([t, ok]) => (
          <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: ok ? color.accent : color.n100, alignItems: "center", justifyContent: "center" }}>{ok && <Icon name="check" size={10} />}</View>
            <Text style={{ fontSize: 14, color: ok ? color.text : color.muted }}>{t}</Text>
          </View>
        ))}
      </View>

      <SecHead en="Photos" title="照片" />
      <Text style={c.hint}>第一張是封面。放真實的上課照片最能讓學生放心。</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {p.photos.map((ph, i) => (
          <View key={ph.src} style={{ width: 140, gap: 6 }}>
            <View>
              <Photo src={ph.src} alt={ph.alt} style={{ width: 140, height: 105, borderRadius: radius.md }} />
              {i === 0 && <Text style={{ position: "absolute", top: 6, left: 6, backgroundColor: color.accent, fontSize: 11, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: "hidden" }}>封面</Text>}
              <Pressable onPress={() => setP({ photos: p.photos.filter((_, j) => j !== i) })} accessibilityLabel="刪除照片" hitSlop={8}
                style={{ position: "absolute", top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(18,20,18,.6)", alignItems: "center", justifyContent: "center" }}>
                <Icon name="x" size={12} tint="#fff" />
              </Pressable>
            </View>
            {i > 0 ? <Pressable onPress={() => movePhoto(i, 0)}><Text style={{ fontSize: 13, fontWeight: "700", textDecorationLine: "underline" }}>設為封面</Text></Pressable> : <Text style={{ fontSize: 13, color: color.muted }}>目前的封面</Text>}
          </View>
        ))}
        <Pressable onPress={addPhotos} style={{ width: 140, height: 105, borderRadius: radius.md, borderWidth: 1.5, borderStyle: "dashed", borderColor: color.n500, alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Icon name="plus" size={22} /><Text style={{ fontWeight: "700" }}>上傳照片</Text>
        </Pressable>
      </ScrollView>

      <SecHead en="Basics" title="基本資料" />
      <View style={c.card}>
        <Field label="顯示名稱" value={co.name} max={20} onChange={(name) => setC({ name })} />
        <Field label="一句話介紹" value={co.tagline} max={40} hint="會出現在教練卡上" onChange={(tagline) => setC({ tagline })} />
        <Multi label="授課區域" values={co.areas} options={AREAS} onChange={(areas) => setC({ areas })} />
        <Choice label="授課程度（最低）" value={co.levelMin} options={[0, 1, 2, 3, 4, 5, 6] as Level[]} format={(l) => LEVELS[l]} onChange={(levelMin) => setC({ levelMin, levelMax: Math.max(levelMin, co.levelMax) as Level })} />
        <Choice label="授課程度（最高）" value={co.levelMax} options={[0, 1, 2, 3, 4, 5, 6] as Level[]} format={(l) => LEVELS[l]} onChange={(levelMax) => setC({ levelMax, levelMin: Math.min(levelMax, co.levelMin) as Level })} />
        <Choice label="回覆速度" value={p.reply as (typeof REPLY)[number]} options={REPLY} format={(x) => x.replace("通常 ", "")} onChange={(reply) => setP({ reply })} />
      </View>

      <SecHead en="About" title="關於我與上課方式" />
      <View style={c.card}>
        <Field label={`自我介紹（${p.bio.length} 字，建議 40–200 字）`} value={p.bio} multiline onChange={(bio) => setP({ bio })} placeholder="你的教學理念、第一堂課學生會學到什麼" />
        <Text style={c.label}>上課怎麼進行（3 步）</Text>
        {p.steps.map((st, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Num style={{ width: 24, height: 24, borderRadius: 12, overflow: "hidden", textAlign: "center", lineHeight: 24, backgroundColor: color.accent }}>{i + 1}</Num>
            <View style={{ flex: 1 }}><Field label="" value={st} onChange={(v) => setP({ steps: p.steps.map((x, j) => (j === i ? v : x)) })} /></View>
          </View>
        ))}
        <Multi label="適合誰" values={p.audience} options={AUDIENCE} onChange={(audience) => setP({ audience })} />
      </View>

      <SecHead en="Pickleball" title="匹克球檔案" />
      <View style={c.card}>
        <Text style={c.hint}>學生最常比較的資訊。DUPR 填了會標「自填」，送驗證後改成「已驗證」。</Text>
        <Choice label="慣用手" value={p.play.hand} options={["右手", "左手"] as const} onChange={(hand) => setPlay({ hand })} />
        <Choice label="打法" value={p.play.format} options={["雙打為主", "單打為主", "單打、雙打都教"]} onChange={(format) => setPlay({ format })} />
        <Field label="運動背景" value={p.play.background} placeholder="例：網球教練 8 年" onChange={(background) => setPlay({ background })} />
        <Multi label="擅長教（第一項會出現在教練卡）" values={p.play.strengths} options={STRENGTHS} onChange={(strengths) => setPlay({ strengths })} />
      </View>

      <SecHead en="Where" title="授課地點" />
      <View style={[c.card, { gap: 0, paddingVertical: 4 }]}>
        {(catalog?.courts ?? []).map((ct, i) => {
          const on = p.venues.some((v) => v.courtId === ct.id);
          return (
            <Pressable key={ct.id} onPress={() => setP({ venues: on ? p.venues.filter((v) => v.courtId !== ct.id) : [...p.venues, { name: ct.name, sub: `${ct.kind} ${ct.courtCount} 面・${ct.district}`, courtId: ct.id }] })}
              style={[{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }, i > 0 && { borderTopWidth: 1, borderTopColor: color.n100 }]}>
              <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: on ? color.text : color.n300, backgroundColor: on ? color.accent : color.surface, alignItems: "center", justifyContent: "center" }}>{on && <Icon name="check" size={12} />}</View>
              <View style={{ flex: 1 }}><Text style={{ fontWeight: "700", fontSize: 15 }}>{ct.name}</Text><Text style={{ fontSize: 13, color: color.muted }}>{ct.district}・{ct.kind} {ct.courtCount} 面</Text></View>
            </Pressable>
          );
        })}
      </View>

      <SecHead en="Payment" title="付款與取消" />
      <View style={c.card}>
        <Text style={c.label}>學生可以用的付款方式</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {PAYS.map((x) => <Chip key={x} on={p.pay.includes(x)} onPress={() => setP({ pay: p.pay.includes(x) ? p.pay.filter((y) => y !== x) : [...p.pay, x] })}>{x}</Chip>)}
        </View>
        <Field label="取消規則" value={p.policy} multiline onChange={(policy) => setP({ policy })} />
        <Text style={c.hint}>課程方案與每週時段在「課程時段」設定。</Text>
      </View>

      <Btn kind="primary" label="預覽學生看到的教練頁" onPress={preview} />
      <Pressable onPress={() => Alert.alert("證照送審", "請到網站的教練後台上傳證照，PIKYOO 查驗後會顯示「已驗證」。")}><Text style={[c.hint, { textAlign: "center", textDecorationLine: "underline" }]}>證照上傳與送審（網站）</Text></Pressable>
    </ConsolePage>
  );
}
