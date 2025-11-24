import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import { Images, Play, Rotate3d } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function CreatePostSection() {
  const router = useRouter();
  return (
    <View className="px-4 my-4">
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/create-post")}>
        <Text className="text-2xl font-semibold mb-6">Create Post / Reel</Text>
        <View className="bg-white rounded-2xl border border-gray-200 p-3">
        <TextInput
          placeholder="Write something inspiring..."
          placeholderTextColor="#1F1F1F"
          multiline
          textAlignVertical="top"
          className="text-md mb-4 h-24"
        />
        <View className="flex-row justify-around">
          <View className="flex-row items-center gap-2 bg-gray-100 rounded-full px-5 py-2">
            <Images size={18} color="#000" />
            <Text className="text-md font-medium">Post</Text>
          </View>
          <View className="flex-row items-center gap-2 bg-gray-100 rounded-full px-5 py-2">
            <Play size={18} color="#000" />
            <Text className="text-md font-medium">Reel</Text>
          </View>
          <View className="flex-row items-center gap-2 bg-gray-100 rounded-full px-5 py-2">
            <Rotate3d size={18} color="#000" />
            <Text className="text-md font-medium">360</Text>
          </View>
        </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}


