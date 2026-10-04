import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { color } from "@/ui/theme";

// Tabs at the root; coach and game pages push on top with a back button (docs/APP.md §4).
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerTintColor: color.text, headerBackButtonDisplayMode: "minimal", contentStyle: { backgroundColor: color.bg } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="coaches/[id]" options={{ title: "" }} />
        <Stack.Screen name="games/[id]" options={{ title: "球局" }} />
      </Stack>
    </>
  );
}
