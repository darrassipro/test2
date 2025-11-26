import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import icons from "@/constants/icons";
import { useRouter } from "expo-router";
import { useGetAllStoriesQuery } from "@/services/storyApi";

export default function StoriesSection() {
  const router = useRouter();
  const { data, isLoading, error } = useGetAllStoriesQuery(undefined);
  if (isLoading) {
    return (
      <View className="px-4 my-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="w-36 h-56 rounded-2xl bg-gray-200 items-center justify-center mr-3">
            <ActivityIndicator size="small" color="#EC4899" />
          </View>
        </ScrollView>
      </View>
    );
  }
  if (error) {
    return (
      <View className="px-4 my-4">
        <Text className="text-gray-500 text-sm">Erreur lors du chargement des stories</Text>
      </View>
    );
  }

  const stories = data?.data?.stories || [];

  if (stories.length === 0) {
    return null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 my-4">
      {stories.map((story: any) => {
        const authorName = `${story.author?.firstName || ''} ${story.author?.lastName || ''}`.trim() || 'Unknown';
        const displayName = authorName.length > 10 ? `${authorName.slice(0, 10)}...` : authorName;
        const profileImage = story.author?.profileImage || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50";
        
        return (
          <TouchableOpacity
            key={story.id}
            className="mr-3"
            activeOpacity={0.9}
            onPress={() => {
              if (story.userId) {
                router.push(`/story/${story.userId}`);
              }
            }}
          >
            <View className="relative">
              <Image 
                source={{ uri: story.mediaUrl }} 
                className="w-36 h-56 rounded-2xl"
                resizeMode="cover"
              />
              <Image source={icons.stories} className="absolute top-4 left-3 w-5 h-5" />
              <View className="absolute bottom-2 left-2 flex-row items-center">
                <Image
                  source={{ uri: profileImage }}
                  className="w-8 h-8 rounded-full border-2 border-[#E72858]"
                />
                <Text className="text-white text-sm font-semibold ml-1">
                  {displayName}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}


