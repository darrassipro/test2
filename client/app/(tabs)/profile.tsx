import { View, Text, TouchableOpacity, StatusBar, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Home,
  User,
  Lock,
  MessageCircle,
  Languages,
  LogOut,
  LayoutDashboard,
  Rss,
  Globe,
  ShoppingBag,
  FileText,
  Wallet,
  Grid,
} from "lucide-react-native";
import { useAppDispatch } from "@/lib/hooks";
import { logout } from "@/services/slices/userSlice";
import { useGetUserCommunitiesQuery } from "@/services/communityApi";

interface AccountOption {
  id: string;
  label: string;
  iconComponent: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  onPress?: () => void;
}

export default function Profile() {
  const dispatch = useAppDispatch();
  const { data: communitiesResponse, isLoading } = useGetUserCommunitiesQuery({});

  const handleLogout = async () => {
    await dispatch(logout() as any);
    router.replace("/login");
  };

  // Check if user is member of any community
  const communities = communitiesResponse?.communities || [];
  const isMember = communities.length > 0;

  // Old profile options (when not a member)
  const accountOptions: AccountOption[] = [
    {
      id: "create-community",
      label: "Create Community",
      iconComponent: Users,
      color: "#E91E63",
      onPress: () => {
        router.push('/create-community');
      },
    },
    {
      id: "feed",
      label: "Feed",
      iconComponent: Home,
      color: "#000000",
      onPress: () => {
        router.push("/(tabs)");
      },
    },
    {
      id: "personal-info",
      label: "Personal informations",
      iconComponent: User,
      color: "#000000",
      onPress: () => {},
    },
    {
      id: "password-security",
      label: "Password & Security",
      iconComponent: Lock,
      color: "#000000",
      onPress: () => {},
    },
    {
      id: "contact-support",
      label: "Contact Support",
      iconComponent: MessageCircle,
      color: "#000000",
      onPress: () => {},
    },
    {
      id: "switch-language",
      label: "Switch Language",
      iconComponent: Languages,
      color: "#000000",
      onPress: () => {},
    },
    {
      id: "logout",
      label: "Log out",
      iconComponent: LogOut,
      color: "#E91E63",
      onPress: handleLogout,
    },
  ];

  // New profile options (when member of community)
  const memberOptions: AccountOption[] = [
    {
      id: "community",
      label: "Community",
      iconComponent: Users,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "dashboard",
      label: "Dashboard",
      iconComponent: LayoutDashboard,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "feed",
      label: "Feed",
      iconComponent: Rss,
      color: "#1F1F1F",
      onPress: () => {
        router.push("/(tabs)");
      },
    },
    {
      id: "website-builder",
      label: "Website builder",
      iconComponent: Globe,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "personal-info",
      label: "Personal informations",
      iconComponent: User,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "orders",
      label: "Orders",
      iconComponent: ShoppingBag,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "community-info",
      label: "Community informations",
      iconComponent: FileText,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "payouts",
      label: "Payouts",
      iconComponent: Wallet,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "connected-apps",
      label: "Connected Apps",
      iconComponent: Grid,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "password-security",
      label: "Password & Security",
      iconComponent: Lock,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "contact-support",
      label: "Contact Support",
      iconComponent: MessageCircle,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "switch-language",
      label: "Switch Language",
      iconComponent: Languages,
      color: "#1F1F1F",
      onPress: () => {},
    },
    {
      id: "logout",
      label: "Log out",
      iconComponent: LogOut,
      color: "#DE033A",
      onPress: handleLogout,
    },
  ];

  const renderMenuItem = (option: AccountOption) => (
    <View key={option.id}>
      <TouchableOpacity
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 0,
          paddingHorizontal: 0,
          height: 25,
        }}
        onPress={option.onPress}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View style={{ width: 24, height: 24 }}>
            <option.iconComponent size={24} color={option.color} />
          </View>
          <Text
            style={{
              fontFamily: "Inter",
              fontWeight: "500",
              fontSize: 14,
              lineHeight: 25,
              color: option.color,
            }}
          >
            {option.label}
          </Text>
        </View>
        <View
          style={{
            width: 18,
            height: 18,
          }}
        >
          <ChevronRight size={18} color="#D0D0D0" strokeWidth={1.6} />
        </View>
      </TouchableOpacity>
      <View
        style={{
          width: 345,
          height: 0.5,
          backgroundColor: "#E0E0E0",
          marginVertical: 10,
        }}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-base font-semibold text-black">Account</Text>
          <View className="w-6" />
        </View>

        {/* Conditional Layout */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center">Loading...</Text>
          </View>
        ) : isMember ? (
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled={true}
          >
            <View style={{ paddingHorizontal: 16, paddingVertical: 24 }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 10,
                  width: 344,
                  alignSelf: "center",
                  paddingBottom: 40,
                }}
              >
                {memberOptions.map((option) => renderMenuItem(option))}
              </View>
            </View>
          </ScrollView>
        ) : (
          <ScrollView className="flex-1">
            {accountOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
                onPress={option.onPress}
              >
                <View className="flex-row items-center gap-4">
                  <option.iconComponent size={24} color={option.color} />
                  <Text
                    className="text-base"
                    style={{ color: option.color }}
                  >
                    {option.label}
                  </Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}