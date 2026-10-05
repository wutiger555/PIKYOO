import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { money } from "@pikyoo/core/format";
import type { Coach } from "@pikyoo/core/types";
import { LevelChip, Num } from "./badges";
import { Photo } from "./CoachCard";
import { color, radius } from "./theme";

/** Photo-first mini card for the home rails (website: CoachMini). */
export function CoachMini({ coach: c }: { coach: Coach }) {
  const cover = c.profile.photos[0];
  const cred = c.creds.find((x) => x.verified && x.issuer !== "DUPR") ?? c.creds[0];
  return (
    <Link href={`/coaches/${c.id}`} asChild>
      <Pressable style={{ width: 168, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, overflow: "hidden" }}>
        {cover ? <Photo src={cover.src} alt={cover.alt} style={{ height: 150 }} /> : <View style={{ height: 150, backgroundColor: color.n200 }} />}
        <View style={{ padding: 10, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "800" }}>{c.name}</Text>
          {cred && <Text style={{ fontSize: 12, color: color.muted }} numberOfLines={1}>{cred.issuer} {cred.level}</Text>}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <LevelChip min={c.levelMin} max={c.levelMax} bare />
            <Text><Num style={{ fontSize: 17 }}>{money(c.priceFrom)}</Num><Text style={{ fontSize: 11, color: color.muted }}> 起</Text></Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
