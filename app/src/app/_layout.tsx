import { BarlowCondensed_600SemiBold, BarlowCondensed_700Bold, useFonts } from "@expo-google-fonts/barlow-condensed";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { CatalogProvider } from "@/data/catalog";
import { SessionProvider } from "@/data/session";
import { color } from "@/ui/theme";

SplashScreen.preventAutoHideAsync();

// Tabs at the root; coach, booking and game pages push on top with a back button (docs/APP.md §4).
export default function RootLayout() {
  const [fonts] = useFonts({ BarlowCondensed_600SemiBold, BarlowCondensed_700Bold });
  useEffect(() => { if (fonts) SplashScreen.hideAsync(); }, [fonts]);
  if (!fonts) return null;
  return (
    <CatalogProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerTintColor: color.text, headerBackButtonDisplayMode: "minimal", contentStyle: { backgroundColor: color.bg } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="coach" options={{ headerShown: false }} />
          <Stack.Screen name="coaches/[id]/index" options={{ headerShown: false }} />
          <Stack.Screen name="coaches/[id]/book" options={{ title: "預約" }} />
          <Stack.Screen name="games/index" options={{ title: "球局" }} />
          <Stack.Screen name="games/[id]" options={{ title: "球局" }} />
          <Stack.Screen name="courts/index" options={{ title: "找球場" }} />
          <Stack.Screen name="courts/[id]" options={{ title: "球場" }} />
          <Stack.Screen name="me/booking" options={{ title: "我的預約" }} />
          <Stack.Screen name="me/notifications" options={{ title: "通知" }} />
          <Stack.Screen name="coach-inbox" options={{ title: "待處理" }} />
          <Stack.Screen name="coach-lesson/[id]" options={{ title: "課程" }} />
          <Stack.Screen name="coach-student/[id]" options={{ title: "學生" }} />
        </Stack>
      </SessionProvider>
    </CatalogProvider>
  );
}
