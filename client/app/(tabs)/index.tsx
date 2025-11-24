import { View, Text, ScrollView, Image, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MessageCircle, Search } from 'lucide-react-native';
import images from '@/constants/images';  
import icons from '@/constants/icons';
import StoriesSection from '@/components/feed/StoriesSection';
import CreatePostSection from '@/components/feed/CreatePostSection';
import PostsSection from '@/components/feed/PostsSection';
import SuggestedSection from '@/components/feed/SuggestedSection';

// Sections sont auto‑contenues: pas de props, données locales dans chaque composant

export default function FeedScreen() {
  return (
    <SafeAreaView className="flex-1 h-full bg-white" edges={['left','right']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <Image
        source={images.bg}
        className="absolute w-full h-auto z-0"
        resizeMode="cover"
      />
      <View className="flex-1 h-full mt-10">
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
          <View className="flex-row items-center gap-4">
            <Image source={icons.logo} className="w-8 h-8" /> 
          </View>
          <View className="flex-row items-center gap-4">
            <Bell size={24} color="#000" />
            <MessageCircle size={24} color="#000" />
            <Image
              source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' }}
              className="w-8 h-8 rounded-full"
            />
          </View>
        </View>

        <ScrollView className="flex-1 h-full" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="px-4 py-4">
            <View className="flex-row items-center bg-white rounded-full px-4 py-2" style={{ boxShadow: '0px 5px 10px 0px rgba(0, 0, 0, 0.1)' }}>
              <Search size={20} color="#666" />
              <TextInput
                placeholder="Search posts, creators, or destinations..."
                placeholderTextColor="#666"
                className="flex-1 ml-2 text-sm"
              />
            </View>
          </View>

          <StoriesSection />
          <CreatePostSection />
          <PostsSection />
          <SuggestedSection />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
