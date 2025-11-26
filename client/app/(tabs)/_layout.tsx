import { Tabs, router } from "expo-router";
import { Home, ShoppingBag, Users, User, Plus, ImagePlus, Video, Orbit } from "lucide-react-native";
import { Modal, View, Text } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import CommunitiesModal from "./community/CommunitiesModal";
import CreatePostModal from "./community/CreatePostModal";
import { usePathname } from 'expo-router';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(8, insets.bottom);
  const barHeight = 55 + insets.bottom;

  // Android navigation bar style
  useEffect(() => {
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync("#FFFFFF");
        await NavigationBar.setButtonStyleAsync("dark");
      } catch {}
    })();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const pathname = usePathname();
  // detect if current route is community details like /community/[id]
  const communityMatch = pathname ? pathname.match(/\/community\/(\w[-\w]*)/) : null;
  const currentCommunityId = communityMatch ? communityMatch[1] : null;

  return (
    <>
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
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 16,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },
        }}
      >
        {/* Feed */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Feed",
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />

        {/* Shop */}
        <Tabs.Screen
          name="shop"
          options={{
            title: "Shop",
            tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="community/[id]"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="community/CommunitiesModal"
          options={{ href: null }}
        />
                <Tabs.Screen
          name="community/CreatePostModal"
          options={{ href: null }}
        />
        {/* PLUS TAB:  */}
        <Tabs.Screen
          name="plus"
          options={{
            title: "",
            tabBarIcon: ({ color, size }) => <Plus size={size} color={color} />,
            tabBarButton: ({ children }) => (
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => setShowModal(true)}
              >
                {children}
              </TouchableOpacity>
            ),
          }}
        />

        {/* Communities */}
        <Tabs.Screen
          name="communities"
          options={{
            title: "Communities",
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />

        {/* HIDDEN Saved */}
        <Tabs.Screen
          name="save"
          options={{ href: null }}
        />
        {/* dynamic community route is handled at app/(tabs)/community/[id].tsx, not as a tab child */}

        {/* Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* Modal */}
      {currentCommunityId ? (
        <CreatePostModal visible={showModal} onClose={() => setShowModal(false)} communityId={currentCommunityId} />
      ) : (
        <CommunitiesModal visible={showModal} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
