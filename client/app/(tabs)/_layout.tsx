import { Tabs, router } from "expo-router";
import { Home, ShoppingBag, Users, User, Plus } from "lucide-react-native";
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect, useState } from "react";
import CommunitiesModal from "./community/CommunitiesModal";
import CreatePostModal from "./community/CreatePostModal";
import { usePathname } from 'expo-router';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(8, insets.bottom);
  const barHeight = 66 + insets.bottom;

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
          tabBarActiveTintColor: "#E72858",
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
          tabBarItemStyle: {
            height: 52,
            paddingTop: 0,
            paddingBottom: 0,
          },
          tabBarLabelStyle: {
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            fontWeight: '500',
            lineHeight: 25,
            marginTop: 0,
            marginBottom: 0,
          },
          tabBarIconStyle: {
            marginTop: 0,
            marginBottom: 0,
          },
        }}
      >
        {/* Feed */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Feed",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ 
                width: 21.6, 
                height: 21.6, 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: -5,
              }}>
                <Home 
                  size={21.6} 
                  color={color} 
                  strokeWidth={1.8}
                />
              </View>
            ),
          }}
        />

        {/* Communities */}
        <Tabs.Screen
          name="communities"
          options={{
            title: "Communities",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ 
                width: 21.6, 
                height: 21.6, 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: -5,
              }}>
                <Users 
                  size={21.6} 
                  color={color}
                  strokeWidth={1.8}
                />
              </View>
            ),
          }}
        />

        {/* PLUS TAB - Center Circle Button */}
        <Tabs.Screen
          name="plus"
          options={{
            title: "",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ 
                width: 52, 
                height: 52, 
                borderRadius: 1040,
                backgroundColor: '#000000',
                alignItems: 'center', 
                justifyContent: 'center',
                marginTop: 30,
              }}>
                <View style={{
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Plus 
                    size={16} 
                    color="#FFFFFF"
                    strokeWidth={2}
                  />
                </View>
              </View>
            ),
            tabBarButton: ({ children }) => (
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => setShowModal(true)}
              >
                {children}
              </TouchableOpacity>
            ),
          }}
        />

        {/* Shop */}
        <Tabs.Screen
          name="shop"
          options={{
            title: "Shop",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ 
                width: 21.6, 
                height: 21.6, 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: -5,
              }}>
                <ShoppingBag 
                  size={21.6} 
                  color={color}
                  strokeWidth={1.8}
                />
              </View>
            ),
          }}
        />

        {/* Account/Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Account",
            tabBarIcon: ({ color, focused }) => (
              <View style={{ 
                width: 21.6, 
                height: 21.6, 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: -5,
              }}>
                <User 
                  size={21.6} 
                  color={color}
                  strokeWidth={1.8}
                />
              </View>
            ),
          }}
        />

        {/* Hidden screens */}
        <Tabs.Screen name="save" options={{ href: null }} />
        <Tabs.Screen name="community/[id]" options={{ href: null }} />
        <Tabs.Screen name="community/CommunitiesModal" options={{ href: null }} />
        <Tabs.Screen name="community/CreatePostModal" options={{ href: null }} />
      </Tabs>

      {/* Modal */}
      {currentCommunityId ? (
        <CreatePostModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          communityId={currentCommunityId}
        />
      ) : (
        <CommunitiesModal visible={showModal} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}