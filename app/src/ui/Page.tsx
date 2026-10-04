import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text } from "react-native";
import type { Catalog } from "@pikyoo/core/source/types";
import { useCatalog } from "@/data/catalog";
import { s } from "./parts";
import { color } from "./theme";

/** A scrolling page with its big title; insets follow the notch and the native tab bar. Pull down to reload the data. */
export function Page({ title, children }: { title?: string; children: React.ReactNode }) {
  const { refreshing, refresh } = useCatalog();
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      {title && <Text style={{ fontSize: 30, fontWeight: "800", marginTop: 8 }}>{title}</Text>}
      {children}
    </ScrollView>
  );
}

/** Renders children with the catalog, or a spinner / an error with 再試一次 while it isn't there. */
export function WithCatalog({ children }: { children: (c: Catalog) => React.ReactNode }) {
  const { catalog, error, refresh } = useCatalog();
  if (catalog) return children(catalog);
  if (error) return (
    <Pressable onPress={refresh} style={{ gap: 6, paddingVertical: 24 }}>
      <Text style={s.title}>讀不到資料</Text>
      <Text style={s.muted}>請確認網路連線，點這裡再試一次。</Text>
    </Pressable>
  );
  return <ActivityIndicator color={color.text} style={{ paddingVertical: 32 }} />;
}
