// client/components/feed/CommunityCard.tsx
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { UserRoundPlus, Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import type { CommunityCardProps } from "@/types/interfaces";
import { useState } from "react";

export default function CommunityCard({ 
  id, 
  name, 
  followers, 
  avatar, 
  image, 
  variant = "horizontal", 
  isMember = false, 
  onJoin 
}: CommunityCardProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  const containerClass = 
    variant === "grid" 
      ? "border border-gray-200 rounded-2xl pb-2" 
      : "mr-3 w-48 border border-gray-200 rounded-2xl pb-2";

  const handleJoin = async (e: any) => {
    e.stopPropagation(); // Empêcher la navigation
    
    if (isJoining || !onJoin) return;
    
    setIsJoining(true);
    try {
      await onJoin(id);
    } finally {
      setIsJoining(false);
    }
  };

  const handlePress = () => {
    router.push(`/community/${id}?communityName=${encodeURIComponent(name)}` as any);
  };

  return (
    <TouchableOpacity 
      className={containerClass} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View className="relative">
        {/* Image de couverture */}
        <View className="relative h-28 w-full overflow-hidden rounded-t-2xl mb-2">
          <Image 
            source={{ uri: image }} 
            className="w-full h-full" 
            resizeMode="cover"
          />
        </View>

        {/* Avatar */}
        <View className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <Image 
            source={{ uri: avatar }} 
            className="w-14 h-14 rounded-full border-2 border-white" 
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Contenu */}
      <View className="flex flex-col items-center mt-10 px-3">
        <Text 
          className="font-semibold text-sm text-center" 
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-gray-500 text-xs mt-1">{followers}</Text>

        {/* Bouton Join */}
        {!isMember && onJoin && (
          <TouchableOpacity 
            className="mt-3 py-2 px-4 flex-row items-center justify-center gap-2 bg-pink-50 rounded-full active:bg-pink-100"
            onPress={handleJoin}
            disabled={isJoining}
            activeOpacity={0.7}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#E72858" />
            ) : isMember ? (
              <>
                <Check size={16} color="#E72858" strokeWidth={2.5} />
                <Text className="text-pink-500 text-sm font-bold">Membre</Text>
              </>
            ) : (
              <>
                <UserRoundPlus size={16} color="#E72858" strokeWidth={2.5} />
                <Text className="text-pink-500 text-sm font-bold">Rejoindre</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}