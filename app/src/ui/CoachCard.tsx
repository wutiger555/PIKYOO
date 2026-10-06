import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { money } from "@pikyoo/core/format";
import type { Coach } from "@pikyoo/core/types";
import { MAX_COMPARE, useSession } from "@/data/session";
import { Cred, LevelChip, Num, Rating } from "./badges";
import { Icon } from "./Icon";
import { color, isStock, photo, radius } from "./theme";
import { toast } from "./Toast";

/** A photo with the 示意照 tag when it is a bundled stock photo (website: Img). */
export function Photo({ src, alt, style, tag = true, tagBottom = 8 }: { src: string; alt: string; style: object; tag?: boolean; tagBottom?: number }) {
  return (
    <View style={[style, { overflow: "hidden", backgroundColor: color.n200 }]}>
      <Image source={photo(src)} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: "22%", left: "50%" }} accessibilityLabel={alt} transition={150} />
      {tag && isStock(src) && <Text style={[c.demo, { bottom: tagBottom }]}>示意照</Text>}
    </View>
  );
}

/** 標準化教練卡 (website: CoachCard): photo first, then every coach in the same format so price, level and credentials line up. */
export function CoachCard({ coach }: { coach: Coach }) {
  const { compare, toggleCompare } = useSession();
  const on = compare.includes(coach.id);
  const cover = coach.profile.photos[0];
  const group = coach.profile.plans.find((p) => p.group)?.group;
  const toggle = () => { if (!toggleCompare(coach.id)) toast(`最多比較 ${MAX_COMPARE} 位`, "先移除一位再加入"); };
  return (
    <View style={c.card}>
      <Link href={`/coaches/${coach.id}`} asChild>
        <Pressable>
          <View style={{ aspectRatio: 2 }}>
            {cover ? <Photo src={cover.src} alt={cover.alt} style={StyleSheet.absoluteFill} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: color.n200 }]} />}
            {coach.beginnerFriendly && <View style={c.flag}><Icon name="sprout" size={12} /><Text style={{ fontSize: 12, fontWeight: "700" }}>新手友善</Text></View>}
          </View>
          <View style={c.top}>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={c.name}>{coach.name}</Text>
                {coach.rating != null && <Rating rating={coach.rating} reviews={coach.reviews} />}
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>{coach.creds.map((x, i) => <Cred key={i} c={x} small />)}</View>
              <Text style={c.tagline}>{coach.tagline}</Text>
              {group && <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="users" size={13} /><Text style={{ fontSize: 13, fontWeight: "700" }}>可揪朋友一起上（{group.min}–{group.max} 人）</Text></View>}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 12, color: color.muted }}>起價</Text>
              <Num style={{ fontSize: 26 }}>{money(coach.priceFrom)}</Num>
            </View>
          </View>
        </Pressable>
      </Link>
      <View style={c.grid}>
        <Cell label="程度"><LevelChip min={coach.levelMin} max={coach.levelMax} bare /></Cell>
        <Cell label="區域"><Text style={c.dd}>{coach.areas.join("・")}</Text></Cell>
        <Cell label="類型"><Text style={c.dd}>{coach.types.join("・")}</Text></Cell>
        <Cell label="擅長" last><Text style={c.dd}>{coach.profile.play.strengths[0]}</Text></Cell>
      </View>
      <View style={c.foot}>
        <Icon name="clock" size={14} tint={color.muted} />
        <Text style={{ flex: 1, fontSize: 13, color: color.muted }}>最近可約 <Text style={{ color: color.text, fontWeight: "700" }}>{coach.nextSlot}</Text></Text>
        <Pressable onPress={toggle} style={[c.cmp, on && { backgroundColor: color.text, borderColor: color.text }]} accessibilityState={{ selected: on }}>
          <Icon name={on ? "check" : "plus"} size={12} tint={on ? "#fff" : color.text} />
          <Text style={{ fontSize: 13, fontWeight: "700", color: on ? "#fff" : color.text }}>比較</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Cell({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[{ flex: 1, paddingVertical: 8, paddingHorizontal: 10, gap: 3 }, !last && { borderRightWidth: 1, borderRightColor: color.n100 }]}>
      <Text style={{ fontSize: 11, color: color.muted, fontWeight: "700" }}>{label}</Text>
      {children}
    </View>
  );
}

const c = StyleSheet.create({
  card: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.line, borderRadius: radius.md, overflow: "hidden" },
  demo: { position: "absolute", left: 8, bottom: 8, fontSize: 11, color: "#fff", backgroundColor: "rgba(18,20,18,.7)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: "hidden" },
  flag: { position: "absolute", right: 8, top: 8, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radius.sm, backgroundColor: color.accent },
  top: { flexDirection: "row", gap: 12, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },
  name: { fontSize: 19, fontWeight: "700", color: color.text },
  tagline: { fontSize: 14, color: color.n700, lineHeight: 20 },
  grid: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: color.n100 },
  dd: { fontSize: 13, lineHeight: 18, color: color.text },
  foot: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  cmp: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1.5, borderColor: color.n300, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
});
