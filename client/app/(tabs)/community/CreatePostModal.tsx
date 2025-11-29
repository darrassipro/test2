import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { ImagePlus, Video, Orbit, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';

type Props = {
  visible: boolean;
  onClose: () => void;
  communityId?: string | null;
};

export default function CreatePostModal({ visible, onClose, communityId }: Props) {
  const navigate = (type: 'post' | 'reel' | '360' | 'trajet') => {
    const base = `/create-post?type=${type}`;
    const url = communityId ? `${base}&communityId=${communityId}` : base;
    onClose();
    // small timeout so modal close animation can run
    setTimeout(() => router.push(url as any), 150);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 66 }}
        activeOpacity={1}
        onPress={onClose}
      >
          <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            width: 210,
            height: 178,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 18,
            marginBottom: 8,
            position: 'relative'
          }}
        >
          <View
            style={{
              width: 173,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Post */}
            <TouchableOpacity
              onPress={() => navigate('post')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                width: 173,
                height: 18,
              }}
            >
              <ImagePlus size={18} color="#1F1F1F" strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontWeight: '600',
                  fontSize: 12,
                  lineHeight: 15,
                  color: '#1F1F1F',
                }}
              >
                Post
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                width: 210,
                height: 0.5,
                backgroundColor: '#E0E0E0',
              }}
            />

            {/* Trajet */}
            <TouchableOpacity
              onPress={() => navigate('trajet')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                width: 173,
                height: 16.55,
              }}
            >
              <MapPin size={18} color="#1F1F1F" strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontWeight: '600',
                  fontSize: 12,
                  lineHeight: 15,
                  color: '#1F1F1F',
                }}
              >
                Trajet
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                width: 210,
                height: 0.5,
                backgroundColor: '#E0E0E0',
              }}
            />

            {/* Reel */}
            <TouchableOpacity
              onPress={() => navigate('reel')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                width: 173,
                height: 18,
              }}
            >
              <Video size={18} color="#1F1F1F" strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontWeight: '600',
                  fontSize: 12,
                  lineHeight: 15,
                  color: '#1F1F1F',
                }}
              >
                Reel
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                width: 210,
                height: 0.5,
                backgroundColor: '#E0E0E0',
              }}
            />

            {/* 360 */}
            <TouchableOpacity
              onPress={() => navigate('360')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                width: 173,
                height: 18,
              }}
            >
              <Orbit size={18} color="#1F1F1F" strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontWeight: '600',
                  fontSize: 12,
                  lineHeight: 15,
                  color: '#1F1F1F',
                }}
              >
                360
              </Text>
            </TouchableOpacity>
          </View>
          {/* triangular notch connecting modal to tabs */}
          <View style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            marginLeft: -10,
            width: 0,
            height: 0,
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderTopWidth: 10,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: '#FFFFFF',
          }} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}