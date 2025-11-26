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
} from "lucide-react-native";
import { useAppDispatch } from "@/lib/hooks";
import { logout } from "@/services/slices/userSlice";

interface AccountOption {
  id: string;
  label: string;
  iconComponent: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  onPress?: () => void;
}

export default function Profile() {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await dispatch(logout() as any);
    router.replace("/login");
  };

  const accountOptions: AccountOption[] = [
    {
      id: "create-community",
      label: "Create Community",
      iconComponent: Users,
      color: "#E91E63",
      onPress: () => {
        // Navigate to create community screen
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
      onPress: () => {
        // Navigate to personal info
      },
    },
    {
      id: "password-security",
      label: "Password & Security",
      iconComponent: Lock,
      color: "#000000",
      onPress: () => {
        // Navigate to password & security
      },
    },
    {
      id: "contact-support",
      label: "Contact Support",
      iconComponent: MessageCircle,
      color: "#000000",
      onPress: () => {
        // Navigate to contact support
      },
    },
    {
      id: "switch-language",
      label: "Switch Language",
      iconComponent: Languages,
      color: "#000000",
      onPress: () => {
        // Navigate to language settings
      },
    },
    {
      id: "logout",
      label: "Log out",
      iconComponent: LogOut,
      color: "#E91E63",
      onPress: handleLogout,
    },
  ];

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

        {/* Account Options List */}
        <ScrollView className="flex-1">
          {accountOptions.map((option, index) => (
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
      </View>
    </SafeAreaView>
  );
}
