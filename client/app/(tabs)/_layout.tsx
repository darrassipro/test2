import { Tabs } from "expo-router";
import { Home, ShoppingBag, Users, Bookmark, User } from "lucide-react-native";
import { StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(8, insets.bottom);
  const barHeight = 55 + insets.bottom;

  // Configurer la barre de navigation Android en dark pour toutes les pages des tabs
  useEffect(() => {
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync("#FFFFFF");
        await NavigationBar.setButtonStyleAsync("dark");
      } catch {}
    })();
  }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#e91e63",
        tabBarInactiveTintColor: "#1F1F1F",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingTop: 4,
          paddingBottom: bottomPadding,
          height: barHeight,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: "#FFFFFF",
          // Shadow (iOS)
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          // Shadow (Android)
          elevation: 16,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ size, color }) => (
            <ShoppingBag size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="communities"
        options={{
          title: "Communities",
          tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
        }}
      />

      {/* Conserver la route existante "save" (fichier save.tsx) avec le label Saved */}
      <Tabs.Screen
        name="save"
        options={{
          title: "Saved",
          tabBarIcon: ({ size, color }) => <Bookmark size={size} color={color} />,
        }}
      />

      {/* Conserver la route existante "profile" (fichier profile.tsx) avec le label Account */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
