import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { bookingDays, slotsFor } from "@pikyoo/core/data/coaches";
import { levelText, money } from "@pikyoo/core/format";
import type { Coach, TimelineItem } from "@pikyoo/core/types";
import { useCatalog } from "@/data/catalog";
import { useSession } from "@/data/session";
import { Cred, LevelChip, Num, Rating, Tag } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Photo } from "@/ui/CoachCard";
import { Icon, type IconName } from "@/ui/Icon";
import { LoginSheet } from "@/ui/LoginSheet";
import { Page, WithCatalog } from "@/ui/Page";
import { AskSheet, QuestionBoard } from "@/ui/QuestionBoard";
import { color, radius } from "@/ui/theme";

// F3-4 教練頁 (website: CoachPageScreen / CoachPublicPage), section for section.

type SectionKey = "plans" | "about" | "play" | "time" | "exp" | "reviews" | "qa" | "where";
const SECTIONS: [SectionKey, string][] = [
  ["plans", "課程"], ["about", "關於我"], ["play", "匹克球檔案"], ["time", "可約時段"], ["exp", "經歷"], ["reviews", "評價"], ["qa", "問與答"], ["where", "地點"],
];
const TITLES: Record<SectionKey, string> = { plans: "課程與價目", about: "關於我", play: "匹克球檔案", time: "可約時段", exp: "經歷與資格", reviews: "學生評價", qa: "問與答", where: "授課地點" };
/** What a visitor sees before signing in (website: GUEST_SECTIONS); everything else sits behind the sign-in panel. */
const GUEST_SECTIONS: ReadonlySet<SectionKey> = new Set(["plans", "about"]);
const COVER_H = 430;
const TL_ICON: Record<TimelineItem["kind"], IconName> = { cert: "shield", trophy: "trophy", users: "users", cap: "cap" };

export default function CoachPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const coach = useCatalog().catalog?.coaches.find((x) => x.id === id);
  if (!coach) return <Page><WithCatalog>{() => <Text style={{ fontSize: 16 }}>找不到這位教練</Text>}</WithCatalog></Page>;
  return <CoachPublicPage c={coach} />;
}

function CoachPublicPage({ c }: { c: Coach }) {
  const p = c.profile;
  const insets = useSafeAreaInsets();
  const { signedIn } = useSession();
  const scroller = useRef<ScrollView>(null);
  const ys = useRef<Partial<Record<SectionKey | "locked", number>>>({});
  const [anchorY, setAnchorY] = useState(9999);
  const [stuck, setStuck] = useState(false);
  const [pastCover, setPastCover] = useState(false);
  const barH = insets.top + 52;
  const [asking, setAsking] = useState(false);
  const [login, setLogin] = useState<string | null>(null);
  const locked = !signedIn;
  const shows = (k: SectionKey) => !locked || GUEST_SECTIONS.has(k);
  const hidden = SECTIONS.filter(([k]) => !shows(k)).map(([k]) => TITLES[k]);
  const [cover, ...gallery] = p.photos;
  const groupPlan = p.plans.find((x) => x.group);
  const days = bookingDays().map((d) => ({ d, slots: slotsFor(c, d) })).filter((x) => x.slots.length);
  const jump = (k: SectionKey | "locked") => { const y = ys.current[k]; if (y != null) scroller.current?.scrollTo({ y: y - barH + 1, animated: true }); };
  const at = (k: SectionKey | "locked") => ({ onLayout: (e: { nativeEvent: { layout: { y: number } } }) => { ys.current[k] = e.nativeEvent.layout.y; } });
  const askLogin = () => setLogin(`登入後可以預約 ${c.name} 的課`);
  const book = (planId: string, friends?: boolean) => (locked ? askLogin() : router.push({ pathname: "/coaches/[id]/book", params: { id: c.id, plan: planId, ...(friends ? { with: "friends" } : {}) } }));
  const share = () => Share.share({ message: `${c.name}｜PIKYOO 匹友 https://pikyoo.vercel.app/coaches/${c.id}` });

  const anchors = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
      {SECTIONS.filter(([k]) => shows(k)).map(([k, l]) => <Pressable key={k} onPress={() => jump(k)} style={s.anchor}><Text style={s.anchorText}>{l}</Text></Pressable>)}
      {locked && <Pressable onPress={() => jump("locked")} style={[s.anchor, { flexDirection: "row", gap: 4, alignItems: "center" }]}><Icon name="lock" size={13} /><Text style={s.anchorText}>登入看更多</Text></Pressable>}
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <ScrollView ref={scroller} scrollEventThrottle={16} onScroll={(e) => { const y = e.nativeEvent.contentOffset.y; const on = y > anchorY - barH; if (on !== stuck) setStuck(on); const past = y > COVER_H - 24 - insets.top; if (past !== pastCover) setPastCover(past); }} contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}>
        {/* 0: cover */}
        <View style={{ height: COVER_H }}>
          {cover ? <Photo src={cover.src} alt={cover.alt} style={StyleSheet.absoluteFill} tagBottom={34} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: color.n200 }]} />}
          <View style={[s.coverBar, { top: insets.top + 6 }]}>
            <RoundBtn icon="left" label="返回" onPress={() => (router.canGoBack() ? router.back() : router.replace("/coaches"))} />
            <View style={{ flex: 1 }} />
            <RoundBtn icon="heart" label="收藏" onPress={() => Alert.alert("已收藏")} />
            <RoundBtn icon="share" label="分享" onPress={share} />
          </View>
        </View>

        {/* 1: carbon hero */}
        <View style={s.hero}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={s.heroName}>{c.name}</Text>
            {c.rating != null && <Rating rating={c.rating} reviews={c.reviews} onCarbon />}
          </View>
          <Text style={{ color: color.onCarbonMuted, fontSize: 14 }}>{c.areas.join("・")}・{p.reply}</Text>
          <Text style={{ color: "#fff", fontSize: 17, lineHeight: 25, marginTop: 6 }}>{c.tagline}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>{c.creds.map((x, i) => <Cred key={i} c={x} onCarbon />)}</View>
          <View style={s.stats}>
            <Stat n={String(c.years)} label="年教學" />
            <Stat n={String(c.students)} label="位學生" />
            <Stat n={levelText(c.levelMin, c.levelMax)} label="授課程度" last />
          </View>
        </View>

        {/* 2: gallery */}
        <View>
          {gallery.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, padding: 16, paddingBottom: 4 }}>
              {gallery.map((ph) => (
                <View key={ph.src} style={{ width: 220, gap: 6 }}>
                  <Photo src={ph.src} alt={ph.alt} style={{ width: 220, height: 150, borderRadius: radius.md }} />
                  {ph.caption && <Text style={{ fontSize: 13, color: color.muted }}>{ph.caption}</Text>}
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View onLayout={(e) => setAnchorY(e.nativeEvent.layout.y)} style={s.anchorsWrap}>{anchors}</View>

        <View style={{ paddingHorizontal: 16 }}>
          <Block {...at("plans")} title={TITLES.plans} right={<LevelChip min={c.levelMin} max={c.levelMax} />}>
            {p.plans.map((pl) => (
              <Pressable key={pl.id} onPress={() => book(pl.id)} style={({ pressed }) => [s.plan, pressed && { borderColor: color.text }]}>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Text style={{ fontSize: 17, fontWeight: "800" }}>{pl.name}</Text>{pl.tag && <Tag tone="accent">{pl.tag}</Tag>}</View>
                  <Text style={{ fontSize: 14, color: color.n700 }}>{pl.durationMin} 分鐘・{pl.size}</Text>
                  {!!pl.note && <Text style={{ fontSize: 13, color: color.muted }}>{pl.note}</Text>}
                  {pl.group && <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}><Icon name="users" size={13} /><Text style={{ fontSize: 13, fontWeight: "700" }}>可揪朋友一起上（{pl.group.min}–{pl.group.max} 人）</Text></View>}
                </View>
                <View style={{ alignItems: "flex-end" }}><Num style={{ fontSize: 24 }}>{money(pl.price)}</Num><Text style={{ fontSize: 12, color: color.muted }}>{pl.unit}</Text></View>
              </Pressable>
            ))}
            <KV k="取消"><Text style={s.body}>{p.policy}</Text></KV>
            <KV k="付款">
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{p.pay.map((x) => <Tag key={x}>{x}</Tag>)}</View>
              <Text style={{ fontSize: 13, color: color.muted, marginTop: 4 }}>教練確認預約後再付款</Text>
            </KV>
          </Block>

          {groupPlan?.group && (
            <View style={s.groupCta}>
              <Icon name="users" size={22} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 16, fontWeight: "800" }}>揪朋友一起上{groupPlan.name}</Text>
                <Text style={{ fontSize: 14, color: color.n700, lineHeight: 20 }}>找 {groupPlan.group.min - 1}–{groupPlan.group.max - 1} 位朋友，每人 {money(groupPlan.price)}，各自用自己的帳號加入、各自付款。</Text>
              </View>
              <Btn label="揪團" lg={false} onPress={() => book(groupPlan.id, true)} style={{ borderRadius: 999 }} />
            </View>
          )}

          <Block {...at("about")} title={TITLES.about}>
            <Text style={s.body}>{p.bio}</Text>
            <Text style={s.sub}>上課怎麼進行</Text>
            {p.steps.map((st, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <Num style={s.stepNo}>{i + 1}</Num><Text style={[s.body, { flex: 1 }]}>{st}</Text>
              </View>
            ))}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>{c.style.map((x) => <Tag key={x} tone="outline">{x}</Tag>)}</View>
            <Text style={s.sub}>適合誰</Text>
            {p.audience.map((a) => (
              <View key={a} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <View style={s.check}><Icon name="check" size={12} /></View><Text style={s.body}>{a}</Text>
              </View>
            ))}
          </Block>

          {shows("play") && (
            <Block {...at("play")} title={TITLES.play}>
              <View style={s.pb}>
                <PB k="球齡"><Text><Num style={{ fontSize: 22 }}>{Math.max(1, new Date().getFullYear() - Number(p.play.since))}</Num><Text style={s.body}> 年</Text><Text style={{ fontSize: 12, color: color.muted }}>（{p.play.since} 年開始）</Text></Text></PB>
                <PB k="慣用手"><Text style={s.pbV}>{p.play.hand}</Text></PB>
                <PB k="打法"><Text style={s.pbV}>{p.play.format}</Text></PB>
                <PB k="運動背景"><Text style={s.pbV}>{p.play.background}</Text></PB>
                <PB k="DUPR">{(() => { const d = c.creds.find((x) => x.issuer === "DUPR"); return d ? <Text><Num style={{ fontSize: 22 }}>{d.level}</Num><Text style={{ fontSize: 12, color: color.muted }}> {d.verified ? "已驗證" : "自填"}</Text></Text> : <Text style={{ color: color.muted }}>未提供</Text>; })()}</PB>
                <PB k="授課語言"><Text style={s.pbV}>{p.languages.join("・")}</Text></PB>
              </View>
              <Text style={s.sub}>擅長教</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{p.play.strengths.map((x) => <Tag key={x} tone="olive">{x}</Tag>)}</View>
            </Block>
          )}

          {shows("time") && (
            <Block {...at("time")} title={TITLES.time} right={<Text style={{ fontSize: 13, color: color.muted }}>未來 7 天</Text>}>
              {days.length ? days.map(({ d, slots }) => (
                <View key={d.key} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                  <View style={{ width: 44 }}><Num style={{ fontSize: 17 }}>{d.date}</Num><Text style={{ fontSize: 12, color: color.muted }}>週{d.weekday}</Text></View>
                  <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {slots.map(([t, left]) => (
                      <Pressable key={t} disabled={!left} onPress={() => book(p.plans[0].id)} style={[s.slot, !left && { backgroundColor: color.n100, borderColor: color.n100 }]}>
                        <Num style={{ fontSize: 16, color: left ? color.text : color.n500 }}>{t}</Num>
                        <Text style={{ fontSize: 12, color: color.muted }}>{left ? `剩 ${left}` : "額滿"}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )) : <Text style={{ color: color.muted }}>這週還沒開放時段，可以先在問與答問教練。</Text>}
            </Block>
          )}

          {shows("exp") && (
            <Block {...at("exp")} title={TITLES.exp}>
              {p.timeline.map((t) => (
                <View key={t.year + t.text} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                  <Num style={{ width: 40, fontSize: 16, color: color.muted }}>{t.year}</Num>
                  <View style={s.tlIcon}><Icon name={TL_ICON[t.kind]} size={15} /></View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={s.body}>{t.text}</Text>
                    {t.kind === "cert" && <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}><Icon name="check" size={11} tint={color.success} /><Text style={{ fontSize: 12, fontWeight: "700", color: color.success }}>PIKYOO 已查驗</Text></View>}
                  </View>
                </View>
              ))}
            </Block>
          )}

          {shows("reviews") && (
            <Block {...at("reviews")} title="學生怎麼說" right={c.rating != null ? <Rating rating={c.rating} reviews={c.reviews} big /> : undefined}>
              {p.quotes.length ? p.quotes.map((q) => (
                <View key={q.name} style={s.quote}>
                  <Text style={[s.body, { fontSize: 16 }]}>「{q.text}」</Text>
                  <Text style={{ fontSize: 13, color: color.muted }}>{q.name}・{q.level}</Text>
                </View>
              )) : <Text style={{ color: color.muted }}>還沒有評價，上完課的學生可以留下第一則。</Text>}
            </Block>
          )}

          {shows("qa") && <Block {...at("qa")} title={TITLES.qa}><QuestionBoard coach={c} onAsk={() => (locked ? setLogin(`登入後可以問 ${c.name} 問題`) : setAsking(true))} /></Block>}

          {shows("where") && (
            <Block {...at("where")} title={TITLES.where} last>
              {p.venues.map((v) => (
                <Pressable key={v.name} disabled={!v.courtId} onPress={() => router.push(`/courts/${v.courtId}`)} style={{ flexDirection: "row", gap: 10, alignItems: "center", paddingVertical: 6 }}>
                  <View style={s.tlIcon}><Icon name="pin" size={15} /></View>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "700" }}>{v.name}</Text><Text style={{ fontSize: 14, color: color.muted }}>{v.sub}</Text></View>
                  {v.courtId && <Icon name="right" size={14} tint={color.muted} />}
                </Pressable>
              ))}
            </Block>
          )}

          {locked && (
            <View {...at("locked")} style={s.lock}>
              <View style={s.lockIc}><Icon name="lock" size={22} /></View>
              <Text style={{ fontSize: 20, fontWeight: "800" }}>登入看完整教練頁</Text>
              <Text style={{ fontSize: 15, color: color.n700, textAlign: "center" }}>還有 {hidden.join("、")}。</Text>
              <Btn kind="primary" label="用 LINE 登入／註冊" onPress={() => setLogin(`登入後可以看 ${c.name} 的完整教練頁`)} style={{ alignSelf: "stretch" }} />
              <Text style={{ fontSize: 12, color: color.muted }}>免費，第一次登入就會自動建立帳號。</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* once the cover scrolls away: a solid bar under the status bar with back + the section links */}
      {pastCover && !stuck && <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: insets.top, backgroundColor: color.bg }} />}
      {stuck && (
        <View style={[s.topBar, { paddingTop: insets.top }]}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/coaches"))} accessibilityLabel="返回" style={{ paddingHorizontal: 12, paddingVertical: 10 }}><Icon name="left" size={20} /></Pressable>
          <View style={{ flex: 1 }}>{anchors}</View>
        </View>
      )}

      <View style={[s.cta, { paddingBottom: insets.bottom + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: color.onCarbonMuted, fontSize: 13 }}>{p.plans.length} 種課程</Text>
          <Text><Num style={{ fontSize: 26, color: "#fff" }}>{money(c.priceFrom)}</Num><Text style={{ color: color.onCarbonMuted, fontSize: 14 }}> 起</Text></Text>
        </View>
        {p.plans[0] && <Btn kind="primary" label={locked ? "登入後預約" : "選時段預約"} onPress={() => book(p.plans[0].id)} />}
      </View>

      {asking && <AskSheet coach={c} onClose={() => setAsking(false)} />}
      {login && <LoginSheet reason={login} webPath={`/coaches/${c.id}`} onClose={() => setLogin(null)} />}
    </View>
  );
}

function RoundBtn({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityLabel={label} style={s.round}><Icon name={icon} size={19} tint="#fff" /></Pressable>;
}
const Stat = ({ n, label, last }: { n: string; label: string; last?: boolean }) => (
  <View style={[{ flex: 1, gap: 2 }, !last && { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,.14)" }, { paddingLeft: 2 }]}>
    <Num style={{ fontSize: 26, color: "#fff" }}>{n}</Num><Text style={{ fontSize: 12, color: color.onCarbonMuted }}>{label}</Text>
  </View>
);
function Block({ title, right, children, last, onLayout }: { title: string; right?: React.ReactNode; children: React.ReactNode; last?: boolean; onLayout?: (e: { nativeEvent: { layout: { y: number } } }) => void }) {
  return (
    <View onLayout={onLayout} style={[{ paddingVertical: 20, gap: 12 }, !last && { borderBottomWidth: 1, borderBottomColor: color.line }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={{ fontSize: 22, fontWeight: "800" }}>{title}</Text>{right}</View>
      {children}
    </View>
  );
}
const KV = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <View style={{ flexDirection: "row", gap: 16 }}><Text style={{ width: 40, fontSize: 15, fontWeight: "700", color: color.n700 }}>{k}</Text><View style={{ flex: 1 }}>{children}</View></View>
);
const PB = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <View style={{ width: "50%", padding: 12, gap: 4, borderColor: color.line, borderBottomWidth: StyleSheet.hairlineWidth, borderRightWidth: StyleSheet.hairlineWidth }}><Text style={{ fontSize: 12, color: color.muted }}>{k}</Text>{children}</View>
);

const s = StyleSheet.create({
  coverBar: { position: "absolute", left: 12, right: 12, flexDirection: "row", gap: 10 },
  round: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(18,20,18,.55)", alignItems: "center", justifyContent: "center" },
  hero: { marginTop: -24, backgroundColor: color.carbon, borderRadius: 24, padding: 18, gap: 4 },
  heroName: { flex: 1, color: "#fff", fontSize: 30, fontWeight: "800" },
  stats: { flexDirection: "row", marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,.14)", gap: 12 },
  anchorsWrap: { backgroundColor: color.bg, borderBottomWidth: 1, borderBottomColor: color.line, paddingVertical: 4 },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", backgroundColor: color.bg, borderBottomWidth: 1, borderBottomColor: color.line },
  anchor: { paddingHorizontal: 10, paddingVertical: 10 },
  anchorText: { fontSize: 15, fontWeight: "600", color: color.text },
  body: { fontSize: 15, lineHeight: 23, color: color.text },
  sub: { fontSize: 17, fontWeight: "800", marginTop: 6 },
  plan: { flexDirection: "row", gap: 12, backgroundColor: color.surface, borderWidth: 1, borderColor: color.line, borderRadius: radius.md, padding: 14 },
  groupCta: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.accentSoft, borderWidth: 1.5, borderColor: color.accent700, borderRadius: radius.md, padding: 14, marginTop: 16 },
  stepNo: { width: 24, height: 24, borderRadius: 12, overflow: "hidden", textAlign: "center", lineHeight: 24, fontSize: 15, backgroundColor: color.accent },
  check: { width: 20, height: 20, borderRadius: 10, backgroundColor: color.accent, alignItems: "center", justifyContent: "center" },
  pb: { flexDirection: "row", flexWrap: "wrap", backgroundColor: color.surface, borderWidth: 1, borderColor: color.line, borderRadius: radius.md, overflow: "hidden" },
  pbV: { fontSize: 16, fontWeight: "700" },
  slot: { borderWidth: 1.5, borderColor: color.n300, backgroundColor: color.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", alignItems: "baseline", gap: 6 },
  tlIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: color.n100, alignItems: "center", justifyContent: "center" },
  quote: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 14, gap: 6 },
  lock: { alignItems: "center", gap: 10, backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, padding: 20, marginTop: 16 },
  lockIc: { width: 48, height: 48, borderRadius: 24, backgroundColor: color.accent, alignItems: "center", justifyContent: "center" },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.carbon, paddingHorizontal: 16, paddingTop: 12, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
});
