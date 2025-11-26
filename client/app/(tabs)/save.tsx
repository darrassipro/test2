import { useState } from "react";
import { View, Text, ScrollView, TextInput, StatusBar, Image, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, ChevronLeft, Filter, ShoppingBag } from "lucide-react-native";
import { useRouter } from "expo-router";
import images from "@/constants/images";

const screenWidth = Dimensions.get("window").width;
const pagePadding = 32; // px-4 = 16px * 2
const groupGap = 12; // espace entre les deux groupes
const borderPadding = 16; // padding de la bordure (8px de chaque côté)
const imageGap = 8; // espace entre les images dans la grille

// Largeur de chaque groupe
const groupWidth = (screenWidth - pagePadding * 2 - groupGap) / 2;

// Largeur disponible pour les images (après soustraction du padding de la bordure)
const availableWidth = groupWidth - borderPadding;

// Taille de chaque image : (largeur disponible - gap entre les 2 images) / 2
const imageSize = (availableWidth - imageGap) / 2;

const placesImages = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/2467558/pexels-photo-2467558.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 3,
    image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 4,
    image: "https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

const hotelsImages = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 3,
    image: "https://images.pexels.com/photos/261181/pexels-photo-261181.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 4,
    image: "https://images.pexels.com/photos/261185/pexels-photo-261185.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

export default function Save() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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
          <Text className="text-lg font-semibold text-black">Saved Posts</Text>
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
            <TouchableOpacity className="ml-2">
              <Filter size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Sections */}
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="px-4 pt-5">
            <View style={{ flexDirection: "row", display: "flex", alignItems: "center", justifyContent: "center" , gap : 5}}>
              {/* Places Section */}
              <TouchableOpacity 
                style={{ width: groupWidth, marginRight: groupGap }}
                onPress={() => router.push("/saved/places")}
              >
                <View style={{ 
                  borderWidth: 1, 
                  borderColor: "#E5E7EB", 
                  borderRadius: 12, 
                  padding: 8,
                  marginBottom: 12,
                }}>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                    }}
                  >
                    {placesImages.map((item, index) => (
                      <Image
                        key={item.id}
                        source={{ uri: item.image }}
                        style={{
                          width: imageSize,
                          height: imageSize,
                          borderRadius: 12,
                          marginBottom: imageGap,
                        }}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                </View>
                <Text className="text-center text-base font-semibold text-black">Places</Text>
              </TouchableOpacity>

              {/* Hotels Section */}
              <TouchableOpacity 
                style={{ width: groupWidth }}
                onPress={() => router.push("/saved/hotels")}
              >
                <View style={{ 
                  borderWidth: 1, 
                  borderColor: "#E5E7EB", 
                  borderRadius: 12, 
                  padding: 8,
                  marginBottom: 12,
                }}>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                    }}
                  >
                    {hotelsImages.map((item, index) => (
                      <Image
                        key={item.id}
                        source={{ uri: item.image }}
                        style={{
                          width: imageSize,
                          height: imageSize,
                          borderRadius: 12,
                          marginBottom: imageGap,
                        }}
                        resizeMode="cover"
                      />
                    ))}
                  </View>
                </View>
                <Text className="text-center text-base font-semibold text-black">Hotels</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
