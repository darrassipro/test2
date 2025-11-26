import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useGetCommunityMembersQuery } from '@/services/communityApi';
import images from '@/constants/images';

type Props = {
  visible: boolean;
  onClose: () => void;
  communityId: string | undefined | null;
};

const MemberRow = ({ member }: { member: any }) => {
  const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown';
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-100 bg-white">
      <Image
        source={member.profileImage ? { uri: member.profileImage } : images.bg}
        className="w-12 h-12 rounded-full mr-3"
      />
      <View style={{ flex: 1 }}>
        <Text className="text-sm font-medium text-black">{name}</Text>
        <Text className="text-xs text-gray-500">{new Date(member.joinedAt).toLocaleDateString()}</Text>
      </View>
    </View>
  );
};

export default function MembersModal({ visible, onClose, communityId }: Props) {
  const { data, isLoading, isFetching, error } = useGetCommunityMembersQuery(
    { id: communityId as any, page: 1, limit: 200 },
    { skip: !visible || !communityId }
  );

  const members = data?.members || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '80%' }}>
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
              <Text className="text-lg font-semibold">Membres</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {isLoading || isFetching ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#E72858" />
              </View>
            ) : error ? (
              <View style={{ padding: 20 }}>
                <Text className="text-sm text-red-500">Impossible de charger les membres.</Text>
              </View>
            ) : (
              <FlatList
                data={members}
                keyExtractor={(item) => item.id || item.firstName + Math.random()}
                renderItem={({ item }) => <MemberRow member={item} />}
                ItemSeparatorComponent={() => null}
              />
            )}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
