import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useGetAllCommunitiesQuery, useGetCommunitiesNotJoinedQuery } from '@/services/communityApi';

export default function CommunitiesModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { data: allResp, isLoading: loadingAll } = useGetAllCommunitiesQuery({ page: 1, limit: 50 }, { skip: !visible });
  const { data: notJoinedResp, isLoading: loadingNotJoined } = useGetCommunitiesNotJoinedQuery({ page: 1, limit: 50 }, { skip: !visible });

  const all = allResp?.communities || [];
  const notJoined = notJoinedResp?.communities || [];
  const notJoinedIds = new Set(notJoined.map((c: any) => c.id));
  const myCommunities = all.filter((c: any) => !notJoinedIds.has(c.id));

  const isLoading = loadingAll || loadingNotJoined;

  const handleCreate = () => {
    onClose();
    router.push('/create-community' as any);
  };

  const handleViewAll = () => {
    onClose();
    router.push('/communities' as any);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 345, height: 375, backgroundColor: '#fff', borderRadius: 19, padding: 16 }}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>Choisissez une communauté</Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <View style={{ backgroundColor: '#F5F5F5', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 }}>
              <TextInput placeholder="Search communities..." style={{ height: 24 }} />
            </View>
          </View>

          {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#E72858" />
            </View>
          ) : myCommunities && myCommunities.length > 0 ? (
            <FlatList
              data={myCommunities}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onClose(); router.push(`/create-post?communityId=${item.id}` as any); }}
                  style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 8 }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: '#666', marginTop: 6 }} numberOfLines={2}>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#333', marginBottom: 18, textAlign: 'center' }}>Vous n'êtes membre d'aucune communauté pour le moment.</Text>
              <TouchableOpacity onPress={handleCreate} style={{ width: '100%', padding: 14, backgroundColor: '#E72858', borderRadius: 10, alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Créer une communauté</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleViewAll} style={{ width: '100%', padding: 14, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E72858' }}>
                <Text style={{ color: '#E72858', fontWeight: '700' }}>Voir les communautés</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 12, right: 12 }}>
            <Text style={{ fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
