import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import CommunityCard from "./CommunityCard";
import { useGetCommunitiesNotJoinedQuery, useJoinCommunityMutation } from '@/services/communityApi';
import Toast from 'react-native-toast-message';
import { getFileByRole } from '@/utils/helpers';

export default function SuggestedSection() {
  const { data: notJoinedResp, isLoading, error, refetch } = useGetCommunitiesNotJoinedQuery({ 
    page: 1, 
    limit: 10 
  });
  
  const [joinCommunity] = useJoinCommunityMutation();

  const handleJoinCommunity = async (communityId: number) => {
    try {
      const result = await joinCommunity(communityId).unwrap();
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: result.message || 'You joined the community!',
        position: 'top',
        visibilityTime: 3000,
      });
      
      // Refetch to update the list
      refetch();
    } catch (err: any) {
      console.error('Error joining community:', err);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.notJoinedResp?.message || 'Unable to join community',
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  // Don't render anything while loading or if there's an error
  if (isLoading || error) {
    return null;
  }

  const communities = notJoinedResp?.communities || [];

  // Don't render if no communities
  if (communities.length === 0) {
    return null;
  }

  return (
    <View className="my-6">
      <View className="px-4 mb-4">
        <Text className="text-xl font-semibold text-black">
          Suggested for you
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {communities.map((community: any) => {
          const avatarUrl = getFileByRole(community.communityFiles, 'avatar') || 'https://via.placeholder.com/150';
          const bannerUrl = getFileByRole(community.communityFiles, 'banner') || 'https://via.placeholder.com/300';

          return (
            <View key={community.id} style={{ width: 160 }}>
              <CommunityCard
                id={community.id}
                name={community.name}
                followers={`${community.totalMembers || 0} Members`}
                avatar={avatarUrl}
                image={bannerUrl}
                variant="horizontal"
                isMember={false}
                onJoin={handleJoinCommunity}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}