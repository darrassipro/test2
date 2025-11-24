import { View, Text, Image, TouchableOpacity } from "react-native";
import { UserRoundPlus } from "lucide-react-native";
import { useRouter } from "expo-router";

interface CommunityCardProps {
  id: number;
  name: string;
  followers: string;
  avatar: string;
  image: string;
  variant?: "horizontal" | "grid";
}

export default function CommunityCard({ id, name, followers, avatar, image, variant = "horizontal" }: CommunityCardProps) {
  const router = useRouter();
  const containerClass = variant === "grid" 
    ? "border border-gray-200 rounded-2xl pb-2" 
    : "mr-3 w-48 border border-gray-200 rounded-2xl pb-2";
  return (
    <TouchableOpacity 
      className={containerClass}
      onPress={() => router.push(`/community/${id}`)}
    >
      <View className="relative">
        <View className="relative h-28 w-full overflow-hidden rounded-2xl mb-2">
          <Image source={{ uri: image }} className="w-full h-full object-cover" />
        </View>
        <Image
          source={{ uri: avatar }}
          className="absolute -bottom-11 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-2 border-white"
        />
      </View>
      <View className="flex flex-col items-center mt-5">
        <Text className="font-semibold text-sm">{name}</Text>
        <Text className="text-gray-500 text-xs">{followers}</Text>
        <TouchableOpacity className="mt-2 py-1 flex-row items-center justify-center gap-1">
          <UserRoundPlus size={15} color="#E72858" className="font-bold" />
          <Text className="text-pink-500 text-md font-bold ml-2">Join</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

