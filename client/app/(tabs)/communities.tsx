import { useState } from "react";
import { View, Text, ScrollView, TextInput, StatusBar, Image, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, ChevronLeft, Filter } from "lucide-react-native";
import CommunityCard from "@/components/feed/CommunityCard";
import images from "@/constants/images";

const screenWidth = Dimensions.get("window").width;
const padding = 32; // px-4 = 16px * 2
const gap = 16;
const cardWidth = (screenWidth - padding - gap) / 2;

const allCommunities = [
  {
    id: 1,
    name: "Fayssal Vlog",
    followers: "96K Members",
    avatar: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=200",
    image: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 2,
    name: "Fayssal Vlog",
    followers: "96K Members",
    avatar: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=200",
    image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 4,
    name: "Darlene Robertson",
    followers: "96K Members",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
    image: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 5,
    name: "Fayssal Vlog",
    followers: "96K Members",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    image: "https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 7,
    name: "Fayssal Vlog",
    followers: "96K Members",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
    image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 9,
    name: "Fayssal Vlog",
    followers: "96K Members",
    avatar: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=200",
    image: "https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCommunities = allCommunities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <TouchableOpacity>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-black">Communities</Text>
          <View className="flex-row items-center gap-3">
            <Image
              source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' }}
              className="w-8 h-8 rounded-full"
            />
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center bg-white rounded-full px-4 py-2" style={{ boxShadow: '0px 5px 10px 0px rgba(0, 0, 0, 0.1)' }}>
            <Search size={20} color="#666" />
            <TextInput
              placeholder="Search posts, creators, or destinations..."
              placeholderTextColor="#666"
              className="flex-1 ml-2 text-sm"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Communities Grid */}
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={true}
        >
          <View className="px-4 py-4">
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {filteredCommunities.map((community) => (
                <View
                  key={community.id}
                  style={{
                    width: (screenWidth - padding - gap) / 2, // deux cartes par ligne
                    marginBottom: 16,
                  }}
                >
                  <CommunityCard
                    id={community.id}
                    name={community.name}
                    followers={community.followers}
                    avatar={community.avatar}
                    image={community.image}
                    variant="grid"
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
