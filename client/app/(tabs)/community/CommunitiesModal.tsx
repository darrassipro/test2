import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, CheckCircle } from 'lucide-react-native';
import { useGetAllCommunitiesQuery, useGetCommunitiesNotJoinedQuery } from '@/services/communityApi';

export default function CommunitiesModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  // track which community was tapped so we can show the checked state
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  const { data: allResp, isLoading: loadingAll } = useGetAllCommunitiesQuery({ page: 1, limit: 50 }, { skip: !visible });
  const { data: notJoinedResp, isLoading: loadingNotJoined } = useGetCommunitiesNotJoinedQuery({ page: 1, limit: 50 }, { skip: !visible });

  const all = allResp?.communities || [];
  const notJoined = notJoinedResp?.communities || [];
  const notJoinedIds = new Set(notJoined.map((c: any) => c.id));
  const myCommunities = all.filter((c: any) => !notJoinedIds.has(c.id));

  const isLoading = loadingAll || loadingNotJoined;
  const formatMembers = (count: number | null | undefined) => {
    const n = Number(count) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M Members`;
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K Members`;
    return `${n} Members`;
  };

  const filteredCommunities = myCommunities.filter((c: any) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    onClose();
    router.push('/create-community' as any);
  };

  const handleViewAll = () => {
    onClose();
    router.push('/communities' as any);
  };

  const handleSelectCommunity = (community: any) => {
    // mark selected so the item shows a filled check
    setSelectedCommunityId(String(community.id));
    // small delay to let the UI show the selection briefly before closing/navigating
    setTimeout(() => {
      onClose();
      router.push(`/create-post?communityId=${community.id}` as any);
    }, 180);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 66 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{ 
            width: 345, 
            backgroundColor: '#FFFFFF', 
            borderRadius: 19,
            paddingTop: 12,
            paddingBottom: 18,
            marginBottom: 8,
            position: 'relative'
          }}
        >
          {/* Title */}
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ 
              fontFamily: 'Inter_500Medium',
              fontSize: 14,
              lineHeight: 27,
              textAlign: 'center',
              color: '#000000',
            }}>
              Choose a community to post
            </Text>
          </View>

          {/* Search Bar */}
          <View style={{ paddingHorizontal: 13.5, marginBottom: 18 }}>
            <View style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F5F5F5',
              borderRadius: 864,
              paddingHorizontal: 13,
              paddingVertical: 11,
              gap: 6.5,
            }}>
              <Search size={20} color="#1A2038" strokeWidth={1.32} />
              <TextInput
                placeholder="Search posts, creators, or destinations…"
                placeholderTextColor="#1A2038"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  flex: 1,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11.5,
                  color: '#1A2038',
                  padding: 0,
                }}
              />
            </View>
          </View>

          {/* Communities List */}
          <View style={{ maxHeight: 240, paddingHorizontal: 13.5 }}>
            {isLoading ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#E72858" />
              </View>
            ) : filteredCommunities.length > 0 ? (
              <FlatList
                data={filteredCommunities}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                  <View style={{ 
                    height: 0.5, 
                    backgroundColor: '#E0E0E0', 
                    marginHorizontal: 0,
                    borderRadius: 3 
                  }} />
                )}
                renderItem={({ item }) => {
                  const avatarUri = item.creator?.profileImage || item.communityFiles?.[0]?.url || 'https://via.placeholder.com/41';
                  const memberCount = item.totalMembers || 0;
                  return (
                    <TouchableOpacity
                      onPress={() => handleSelectCommunity(item)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        position: 'relative',
                      }}
                    >
                      {/* Avatar and Text */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5.8, flex: 1 }}>
                        {/* Avatar */}
                        <Image
                          source={{ uri: avatarUri }}
                          style={{
                            width: 40.7,
                            height: 40.7,
                            borderRadius: 20.35,
                            backgroundColor: '#000000',
                          }}
                        />
                        
                        {/* Name and Members */}
                        <View style={{ 
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: 2.9,
                        }}>
                          <Text 
                            style={{
                              fontFamily: 'Inter_500Medium',
                              fontWeight: '600',
                              fontSize: 13.08,
                              lineHeight: 16,
                              color: '#000000',
                            }}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text style={{
                            fontFamily: 'Inter_500Medium',
                            fontSize: 11.63,
                            lineHeight: 14,
                            color: '#5B5B5B',
                          }}>
                              {formatMembers(memberCount)}
                          </Text>
                        </View>
                      </View>

                      {/* Check Circle Icon */}
                      <View style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: [{ translateY: -12 }],
                      }}>
                        {selectedCommunityId === String(item.id) ? (
                          <CheckCircle size={24} color="#f00a0aff" fill="none" />
                        ) : (
                          // outlined/muted state for non-selected items
                          <CheckCircle size={24} color="#BDBDBD" fill="none" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View style={{ padding: 20, alignItems: 'center', gap: 18 }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: '#333', 
                  textAlign: 'center',
                  fontFamily: 'Inter_500Medium',
                }}>
                  {searchQuery ? 'No communities found' : 'You are not a member of any community yet.'}
                </Text>
                {!searchQuery && (
                  <>
                    <TouchableOpacity
                      onPress={handleCreate}
                      style={{
                        width: '100%',
                        padding: 14,
                        backgroundColor: '#E72858',
                        borderRadius: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ 
                        color: '#fff', 
                        fontWeight: '700',
                        fontFamily: 'Inter_500Medium',
                      }}>
                        Create a community
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleViewAll}
                      style={{
                        width: '100%',
                        padding: 14,
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#E72858',
                      }}
                    >
                      <Text style={{ 
                        color: '#E72858', 
                        fontWeight: '700',
                        fontFamily: 'Inter_500Medium',
                      }}>
                        View communities
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
        {/* triangular notch connecting modal to tabs (centered) */}
        <View style={{
          position: 'absolute',
          bottom: 60,
          left: '50%',
          marginLeft: -14,
          width: 0,
          height: 0,
          borderLeftWidth: 14,
          borderRightWidth: 14,
          borderTopWidth: 14,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: '#FFFFFF',
        }} />
      </TouchableOpacity>
    </Modal>
  );
}