// client/components/feed/PostsSection.tsx
import { View, ActivityIndicator, Text } from "react-native";
import { useState } from "react";
import PostCard from "./PostCard";
import { useGetPostsQuery, useTogglePostLikeMutation } from "@/services/postApi";
import Toast from 'react-native-toast-message';

export default function PostsSection() {
  const { data, isLoading, error, refetch } = useGetPostsQuery({
    source: 'home',
    page: 1,
    limit: 20
  });

  const [toggleLike] = useTogglePostLikeMutation();

  const handleToggleLike = async (postId: string | number) => {
    try {
      await toggleLike(postId).unwrap();
    } catch (err: any) {
      console.error('Erreur lors du like:', err);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de liker le post',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#E72858" />
        <Text className="text-gray-500 mt-4">Chargement des posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="px-4 my-6">
        <View className="bg-red-50 rounded-2xl p-6 border border-red-200">
          <Text className="text-red-600 text-center font-medium mb-2">
            Erreur de chargement
          </Text>
          <Text className="text-sm text-red-500 text-center">
            Impossible de charger les posts publics.
          </Text>
        </View>
      </View>
    );
  }

  const posts = data?.posts || [];

  if (posts.length === 0) {
    return (
      <View className="px-4 py-12">
        <View className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
          <Text className="text-center text-gray-600 font-medium mb-2">
            Aucun post public disponible
          </Text>
          <Text className="text-center text-sm text-gray-500">
            Rejoignez des communautés pour découvrir du contenu !
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {posts.map((post: any) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onLike={handleToggleLike} 
        />
      ))}
    </View>
  );
}