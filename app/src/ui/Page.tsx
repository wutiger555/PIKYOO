import { ScrollView, Text } from "react-native";
import { s } from "./parts";

/** A tab's scrolling page with its big title; insets follow the notch and the native tab bar. */
export function Page({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} contentInsetAdjustmentBehavior="automatic">
      {title && <Text style={{ fontSize: 30, fontWeight: "800", marginTop: 8 }}>{title}</Text>}
      {children}
    </ScrollView>
  );
}
