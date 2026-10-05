import { KeyboardAvoidingView, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "./Icon";
import { color, space } from "./theme";

/** The website's bottom Sheet: sized to its content (up to ~88% of the screen), tap outside or ✕ to close. */
export function Sheet({ title, onClose, children, action }: { title: string; onClose: () => void; children: React.ReactNode; action?: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(18,20,18,.45)" }} onPress={onClose} accessibilityLabel="關閉" />
        <View style={{ maxHeight: "88%", backgroundColor: color.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: insets.bottom + 8 }}>
          <View style={{ alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: color.n300, marginTop: 8 }} />
          <View style={{ flexDirection: "row", alignItems: "center", padding: space[4], paddingBottom: space[2] }}>
            <Text style={{ flex: 1, fontSize: 22, fontWeight: "800", color: color.text }}>{title}</Text>
            {action && <View style={{ marginRight: 16 }}>{action}</View>}
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="關閉"><Icon name="x" size={20} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: space[4], paddingTop: 4, gap: space[3] }} keyboardShouldPersistTaps="handled" bounces={false}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
