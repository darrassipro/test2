import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { ImagePlus, Video, Orbit } from 'lucide-react-native';
import { router } from 'expo-router';

type Props = {
  visible: boolean;
  onClose: () => void;
  communityId?: string | null;
};

export default function CreatePostModal({ visible, onClose, communityId }: Props) {
  const navigate = (type: 'post' | 'reel' | '360') => {
    const base = `/create-post?type=${type}`;
    const url = communityId ? `${base}&communityId=${communityId}` : base;
    onClose();
    // small timeout so modal close animation can run
    setTimeout(() => router.push(url as any), 150);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 210, height: 178, backgroundColor: '#fff', borderRadius: 16, padding: 12, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 173, height: 142, justifyContent: 'center', alignItems: 'stretch' }}>
            <TouchableOpacity onPress={() => navigate('post')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <ImagePlus size={18} color="#1F1F1F" />
              <Text style={{ marginLeft: 12, fontWeight: '600', fontSize: 12 }}>Post</Text>
            </TouchableOpacity>
            <View style={{ height: 0.5, backgroundColor: '#E0E0E0', marginVertical: 6 }} />
            <TouchableOpacity onPress={() => navigate('reel')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <Video size={18} color="#1F1F1F" />
              <Text style={{ marginLeft: 12, fontWeight: '600', fontSize: 12 }}>Reel</Text>
            </TouchableOpacity>
            <View style={{ height: 0.5, backgroundColor: '#E0E0E0', marginVertical: 6 }} />
            <TouchableOpacity onPress={() => navigate('360')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <Orbit size={18} color="#1F1F1F" />
              <Text style={{ marginLeft: 12, fontWeight: '600', fontSize: 12 }}>360</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
