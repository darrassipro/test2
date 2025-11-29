import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ImagePlus, Video, Orbit } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function CreatePostSection() {
  const router = useRouter();

  return (
    <View className="px-4 my-4">
      <Text className="text-xl font-semibold mb-4 text-black">Create Post / Reel</Text>
      
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => router.push("/create-post" as any)}
      >
        <View className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
          {/* Text Input Preview */}
          <View className="mb-4">
            <Text className="text-sm text-gray-400">
              Write something inspiring...
            </Text>
          </View>

          {/* Type Selector */}
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5">
              <ImagePlus size={16} color="#000" />
              <Text className="text-xs font-medium text-black">Post</Text>
            </View>

            <View className="flex-row items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5">
              <Video size={16} color="#000" />
              <Text className="text-xs font-medium text-black">Reel</Text>
            </View>

            <View className="flex-row items-center gap-2 bg-gray-50 rounded-full px-4 py-2.5">
              <Orbit size={16} color="#000" />
              <Text className="text-xs font-medium text-black">360</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}