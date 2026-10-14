import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { isCertified } from "@pikyoo/core/data/coaches";
import { levelText, money } from "@pikyoo/core/format";
import { specialties } from "@pikyoo/core/rules";
import type { Coach } from "@pikyoo/core/types";
import { MAX_COMPARE, useSession } from "@/data/session";
import { Num } from "./badges";
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

/** 標準化教練卡 (website: CoachCard), trimmed after the 2026-10-14 interview: what a student decides on at a glance —
 *  photo, name, verified, rating and students, specialties, where and what level, price, the next free slot. The rest
 *  (credentials, tagline, plans) is one tap away on the coach page. */
export function CoachCard({ coach }: { coach: Coach }) {
  const { compare, toggleCompare } = useSession();
  const on = compare.includes(coach.id);
  const cover = coach.profile.photos[0];
  const spec = specialties(coach);
  const toggle = () => { if (!toggleCompare(coach.id)) toast(`最多比較 ${MAX_COMPARE} 位`, "先移除一位再加入"); };
  return (
    <View style={c.card}>
      <Link href={`/coaches/${coach.id}`} asChild>
        <Pressable>
          <View style={{ aspectRatio: 2.2 }}>
            {cover ? <Photo src={cover.src} alt={cover.alt} style={StyleSheet.absoluteFill} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: color.n200 }]} />}
            {coach.beginnerFriendly && <View style={c.flag}><Icon name="sprout" size={12} /><Text style={{ fontSize: 12, fontWeight: "700" }}>新手友善</Text></View>}
          </View>
          <View style={c.top}>
            <View style={{ flex: 1, gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={c.name}>{coach.name}</Text>
                {isCertified(coach) && <Icon name="check" size={14} tint={color.success} />}
              </View>
              <Text style={{ fontSize: 14, color: color.n700 }}>
                {coach.rating != null ? <Text style={{ fontWeight: "700", color: color.text }}>★ {coach.rating}</Text> : "還沒有評價"}
                {coach.rating != null && <Text>（{coach.reviews}）</Text>}・{coach.students} 位學生
              </Text>
              {spec.length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>{spec.map((x) => <Text key={x} style={c.spec}>{x}</Text>)}</View>}
              <Text style={{ fontSize: 13, color: color.muted }}>{coach.areas.join("・")}・{levelText(coach.levelMin, coach.levelMax)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Num style={{ fontSize: 24 }}>{money(coach.priceFrom)}</Num>
              <Text style={{ fontSize: 12, color: color.muted }}>起</Text>
            </View>
          </View>
        </Pressable>
      </Link>
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

const c = StyleSheet.create({
  spec: { fontSize: 12, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: "hidden", backgroundColor: color.accentSoft, borderWidth: 1, borderColor: color.accent700 },
  card: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.line, borderRadius: radius.md, overflow: "hidden" },
  demo: { position: "absolute", left: 8, bottom: 8, fontSize: 11, color: "#fff", backgroundColor: "rgba(18,20,18,.7)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, overflow: "hidden" },
  flag: { position: "absolute", right: 8, top: 8, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radius.sm, backgroundColor: color.accent },
  top: { flexDirection: "row", gap: 12, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },
  name: { fontSize: 19, fontWeight: "700", color: color.text },
  foot: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
  cmp: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1.5, borderColor: color.n300, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
});
