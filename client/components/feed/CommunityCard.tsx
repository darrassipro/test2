import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { UserRoundPlus } from "lucide-react-native";
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

  const containerClass = variant === "grid" 
    ? "border border-gray-200 rounded-2xl overflow-hidden bg-white" 
    : "w-40 border border-gray-200 rounded-2xl overflow-hidden bg-white";

  const handleJoin = async (e: any) => {
    e.stopPropagation();
    
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
      {/* Cover Image */}
      <View className="relative h-24 w-full">
        <Image 
          source={{ uri: image }} 
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Gradient overlay */}
        <View 
          className="absolute inset-0" 
          style={{
            backgroundColor: 'rgba(0,0,0,0.15)'
          }}
        />
      </View>

      {/* Avatar (overlapping) */}
      <View className="absolute left-1/2 -translate-x-1/2" style={{ top: 68 }}>
        <View className="w-14 h-14 rounded-full border-2 border-white overflow-hidden bg-white shadow-md">
          <Image 
            source={{ uri: avatar }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Content */}
      <View className="pt-8 pb-3 px-3 items-center">
        <Text 
          className="font-semibold text-sm text-center text-black mb-1"
          numberOfLines={1}
        >
          {name}
        </Text>
        
        <Text className="text-gray-500 text-xs mb-3">
          {followers}
        </Text>

        {/* Join Button */}
        {!isMember && onJoin && (
          <TouchableOpacity
            className="py-2 px-4 flex-row items-center justify-center gap-1.5 bg-pink-50 border border-pink-200 rounded-full active:bg-pink-100"
            onPress={handleJoin}
            disabled={isJoining}
            activeOpacity={0.7}
          >
            {isJoining ? (
              <ActivityIndicator size="small" color="#E72858" />
            ) : (
              <>
                <UserRoundPlus size={14} color="#E72858" strokeWidth={2.5} />
                <Text className="text-pink-600 text-xs font-bold">Join</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}