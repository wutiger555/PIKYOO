import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Icon } from "./Icon";
import { color, space } from "./theme";

/** The website's bottom Sheet as the native iOS page sheet (swipe down to close). */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: color.surface }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: space[4], paddingBottom: space[2] }}>
          <Text style={{ flex: 1, fontSize: 22, fontWeight: "800", color: color.text }}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="關閉"><Icon name="x" size={20} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: space[4], paddingTop: 0, gap: space[3] }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
      </View>
    </Modal>
  );
}
