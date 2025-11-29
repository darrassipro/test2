import { View, ActivityIndicator, Text } from "react-native";
import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { useGetPostsQuery, useTogglePostLikeMutation } from "@/services/postApi";
import Toast from 'react-native-toast-message';
import emitter from "@/lib/eventEmitter";

export default function PostsSection() {
  const { data, isLoading, error, refetch } = useGetPostsQuery({ 
    source: 'home', 
    page: 1, 
    limit: 20 
  });
  
  const [toggleLike] = useTogglePostLikeMutation();
  const [localPosts, setLocalPosts] = useState<any[]>([]);

  const posts = data?.posts || [];

  const handleToggleLike = async (postId: string | number) => {
    setLocalPosts((prev) => {
      if (prev.length > 0) {
        return prev.map((post: any) => {
          if (post.id === postId) {
            const isLiked = !!post.isLiked;
            const newLikes = isLiked 
              ? Math.max(0, (post.likes || post.likesCount || 0) - 1)
              : (post.likes || post.likesCount || 0) + 1;
            
            return {
              ...post,
              isLiked: !isLiked,
              likes: newLikes,
              likesCount: newLikes,
            };
          }
          return post;
        });
      }
      // If no local posts, use posts from query and update
      return posts.map((post: any) => {
        if (post.id === postId) {
          const isLiked = !!post.isLiked;
          const newLikes = isLiked 
            ? Math.max(0, (post.likes || post.likesCount || 0) - 1)
            : (post.likes || post.likesCount || 0) + 1;
          
          return {
            ...post,
            isLiked: !isLiked,
            likes: newLikes,
            likesCount: newLikes,
          };
        }
        return post;
      });
    });

    try {
      await toggleLike(postId).unwrap();
    } catch (err: any) {
      setLocalPosts([]);
      
      console.error('Error toggling like:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to like post',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  useEffect(() => {
    // Listen for like changes from other screens (e.g., community details)
    const unsubscribe = emitter.on('postLikeChanged', ({ postId, isLiked, likes }) => {
      setLocalPosts((prev) => {
        const update = (postsArr: any[]) =>
          postsArr.map((post: any) =>
            post.id === postId
              ? { ...post, isLiked, likes, likesCount: likes }
              : post
          );
        return prev.length > 0 ? update(prev) : update(posts);
      });
    });
    return () => unsubscribe();
  }, [posts]);

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator size="large" color="#E72858" />
        <Text className="text-gray-500 mt-4 text-sm">Loading posts...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="px-4 my-6">
        <View className="bg-red-50 rounded-2xl p-6 border border-red-200">
          <Text className="text-red-600 text-center font-medium mb-2">
            Unable to load posts
          </Text>
          <Text className="text-sm text-red-500 text-center">
            Please check your connection and try again
          </Text>
        </View>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="px-4 py-16">
        <View className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <Text className="text-center text-gray-600 font-medium mb-2 text-base">
            No posts yet
          </Text>
          <Text className="text-center text-sm text-gray-500">
            Join communities to see posts in your feed!
          </Text>
        </View>
      </View>
    );
  }

  // Use localPosts if we have optimistic updates, otherwise use posts from query
  const displayPosts = localPosts.length > 0 ? localPosts : posts;

  return (
    <View className="pb-4">
      {displayPosts.map((post: any) => {
        // Normalize post data to ensure all fields are accessible
        const normalizedPost = {
          ...post,
          likes: post.likesCount || post.likes || 0,
          comments: post.totalCommentsCount || post.comments || 0,
          shares: post.sharesCount || post.shares || 0,
          user: post.user || {
            firstName: post.username?.split(' ')[0] || 'User',
            lastName: post.username?.split(' ').slice(1).join(' ') || '',
            profileImage: post.avatar || null,
          },
          // Ensure post files are accessible
          postFiles: post.postFiles || (post.image ? [{ url: post.image }] : []),
        };

        return (
          <PostCard
            key={post.id}
            post={normalizedPost}
            onLike={handleToggleLike}
          />
        );
      })}
    </View>
  );
}