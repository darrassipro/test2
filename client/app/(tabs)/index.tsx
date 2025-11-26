// app/(tabs)/index.tsx ou app/feed.tsx
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, RefreshControl } from "react-native";
import { useState } from "react";
import StoriesSection from "@/components/feed/StoriesSection";
import CreatePostSection from "@/components/feed/CreatePostSection";
import SuggestedSection from "@/components/feed/SuggestedSection";
import PostsSection from "@/components/feed/PostsSection";
import Toast from 'react-native-toast-message';

export default function FeedPage() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Le refresh sera géré automatiquement par RTK Query
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E72858']}
            tintColor="#E72858"
          />
        }
      >
        {/* Section Stories */}
        <StoriesSection />

        {/* Section Créer un Post */}
        <CreatePostSection />

        {/* Section Communautés Suggérées */}
        <SuggestedSection />

        {/* Section Posts Publics */}
        <PostsSection />
      </ScrollView>

      {/* Toast notifications */}
      <Toast />
    </SafeAreaView>
  );
}