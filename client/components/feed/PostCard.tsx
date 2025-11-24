import { View, Text, Image, TouchableOpacity, Pressable, Animated } from "react-native";
import { Play, MessageCircleIcon, Bookmark } from "lucide-react-native";
import icons from "@/constants/icons";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";

function formatCount(num: number): string {
  if (num >= 1e9) return `${parseFloat((num / 1e9).toFixed(1)).toString().replace(/\.0$/, "")}B`;
  if (num >= 1e6) return `${parseFloat((num / 1e6).toFixed(1)).toString().replace(/\.0$/, "")}M`;
  if (num >= 1e3) return `${parseFloat((num / 1e3).toFixed(1)).toString().replace(/\.0$/, "")}K`;
  return String(num);
}

interface Post {
  id: number;
  username: string;
  location?: string;
  avatar: string;
  image: string;
  likes: number;
  comments: number;
  shares: number;
  verified: boolean;
  isLiked: boolean;
  timeAgo?: string;
  hasBookButton?: boolean;
  isVideo?: boolean;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: number) => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const router = useRouter();
  const lastTapRef = useRef(0);
  const scale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);

  const toggleLike = (postId: number) => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    if (onLike) onLike(postId);
  };

  const triggerLikeAnimation = (postId: number) => {
    overlayOpacity.setValue(0);
    scale.setValue(0.5);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1.2, friction: 4, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(overlayOpacity, { toValue: 0, delay: 250, duration: 220, useNativeDriver: true }).start();
    });
  };

  const handleImagePress = (postId: number) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      if (!isLiked) toggleLike(postId);
      triggerLikeAnimation(postId);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      singleTapTimeoutRef.current = setTimeout(() => {
        router.push(`/post/${postId}`);
        singleTapTimeoutRef.current = null;
      }, 300);
    }
  };

  return (
    <View className="mt-4 mb-12 mx-4 border border-[#E0E0E0] rounded-2xl pt-5 bg-white">
      <View className="px-4 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          <Image source={{ uri: post.avatar }} className="w-10 h-10 rounded-full" />
          <View>
            <View className="flex-row items-center gap-1">
              <Text className="font-semibold">{post.username}</Text>
              {post.verified && (
                <View className="bg-blue-500 rounded-full w-5 h-5 items-center justify-center mx-1">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              )}
              {post.timeAgo ? <Text className="text-gray-500 text-sm">{post.timeAgo}</Text> : null}
            </View>
          </View>
        </View>
      </View>

      <View className="relative">
        <Pressable onPress={() => handleImagePress(post.id)}>
          <Image source={{ uri: post.image }} className="w-full h-[400px] rounded-b-2xl" />
        </Pressable>
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            opacity: overlayOpacity,
          }}
        >
          <Animated.Image source={icons.likeActive} style={{ width: 120, height: 120, transform: [{ scale }] }} />
        </Animated.View>
        {post.isVideo && (
          <View className="absolute inset-0 items-center justify-center">
            <View className="bg-black/50 rounded-full p-4">
              <Play size={32} color="#fff" fill="#fff" />
            </View>
          </View>
        )}
      </View>

      <View className="absolute -bottom-6 left-3 bg-white rounded-full py-4 px-4 flex-row items-center justify-between shadow-lg">
        <View className="flex-row items-center gap-5 px-2">
          <View className="flex-row items-center gap-1">
            <TouchableOpacity className="flex-row items-center gap-1" onPress={() => toggleLike(post.id)}>
              {isLiked ? (
                <Image source={icons.likeActive} className="w-5 h-5" />
              ) : (
                <Image source={icons.likeInactive} className="w-5 h-5" />
              )}
              <Text className={`text-sm font-medium ${isLiked ? "text-pink-500" : "text-gray-900"}`}>
                {formatCount(likes)}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center gap-1">
            <MessageCircleIcon size={18} color="#000" />
            <Text className="text-sm font-medium">{formatCount(post.comments)}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="transform rotate-45">
              <MessageCircleIcon size={18} color="#000" />
            </View>
            <Text className="text-sm font-medium">{formatCount(post.shares)}</Text>
          </View>
        </View>
      </View>
      <View className="absolute -bottom-6 right-3 bg-white rounded-full py-4 px-4 flex-row items-center justify-between shadow-lg">
        <Bookmark size={18} color="#000" />
      </View>
    </View>
  );
}

