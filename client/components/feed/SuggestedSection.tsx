// client/components/feed/SuggestedSection.tsx
import { View, Text, ScrollView } from "react-native";
import CommunityCard from "./CommunityCard";
import { useGetCommunitiesNotJoinedQuery, useJoinCommunityMutation } from '@/services/communityApi';
import Toast from 'react-native-toast-message';

export default function SuggestedSection() {
  const { data, isLoading, error, refetch } = useGetCommunitiesNotJoinedQuery({ 
    page: 1, 
    limit: 10 
  });

  const [joinCommunity] = useJoinCommunityMutation();

  const handleJoinCommunity = async (communityId: number) => {
    try {
      const result = await joinCommunity(communityId).unwrap();
      
      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: result.message || 'Vous avez rejoint la communauté !',
        position: 'top',
        visibilityTime: 3000,
      });

      refetch();
    } catch (err: any) {
      console.error('Erreur lors de l\'adhésion:', err);
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: err?.data?.message || 'Impossible de rejoindre la communauté',
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  if (isLoading || error) {
    return null; // Ne rien afficher pendant le chargement ou en cas d'erreur
  }

  const communities = data?.communities || [];

  if (communities.length === 0) {
    return null; // Ne rien afficher si pas de communautés
  }

  return (
    <View className="px-4 my-6">
      <Text className="text-2xl font-semibold mb-6">Suggested for you</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="-mx-4 px-4"
      >
        {communities.map((community: any) => {
          const mainImage = community.communityFiles?.find(
            (file: any) => file.isPrincipale
          );

          return (
            <CommunityCard
              key={community.id}
              id={community.id}
              name={community.name}
              followers={`${community.totalMembers || 0} followers`}
              avatar={mainImage?.url || 'https://via.placeholder.com/80'}
              image={mainImage?.url || 'https://via.placeholder.com/200'}
              variant="horizontal"
              isMember={false}
              onJoin={handleJoinCommunity}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}