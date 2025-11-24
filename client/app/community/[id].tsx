import { useState } from "react";
import { View, Text, ScrollView, StatusBar, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Settings, Home, ShoppingBag, MapPin, Edit, Building2, ChefHat, Bike } from "lucide-react-native";
import { useLocalSearchParams, router } from "expo-router";
import PostCard from "@/components/feed/PostCard";
import images from "@/constants/images";

// Données de communauté
const communityData: Record<number, any> = {
  1: {
    id: 1,
    name: "Fayssal Vlog",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the",
    banner: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800",
    avatar: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=200",
    members: 69652,
    products: 10,
    posts: 79,
  },
};

// Posts de la communauté
const communityPosts = [
  {
    id: 1,
    username: "Fayssal Vlog",
    location: "Palace Restaurant",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    image: "https://images.unsplash.com/photo-1762140170241-7c8e552f25bb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
    likes: 12566,
    comments: 215,
    shares: 26,
    verified: true,
    isLiked: false,
    timeAgo: "2h",
    hasBookButton: true,
  },
  {
    id: 2,
    username: "Fayssal Vlog",
    location: "Palace Restaurant",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    image: "https://images.unsplash.com/photo-1762498322297-10a7035e9334?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    likes: 12566,
    comments: 215,
    shares: 26,
    verified: true,
    isLiked: false,
    timeAgo: "2h",
    hasBookButton: true,
  },
  {
    id: 3,
    username: "Fayssal Vlog",
    location: "Palace Restaurant",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    image: "https://images.pexels.com/photos/261185/pexels-photo-261185.jpeg?auto=compress&cs=tinysrgb&w=800",
    likes: 12566,
    comments: 215,
    shares: 26,
    verified: true,
    isLiked: false,
    timeAgo: "2h",
    isVideo: true,
  },
];

const categories = [
  { id: 1, name: "Riad", icon: Building2 },
  { id: 2, name: "Restaurant", icon: ChefHat },
  { id: 3, name: "Motos", icon: Bike },
  { id: 4, name: "Hotels", icon: Building2 },
  { id: 5, name: "Cafes", icon: ChefHat },
];

export default function CommunityDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const communityId = Number(id) || 1;
  const community = communityData[communityId] || communityData[1];
  const [activeTab, setActiveTab] = useState("Feed");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  function formatCount(num: number): string {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`.replace(/\.0$/, "");
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`.replace(/\.0$/, "");
    return String(num);
  }

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
          <Text className="text-lg font-semibold text-black">{community.name}</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Banner with Profile */}
          <View className="relative">
            <Image
              source={{ uri: community.banner }}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <Image
                source={{ uri: community.avatar }}
                className="w-24 h-24 rounded-full border-4 border-white"
              />
            </View>
          </View>

          {/* Profile Info */}
          <View className="mt-16 px-4 items-center">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-xl font-semibold text-black">{community.name}</Text>
              <TouchableOpacity>
                <Edit size={18} color="#666" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-600 text-center mb-4 px-4">
              {community.description}
            </Text>

            {/* Stats */}
            <View className="flex-row items-center gap-6 mb-6">
              <View className="items-center">
                <Text className="text-lg font-semibold text-black">{formatCount(community.members)}</Text>
                <Text className="text-xs text-gray-500">Members</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-semibold text-black">{community.products}</Text>
                <Text className="text-xs text-gray-500">Products</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-semibold text-black">{community.posts}</Text>
                <Text className="text-xs text-gray-500">Posts</Text>
              </View>
            </View>
          </View>

          {/* Navigation Tabs */}
          <View className="px-4 mb-4">
            <View className="flex-row items-center border-b border-gray-200">
              <TouchableOpacity
                onPress={() => setActiveTab("Feed")}
                className={`flex-1 py-3 items-center border-b-2 ${
                  activeTab === "Feed" ? "border-[#E72858]" : "border-transparent"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Home size={20} color={activeTab === "Feed" ? "#E72858" : "#666"} />
                  <Text className={`text-sm font-medium ${activeTab === "Feed" ? "text-[#E72858]" : "text-gray-600"}`}>
                    Feed
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("Shop")}
                className={`flex-1 py-3 items-center border-b-2 ${
                  activeTab === "Shop" ? "border-[#E72858]" : "border-transparent"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <ShoppingBag size={20} color={activeTab === "Shop" ? "#E72858" : "#666"} />
                  <Text className={`text-sm font-medium ${activeTab === "Shop" ? "text-[#E72858]" : "text-gray-600"}`}>
                    Shop
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("Trajets")}
                className={`flex-1 py-3 items-center border-b-2 ${
                  activeTab === "Trajets" ? "border-[#E72858]" : "border-transparent"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <MapPin size={20} color={activeTab === "Trajets" ? "#E72858" : "#666"} />
                  <Text className={`text-sm font-medium ${activeTab === "Trajets" ? "text-[#E72858]" : "text-gray-600"}`}>
                    Trajets
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          {activeTab === "Feed" && (
            <>
              <View className="px-4 mb-4">
                <Text className="text-lg font-semibold text-black mb-3">All Posts</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
                  <View className="flex-row gap-3">
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                        className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                          selectedCategory === category.name
                            ? "border-[#E72858] bg-pink-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <category.icon size={16} color={selectedCategory === category.name ? "#E72858" : "#666"} />
                        <Text
                          className={`text-sm font-medium ${
                            selectedCategory === category.name ? "text-[#E72858]" : "text-gray-600"
                          }`}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Posts Feed */}
              <View className="pb-20">
                {communityPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

