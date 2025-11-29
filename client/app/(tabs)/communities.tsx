import { useState } from "react";
import { View, Text, ScrollView, TextInput, StatusBar, Image, TouchableOpacity, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, ChevronLeft, Filter } from "lucide-react-native";
import CommunityCard from "@/components/feed/CommunityCard";
import images from "@/constants/images";
import { useGetAllCommunitiesQuery, useGetCommunitiesNotJoinedQuery, useJoinCommunityMutation } from '@/services/communityApi';
import { getFileByRole } from '@/utils/helpers';
import { useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/services/slices/userSlice';

const screenWidth = Dimensions.get("window").width;
const padding = 32; // px-4 = 16px * 2
const gap = 16;
const cardWidth = (screenWidth - padding - gap) / 2;

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allResp, isLoading: loadingAll } = useGetAllCommunitiesQuery({ page: 1, limit: 50 });
  const { data: notJoinedResp, isLoading: loadingNotJoined } = useGetCommunitiesNotJoinedQuery({ page: 1, limit: 50 });
  const [joinCommunity] = useJoinCommunityMutation();

  const all = allResp?.communities || [];
  const notJoined = notJoinedResp?.communities || [];

  const notJoinedIds = new Set(notJoined.map((c: any) => c.id));
  const myCommunities = all.filter((c: any) => !notJoinedIds.has(c.id));
  // Show only communities not joined.
  const suggested = all.filter((c: any) => notJoinedIds.has(c.id));
  const user = useAppSelector(selectUser);

  
  const filteredMy = myCommunities.filter((community: any) => community.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSuggested = suggested.filter((community: any) => community.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleJoin = async (id: number) => {
    console.log('Attempting to join community id=', id);
    try {
      const res = await joinCommunity(id).unwrap();
      console.log('Join response:', res);
      Alert.alert('Joined', 'You have joined the community.');
    } catch (e: any) {
      console.warn('Join failed', e);
      Alert.alert('Error', e?.data?.message || e?.message || 'Failed to join');
    }
  };

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
          <Text className="text-lg font-semibold text-black">Communities</Text>
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
          </View>
        </View>

        {/* Communities Grid */}
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={true}
        >
          <View className="px-4 py-4">
            {/* My Communities */}
            <Text className="text-lg font-semibold mb-3">My communities</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {filteredMy.map((community: any) => {
                const avatarUrl = community.creator?.profileImage || getFileByRole(community.communityFiles, 'avatar') || 'https://via.placeholder.com/150';
                const bannerUrl = getFileByRole(community.communityFiles, 'banner') || 'https://via.placeholder.com/300';
                const isOwner = user && community.creator && community.creator.id === user.id;
                return (
                  <View
                    key={community.id}
                    style={{
                      width: (screenWidth - padding - gap) / 2,
                      marginBottom: 16,
                      position: 'relative'
                    }}
                  >
                    {/* Owner label in top-right corner of the card */}
                    {isOwner && (
                      <View style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 2,
                        backgroundColor: '#FFE8EE',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: '#E72858',
                          fontWeight: 'bold',
                        }}>
                          Owner
                        </Text>
                      </View>
                    )}
                    <CommunityCard
                      id={community.id}
                      name={community.name}
                      followers={`${community.totalMembers || 0} Members`}
                      avatar={avatarUrl}
                      image={bannerUrl}
                      variant="grid"
                      isMember={true}
                    />
                  </View>
                );
              })}
            </View>

            {/* Suggested / Not joined */}
            <Text className="text-lg font-semibold mt-6 mb-3">Suggested for you</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {filteredSuggested.map((community: any) => {
                const avatarUrl = getFileByRole(community.communityFiles, 'avatar') || 'https://via.placeholder.com/150';
                const bannerUrl = getFileByRole(community.communityFiles, 'banner') || 'https://via.placeholder.com/300';

                return (
                  <View
                    key={community.id}
                    style={{
                      width: (screenWidth - padding - gap) / 2,
                      marginBottom: 16,
                    }}
                  >
                    <CommunityCard
                      id={community.id}
                      name={community.name}
                      followers={`${community.totalMembers || 0} Members`}
                      avatar={avatarUrl}
                      image={bannerUrl}
                      variant="grid"
                      isMember={false}
                      onJoin={handleJoin}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
