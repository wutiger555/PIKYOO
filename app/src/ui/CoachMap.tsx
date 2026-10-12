import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import type { CoachPin } from "@pikyoo/core/coach-filters";
import { money } from "@pikyoo/core/format";
import type { Coach } from "@pikyoo/core/types";
import { Cred, LevelChip } from "./badges";
import { Photo } from "./CoachCard";
import { Icon } from "./Icon";
import { color, font } from "./theme";

/** 找教練 地圖 (website: CoachMap): one price pin per court with coaches; tapping it slides up a preview of those coaches,
 *  and each preview opens the coach page. react-native-maps: Apple Maps on iPhone (no key); Android uses Google Maps,
 *  which works in Expo Go but needs a Maps API key in a store build (docs/APP.md). */
export function CoachMap({ pins, height }: { pins: CoachPin[]; height: number }) {
  const ref = useRef<MapView>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const pin = pins.find((p) => p.court.id === picked) ?? null;
  useEffect(() => {
    if (pins.length) ref.current?.fitToCoordinates(pins.map((p) => ({ latitude: p.court.lat, longitude: p.court.lng })), { edgePadding: { top: 70, bottom: 70, left: 50, right: 50 }, animated: false });
  }, [pins]);
  return (
    <View style={{ height, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: color.line }}>
      <MapView ref={ref} style={StyleSheet.absoluteFill} initialRegion={{ latitude: 25.04, longitude: 121.54, latitudeDelta: 0.16, longitudeDelta: 0.16 }}
        onPress={() => setPicked(null)} showsPointsOfInterests={false} toolbarEnabled={false}>
        {pins.map((p) => {
          const on = p.court.id === picked;
          return (
            <Marker key={p.court.id} coordinate={{ latitude: p.court.lat, longitude: p.court.lng }} onPress={(e) => { e.stopPropagation(); setPicked(p.court.id); }}
              anchor={{ x: 0.5, y: 1 }} zIndex={on ? 10 : 1} tracksViewChanges={false} accessibilityLabel={`${p.court.name}，${p.coaches.length} 位教練`}>
              <View style={[s.pin, on && s.pinOn]}>
                <Text style={[s.pinText, on && { color: "#fff" }]}>{p.coaches.length > 1 ? `${p.coaches.length} 位・` : ""}{money(p.priceFrom)}{p.coaches.length > 1 ? " 起" : ""}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
      {!pins.length && <Text style={s.empty}>符合條件的教練都還沒標上場地。換個條件，或切回列表看看。</Text>}
      {pin && (
        <View style={s.peek}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 6, paddingBottom: 8 }}>
            <Icon name="pin" size={15} />
            <Text style={{ flex: 1, fontSize: 14 }} numberOfLines={1}><Text style={{ fontWeight: "700" }}>{pin.court.name}</Text>・{pin.coaches.length} 位教練</Text>
            <Pressable onPress={() => router.push(`/courts/${pin.court.id}`)} hitSlop={8}><Text style={{ fontSize: 14, fontWeight: "700", textDecorationLine: "underline" }}>看球場</Text></Pressable>
            <Pressable onPress={() => setPicked(null)} hitSlop={10} accessibilityLabel="關閉" style={{ marginLeft: 8 }}><Icon name="x" size={18} /></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {pin.coaches.map((c) => <Peek key={c.id} coach={c} />)}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function Peek({ coach: c }: { coach: Coach }) {
  const cover = c.profile.photos[0];
  const cred = c.creds.find((x) => x.issuer !== "DUPR");
  return (
    <Pressable onPress={() => router.push(`/coaches/${c.id}`)} style={s.card} accessibilityLabel={`${c.name}，${money(c.priceFrom)} 起，看教練頁`}>
      {cover ? <Photo src={cover.src} alt={cover.alt} style={s.photo} tag={false} /> : <View style={[s.photo, { alignItems: "center", justifyContent: "center", backgroundColor: color.n200 }]}><Text style={{ fontSize: 24, fontWeight: "700" }}>{c.initial}</Text></View>}
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={{ fontSize: 17, fontWeight: "700" }}>{c.name}</Text>
        {cred && <View style={{ flexDirection: "row" }}><Cred c={cred} small /></View>}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><LevelChip min={c.levelMin} max={c.levelMax} /><Text style={{ fontSize: 12, color: color.muted, flexShrink: 1 }} numberOfLines={1}>{c.types.join("・")}</Text></View>
        <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: "auto" }}>
          <Text style={{ fontFamily: font.num, fontSize: 20 }}>{money(c.priceFrom)}<Text style={{ fontSize: 12, color: color.muted }}> 起</Text></Text>
          <Text style={{ fontSize: 13, fontWeight: "700" }}>看教練頁 ›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  pin: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: color.surface, borderWidth: 1.5, borderColor: color.text, marginBottom: 4 },
  pinOn: { backgroundColor: color.text },
  pinText: { fontFamily: font.numBold, fontSize: 15, color: color.text },
  empty: { position: "absolute", top: 12, left: 12, right: 12, padding: 12, backgroundColor: color.surface, borderRadius: 12, fontSize: 14, overflow: "hidden" },
  peek: { position: "absolute", left: 8, right: 8, bottom: 8, backgroundColor: color.surface, borderRadius: 16, padding: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  card: { width: 300, flexDirection: "row", gap: 12, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: color.line },
  photo: { width: 84, height: 104, borderRadius: 10 },
});
