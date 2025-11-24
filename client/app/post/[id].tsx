import { useMemo, useRef, useState } from "react";
import { View, Text, Image, TextInput, FlatList, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowLeftIcon, BookmarkIcon, Calendar, Ellipsis, MapPin, MessageCircle, Share2, UserRoundPlus } from "lucide-react-native";
import icons from "@/constants/icons";

const Details = () => {
  const { id } = useLocalSearchParams();
  const screenWidth = Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = useState(0);

  // Données locales (aucune prop)
  const post = useMemo(
    () => ({
      id: Number(id) || 1,
      user: {
        name: "Fayssal Vlog",
        verified: true,
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
      },
      timeAgo: "2h",
      location: "Palace Restaurant",
      media: [
        { id: "m1", type: "image" as const, uri: "https://images.unsplash.com/photo-1762140170241-7c8e552f25bb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170" },
        { id: "m2", type: "image" as const, uri: "https://images.unsplash.com/photo-1760285352882-287e2334eeab?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171" },
      ],
      stats: { likes: 12566, comments: 215, shares: 26 },
    }),
    [id]
  );

  const comments = useMemo(
    () => [
      {
        id: "c1",
        author: { name: "John Doe", avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100" },
        content:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the",
        likes: 12566,
        comments: 215,
        time: "Yesterday At 21:12",
        replies: [
          {
            id: "r1",
            author: { name: "David David", avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100" },
            content:
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the",
            likes: 12566,
            comments: 215,
            time: "Yesterday At 21:12",
          },
        ],
      },
      {
        id: "c2",
        author: { name: "John Doe", avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100" },
        content:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the",
        likes: 12566,
        comments: 215,
        time: "Yesterday At 21:12",
        replies: [],
      },
    ],
    []
  );

  const formatCount = (num: number) => {
    if (num >= 1e9) return `${parseFloat((num / 1e9).toFixed(1)).toString().replace(/\.0$/, "")}B`;
    if (num >= 1e6) return `${parseFloat((num / 1e6).toFixed(1)).toString().replace(/\.0$/, "")}M`;
    if (num >= 1e3) return `${parseFloat((num / 1e3).toFixed(1)).toString().replace(/\.0$/, "")}K`;
    return String(num);
  };

  const renderMedia = ({ item }: any) => {
    // Pour simplicité, uniquement images; une vidéo aurait un overlay similaire à l'écran feed
    return (
      <View style={{ width: screenWidth, height: 300 }} className="bg-black items-center justify-center">
        <Image
          source={{ uri: item.uri }}
          className="w-full h-full object-contain"
          resizeMode="contain"
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      {/* Header du post */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="mr-1" onPress={() => router.back()}>
            <ArrowLeftIcon size={20} color="#000" />
          </TouchableOpacity>
          <Image source={{ uri: post.user.avatar }} className="w-10 h-10 rounded-full" />
          <View>
            <View className="flex-row items-center gap-1">
              <Text className="font-semibold">{post.user.name}</Text>
              {post.user.verified ? (
                <View className="bg-blue-500 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              ) : null}
              <Text className="text-gray-500 text-xs ml-1">{post.timeAgo}</Text>
            </View>
            <Text className="text-gray-500 text-xs">{post.location}</Text>
          </View>
        </View>
        <TouchableOpacity className="px-4 py-1.5 rounded-full flex-row items-center gap-1">
          <UserRoundPlus size={18} color="#E72858" />
          <Text className="text-[#E72858] text-sm ml-1 font-semibold">Join</Text>
        </TouchableOpacity>
      </View>

      {/* Slider */}
      <View className="relative">
        <FlatList
          data={post.media}
          keyExtractor={(m) => m.id}
          renderItem={renderMedia}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setActiveIndex(index);
          }}
        />
        {/* Overlays top-left / top-right */}
        <View className="absolute top-3 left-3 bg-white rounded-full px-3 py-1.5 flex-row items-center gap-1">
          <MapPin size={14} color="#111" />
          <Text className="text-sm font-semibold">{post.location}</Text>
        </View>
        <TouchableOpacity className="absolute top-3 right-3 bg-[#E72858] px-4 py-1.5 rounded-full flex-row items-center gap-1">
          <Calendar size={15} color="#fff" />
          <Text className="text-white text-sm font-semibold ml-2">Book now</Text>
        </TouchableOpacity>
        {/* Indicateurs */}
        <View className="absolute bottom-2 w-full items-center">
          <View className="flex-row gap-1 bg-black/30 rounded-full px-2 py-1">
            {post.media.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full ${i === activeIndex ? "bg-white w-6" : "bg-white/60 w-2"}`}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Bar flottante likes / comments / share + bookmark */}
      <View className="px-4 mt-3">
        <View className="flex-row items-center justify-between">
          <View className="bg-white rounded-full py-3 px-4 flex-row items-center justify-between shadow-lg">
            <View className="flex-row items-center gap-6 px-1">
              <View className="flex-row items-center gap-1">
                <Image source={icons.likeInactive} className="w-5 h-5" />
                <Text className="text-sm font-medium">{formatCount(post.stats.likes)}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <MessageCircle size={18} color="#000" />
                <Text className="text-sm font-medium">{formatCount(post.stats.comments)}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Share2 size={18} color="#000" />
                <Text className="text-sm font-medium">{formatCount(post.stats.shares)}</Text>
              </View>
            </View>
          </View>
          <View className="bg-white rounded-full py-3 px-4 flex-row items-center justify-between shadow-lg">
            <BookmarkIcon size={18} color="#0F0F0F" />
          </View>
        </View>
      </View>

      {/* Section commentaires avec scroll */}
      <View className="flex-1">
        <ScrollView className="flex-1 px-4 mt-6" contentContainerStyle={{ paddingBottom: 16 }}>
          <Text className="text-2xl font-bold mb-4">Comments</Text>

          {comments.map((c) => (
            <View key={c.id} className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-3">
                  <Image source={{ uri: c.author.avatar }} className="w-8 h-8 rounded-full" />
                  <Text className="font-semibold">{c.author.name}</Text>
                </View>
                <Ellipsis size={18} color="#111" />
              </View>
              <Text className="text-gray-700 mt-3">{c.content}</Text>
              <View className="flex-row items-center justify-between mt-4">
                <View className="flex-row items-center gap-6">
                  <View className="flex-row items-center gap-1">
                    <Image source={icons.likeInactive} className="w-5 h-5" />
                    <Text className="text-sm">{formatCount(c.likes)}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MessageCircle size={16} color="#111" />
                    <Text className="text-sm">{formatCount(c.comments)}</Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-xs">{c.time}</Text>
              </View>

              {/* Ligne grise + replies */}
              {c.replies.length > 0 && (
                <View className="mt-4">
                  <View className="flex-row">
                    {/* Trait vertical gris entre parent et reply */}
                    <View className="w-0.5 bg-gray-200 mr-3 ml-4" />
                    <View className="flex-1 bg-rose-50 rounded-2xl p-3 border border-gray-200">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-row items-center gap-2">
                          <Image
                            source={{ uri: c.replies[0].author.avatar }}
                            className="w-8 h-8 rounded-full"
                          />
                          <Text className="font-semibold">{c.replies[0].author.name}</Text>
                        </View>
                        <Ellipsis size={18} color="#111" />
                      </View>
                      <Text className="text-gray-700 mt-2">{c.replies[0].content}</Text>
                      <View className="flex-row items-center justify-between mt-3">
                        <View className="flex-row items-center gap-6">
                          <View className="flex-row items-center gap-1">
                            <Image source={icons.likeInactive} className="w-5 h-5" />
                            <Text className="text-sm">{formatCount(c.replies[0].likes)}</Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <MessageCircle size={16} color="#111" />
                            <Text className="text-sm">{formatCount(c.replies[0].comments)}</Text>
                          </View>
                        </View>
                        <Text className="text-gray-500 text-xs">{c.replies[0].time}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Input bas */}
      <View className="px-4 py-3 bg-white border-t border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <TextInput
            placeholder="Have something to say? Add a comment..."
            placeholderTextColor="#9CA3AF"
            className="flex-1"
          />
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
            <Image source={icons.send} className="w-7 h-7" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Details;
