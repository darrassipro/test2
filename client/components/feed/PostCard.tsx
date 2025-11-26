import { View, Text, Image, TouchableOpacity, Pressable, Animated } from "react-native";
import { Play, MessageCircleIcon, Bookmark } from "lucide-react-native";
import icons from "@/constants/icons";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import type { Post, PostCardProps } from "@/types/interfaces";

function formatCount(num: number): string {
  if (num >= 1e9) return `${parseFloat((num / 1e9).toFixed(1)).toString().replace(/\.0$/, "")}B`;
  if (num >= 1e6) return `${parseFloat((num / 1e6).toFixed(1)).toString().replace(/\.0$/, "")}M`;
  if (num >= 1e3) return `${parseFloat((num / 1e3).toFixed(1)).toString().replace(/\.0$/, "")}K`;
  return String(num);
}


export default function PostCard({ post, onLike }: PostCardProps) {
  const router = useRouter();
  const lastTapRef = useRef(0);
  const scale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(!!post.isLiked);
  const [likes, setLikes] = useState<number>(post.likes ?? 0);

  const toggleLike = (postId: string | number) => {
    setIsLiked(prev => !prev);
    setLikes(prev => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    if (onLike) onLike(postId);
  };


  const triggerLikeAnimation = (postId: string | number) => {
    overlayOpacity.setValue(0);
    scale.setValue(0.5);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1.2, friction: 4, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(overlayOpacity, { toValue: 0, delay: 250, duration: 220, useNativeDriver: true }).start();
    });
  };

  const handleImagePress = (postId: string | number) => {
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
        router.push(`/post/${String(postId)}`);
        singleTapTimeoutRef.current = null;
      }, 300);
    }
  };

  // Derive display values defensively from server-shaped post
  const authorName = post.user ? `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim() : (post['username'] || 'Unknown');
  const avatarUri = post.user?.profileImage || (post as any).avatar || null;
  const imageUri = post.postFiles && post.postFiles.length > 0 ? post.postFiles[0].url : (post as any).image || null;
  const commentsCount = post.comments ?? 0;
  const sharesCount = post.shares ?? 0;

  return (
    <View className="mt-4 mb-12 mx-4 border border-[#E0E0E0] rounded-2xl pt-5 bg-white">
      <View className="px-4 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} className="w-10 h-10 rounded-full" />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-200" />
          )}
          <View>
            <View className="flex-row items-center gap-1">
              <Text className="font-semibold">{authorName || 'Unknown'}</Text>
              {post.verified && (
                <View className="bg-blue-500 rounded-full w-5 h-5 items-center justify-center mx-1">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              )}
              {post.createdAt ? <Text className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</Text> : null}
            </View>
          </View>
        </View>
      </View>

      <View className="relative">
        <Pressable onPress={() => handleImagePress(post.id)}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-full h-[400px] rounded-b-2xl" />
          ) : (
            <View className="w-full h-[400px] rounded-b-2xl bg-gray-100 items-center justify-center">
              <Text className="text-gray-400">No media</Text>
            </View>
          )}
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
            <Text className="text-sm font-medium">{formatCount(commentsCount)}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="transform rotate-45">
              <MessageCircleIcon size={18} color="#000" />
            </View>
            <Text className="text-sm font-medium">{formatCount(sharesCount)}</Text>
          </View>
        </View>
      </View>
      <View className="absolute -bottom-6 right-3 bg-white rounded-full py-4 px-4 flex-row items-center justify-between shadow-lg">
        <Bookmark size={18} color="#000" />
      </View>
    </View>
  );
}

