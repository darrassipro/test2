import { View, Text, ScrollView, StatusBar, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { useLocalSearchParams, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import PostCard from "@/components/feed/PostCard";
import images from "@/constants/images";

// Données de posts pour chaque groupe
const groupPosts: Record<string, any[]> = {
  places: [
    {
      id: 101,
      username: "Travel Explorer",
      location: "Desert Safari",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      image: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=200",
      likes: 12500,
      comments: 215,
      shares: 2000,
      verified: true,
      isLiked: false,
      timeAgo: "3h",
      hasBookButton: true,
    },
    {
      id: 102,
      username: "Adventure Seeker",
      location: "Mountain View",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      image: "https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg?auto=compress&cs=tinysrgb&w=200",
      likes: 8500,
      comments: 150,
      shares: 1200,
      verified: true,
      isLiked: false,
      timeAgo: "5h",
    },
    {
      id: 103,
      username: "Nature Lover",
      location: "Lake Paradise",
      avatar: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=100",
      image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=200",
      likes: 21000,
      comments: 450,
      shares: 3500,
      verified: true,
      isLiked: false,
      timeAgo: "1d",
    },
    {
      id: 104,
      username: "Wanderlust",
      location: "Canyon Road",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      image: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=200",
      likes: 9800,
      comments: 180,
      shares: 1400,
      verified: false,
      isLiked: false,
      timeAgo: "2d",
    },
  ],
  hotels: [
    {
      id: 201,
      username: "Luxury Traveler",
      location: "Grand Hotel",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      image: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=200",
      likes: 18500,
      comments: 320,
      shares: 2800,
      verified: true,
      isLiked: false,
      timeAgo: "4h",
      hasBookButton: true,
    },
    {
      id: 202,
      username: "Resort Enthusiast",
      location: "Beach Resort",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
      image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=200",
      likes: 15200,
      comments: 280,
      shares: 2100,
      verified: true,
      isLiked: false,
      timeAgo: "6h",
    },
    {
      id: 203,
      username: "Hotel Reviewer",
      location: "City Center Hotel",
      avatar: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=100",
      image: "https://images.pexels.com/photos/261181/pexels-photo-261181.jpeg?auto=compress&cs=tinysrgb&w=200",
      likes: 11200,
      comments: 195,
      shares: 1600,
      verified: true,
      isLiked: false,
      timeAgo: "1d",
    },
    {
      id: 204,
      username: "Vacation Planner",
      location: "Poolside Resort",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      image: "https://images.pexels.com/photos/261185/pexels-photo-261185.jpeg?auto=compress&cs=tinysrgb&w=200",
      likes: 16800,
      comments: 310,
      shares: 2400,
      verified: false,
      isLiked: false,
      timeAgo: "2d",
    },
  ],
};

export default function SavedGroupPosts() {
  const { group } = useLocalSearchParams<{ group: string }>();
  const posts = groupPosts[group || "places"] || [];
  const groupTitle = group === "hotels" ? "Hotels" : "Places";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Image
        source={images.bg}
        className="absolute w-full h-auto z-0"
        resizeMode="cover"
      />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-black">{groupTitle}</Text>
          <View className="w-6" />
        </View>

        {/* Posts List */}
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

