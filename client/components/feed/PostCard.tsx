import { View, Text, Image, TouchableOpacity, Pressable, Animated, Dimensions, ActivityIndicator } from "react-native";
import { MessageCircleIcon, Bookmark, UserRoundPlus, UserCheck, MapPin, Calendar } from "lucide-react-native";
import icons from "@/constants/icons";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import type { Post, PostCardProps } from "@/types/interfaces";
import { useJoinCommunityMutation } from '@/services/communityApi';
import Toast from 'react-native-toast-message';

const screenWidth = Dimensions.get("window").width;

function formatCount(num: number): string {
  if (num >= 1e9) return `${parseFloat((num / 1e9).toFixed(1)).toString().replace(/\.0$/, "")}B`;
  if (num >= 1e6) return `${parseFloat((num / 1e6).toFixed(1)).toString().replace(/\.0$/, "")}M`;
  if (num >= 1e3) return `${parseFloat((num / 1e3).toFixed(1)).toString().replace(/\.0$/, "")}K`;
  return String(num);
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const router = useRouter();
  const lastTapRef = useRef(0);
  const scale = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Local state for immediate UI feedback
  const [isLiked, setIsLiked] = useState<boolean>(!!post.isLiked);
  const [likes, setLikes] = useState<number>(post.likes ?? 0);
  const [joinCommunity, { isLoading: isJoining }] = useJoinCommunityMutation();
  const [isMemberLocal, setIsMemberLocal] = useState<boolean>(post.isMember ?? false);

  // Sync with props when they change (from API updates)
  useEffect(() => {
    setIsLiked(!!post.isLiked);
    setLikes(post.likes ?? 0);
  }, [post.isLiked, post.likes]);

  // keep local membership state in sync with prop
  useEffect(() => {
    setIsMemberLocal(post.isMember ?? false);
  }, [post.isMember]);
  
  const toggleLike = (postId: string | number) => {
    setIsLiked(prev => !prev);
    setLikes(prev => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    if (onLike) onLike(postId);
  };

  const triggerLikeAnimation = (postId: string | number) => {
    overlayOpacity.setValue(0);
    scale.setValue(0.5);
    
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true
      }),
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 4,
        useNativeDriver: true
      }),
    ]).start(() => {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        delay: 250,
        duration: 220,
        useNativeDriver: true
      }).start();
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

  const handleJoinCommunity = async () => {
    if (!post.community?.id || isJoining) return;
    
    try {
      await joinCommunity(post.community.id).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `You joined ${post.community.name}!`,
        position: 'top',
        visibilityTime: 3000,
      });
      // update local UI to show joined state
      setIsMemberLocal(true);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.data?.message || 'Failed to join community',
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  // Extract data
  const authorName = post.user 
    ? `${post.user.firstName || ''} ${post.user.lastName || ''}`.trim() 
    : (post['username'] || 'Unknown');
  
  const avatarUri = post.user?.profileImage || (post as any).avatar || null;
  const imageUri = post.postFiles && post.postFiles.length > 0 
    ? post.postFiles[0].url 
    : (post as any).image || null;
  
  const commentsCount = post.comments ?? 0;
  const sharesCount = post.shares ?? 0;
  const isPublicPost = post.isVisibleOutsideCommunity;
  const communityName = post.community?.name;
  const isMemberOfCommunity = post.isMember ?? false;

  return (
    <View className="mb-6 mx-4 border border-[#E0E0E0] rounded-2xl bg-white overflow-hidden">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} className="w-10 h-10 rounded-full" />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-200" />
          )}
          
          <View className="flex-1">
            <View className="flex-row items-center gap-1 flex-wrap">
              <Text className="font-semibold text-black" numberOfLines={1}>
                {authorName}
              </Text>
              
              {post.verified && (
                <View className="bg-blue-500 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              )}
              
              {post.createdAt && (
                <Text className="text-gray-500 text-xs ml-1">
                  • {timeAgo(post.createdAt)}
                </Text>
              )}
            </View>
            
            {/* Community name for public posts */}
            {communityName && (
              <TouchableOpacity 
                onPress={() => post.community?.id && router.push(`/community/${post.community.id}`)}
                activeOpacity={0.7}
              >
                <Text className="text-gray-600 text-xs mt-0.5" numberOfLines={1}>
                  {communityName}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Join button for public posts when user is not a member; show Joined state when member */}
        {isPublicPost && post.community?.id && (
          isMemberLocal ? (
            <View className="px-4 py-1.5 rounded-full flex-row items-center gap-1 bg-green-50 border border-green-200">
              <UserCheck size={14} color="#10B981" />
              <Text className="text-[#059669] text-xs font-semibold">Joined</Text>
            </View>
          ) : (
            <TouchableOpacity 
              className="px-4 py-1.5 rounded-full flex-row items-center gap-1 bg-pink-50 border border-pink-200"
              onPress={handleJoinCommunity}
              disabled={isJoining}
            >
              {isJoining ? (
                <ActivityIndicator size="small" color="#E72858" />
              ) : (
                <>
                  <UserRoundPlus size={14} color="#E72858" />
                  <Text className="text-[#E72858] text-xs font-semibold">Join</Text>
                </>
              )}
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Post Title */}
      {post.title && (
        <View className="px-4 pb-2">
          <Text className="text-sm font-medium text-black" numberOfLines={2}>
            {post.title}
          </Text>
        </View>
      )}

      {/* Image with overlays */}
      <View className="relative">
        <Pressable onPress={() => handleImagePress(post.id)}>
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              className="w-full h-[400px]"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-[400px] bg-gray-100 items-center justify-center">
              <Text className="text-gray-400">No media</Text>
            </View>
          )}
        </Pressable>

        {/* Like Animation Overlay */}
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
          <Animated.Image
            source={icons.likeActive}
            style={{
              width: 120,
              height: 120,
              transform: [{ scale }]
            }}
          />
        </Animated.View>

        {/* Location overlay */}
        {post.location && (
          <View className="absolute top-3 left-3 bg-white rounded-full px-3 py-1.5 flex-row items-center gap-1 shadow-sm">
            <MapPin size={12} color="#111" />
            <Text className="text-xs font-semibold text-black" numberOfLines={1}>
              {post.location}
            </Text>
          </View>
        )}

        {/* Book Now button for hotels */}
        {post.hotelNuiteeId && (
          <TouchableOpacity className="absolute top-3 right-3 bg-[#E72858] px-4 py-1.5 rounded-full flex-row items-center gap-1 shadow-lg">
            <Calendar size={13} color="#fff" />
            <Text className="text-white text-xs font-semibold">Book now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      {post.description && (
        <View className="px-4 pt-3 pb-2">
          <Text className="text-sm text-gray-800" numberOfLines={3}>
            {post.description}
          </Text>
        </View>
      )}

      {/* Action Bar */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        {/* Left actions */}
        <View className="bg-white rounded-full py-2.5 px-4 flex-row items-center gap-5 shadow-sm border border-gray-100">
          <TouchableOpacity 
            className="flex-row items-center gap-1.5"
            onPress={() => toggleLike(post.id)}
          >
            {isLiked ? (
              <Image source={icons.likeActive} className="w-5 h-5" />
            ) : (
              <Image source={icons.likeInactive} className="w-5 h-5" />
            )}
            <Text className={`text-sm font-medium ${isLiked ? "text-pink-500" : "text-gray-900"}`}>
              {formatCount(likes)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center gap-1.5"
            onPress={() => router.push(`/post/${String(post.id)}`)}
          >
            <MessageCircleIcon size={18} color="#000" />
            <Text className="text-sm font-medium">{formatCount(commentsCount)}</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-1.5">
            <View className="transform rotate-45">
              <MessageCircleIcon size={18} color="#000" />
            </View>
            <Text className="text-sm font-medium">{formatCount(sharesCount)}</Text>
          </View>
        </View>

        {/* Bookmark */}
        <TouchableOpacity className="bg-white rounded-full p-2.5 shadow-sm border border-gray-100">
          <Bookmark size={18} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}