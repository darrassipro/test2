import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";

export default function Success() {
  const { name } = useLocalSearchParams<{ name?: string }>();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1 items-center justify-center px-6">
        {/* Success Icon */}
        <View className="w-20 h-20 bg-[#E91E63] rounded-full items-center justify-center mb-6">
          <Check size={40} color="#FFFFFF" strokeWidth={3} />
        </View>

        {/* Main Message */}
        <Text className="text-3xl font-bold text-black mb-4">Successful</Text>

        {/* Secondary Messages */}
        <Text className="text-base text-gray-600 text-center mb-1">
          {name || "Utilisateur"}! Votre compte a été créé avec succès!
        </Text>
        <Text className="text-base text-gray-600 text-center mb-12">
          Bienvenue dans la communauté Ajiw!
        </Text>

        {/* Continue Button */}
        <TouchableOpacity
          className="w-full bg-[#E91E63] rounded-3xl py-4 items-center"
          onPress={() => router.replace("/complete-profile")}
        >
          <Text className="text-white text-base font-semibold">Continuer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

