import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSession } from "@/data/session";
import { Icon } from "@/ui/Icon";
import { color, radius } from "@/ui/theme";

/** Website links to the app's routes: 我的課 is a tab here; query strings are the website's demo switches. */
const appPath = (href: string) => href.replace(/\?.*$/, "").replace(/^\/me\/lessons$/, "/lessons");

/** 通知 (website: NotificationsScreen): newest first, unread in bold until you leave the page; the demo booking's steps
 *  arrive here as they happen. Live notifications come with sign-in (they already reach LINE). */
export default function Notifications() {
  const { notices: list, readNotices } = useSession();
  useEffect(() => () => readNotices(), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={s.card}>
        {list.map((n, i) => (
          <Pressable key={n.id} disabled={!n.href} onPress={() => n.href && router.push(appPath(n.href) as never)}
            style={StyleSheet.flatten([s.row, i === list.length - 1 && { borderBottomWidth: 0 }])}>
            <View style={[s.dot, { backgroundColor: n.read ? color.n100 : color.accent }]}><Icon name="bell" size={15} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ fontSize: 15, fontWeight: n.read ? "500" : "800" }}>{n.title}</Text>
              {n.body && <Text style={{ fontSize: 13, color: color.muted }}>{n.body}</Text>}
              <Text style={{ fontSize: 12, color: color.muted }}>{n.at}</Text>
            </View>
            {n.href && <Icon name="right" size={14} tint={color.muted} />}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: color.n100 },
  dot: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
});
