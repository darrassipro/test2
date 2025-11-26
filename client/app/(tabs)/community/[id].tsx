import { useState } from "react";
import { View, Text, ScrollView, StatusBar, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Settings, Home, ShoppingBag, MapPin, Edit, Building2, ChefHat, Bike, ImagePlus, Video, Orbit } from "lucide-react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useApprovePostMutation, useRejectPostMutation, useTogglePostLikeMutation } from '@/services/postApi';
import { communityApi } from '@/services/communityApi';
import Toast from 'react-native-toast-message';
import { useAppDispatch } from '@/lib/hooks';
import PostCard from "@/components/feed/PostCard";
import images from "@/constants/images";
import { useGetCommunityByIdQuery } from '@/services/communityApi';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import MembersModal from '@/components/community/MembersModal';


const categories = [
  { id: 1, name: "Riad", icon: Building2 },
  { id: 2, name: "Restaurant", icon: ChefHat },
  { id: 3, name: "Motos", icon: Bike },
  { id: 4, name: "Hotels", icon: Building2 },
  { id: 5, name: "Cafes", icon: ChefHat },
];

export default function CommunityDetails() {

  const { id } = useLocalSearchParams<{ id: string }>();
  const communityId = id as string | undefined;
  const { data, isLoading, error } = useGetCommunityByIdQuery(communityId as any, { skip: !communityId });
  const community = data?.communityInformations || null;
  const communityPosts = data?.communityPosts || [];
  const isUserMemberShip = data?.isUserMemberShip;
  const userRole = data?.userRole || null;
  const [approvePost] = useApprovePostMutation();
  const [rejectPost] = useRejectPostMutation();
  const [togglePostLike] = useTogglePostLikeMutation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState("Feed");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Local state for posts to persist like/unlike
  const [localPosts, setLocalPosts] = useState<any[]>(communityPosts);

  // Sync localPosts with API data
  useEffect(() => {
    setLocalPosts(communityPosts);
  }, [communityPosts]);

  if (data) console.log('GetCommunity data received', { data });
  // Helper: if a string URL is provided return { uri }, otherwise return the local require
  const resolveImageSource = (maybeUrlOrRequire: any) => {
    if (typeof maybeUrlOrRequire === 'string' && maybeUrlOrRequire.length > 0) {
      return { uri: maybeUrlOrRequire };
    }
    return images.bg; // local require (number)
  };

  function formatCount(num: number): string {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`.replace(/\.0$/, "");
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`.replace(/\.0$/, "");
    return String(num);
  }

  // Optional: ensure communityId in router is a string
  useEffect(() => {
    if (!communityId) return;
  }, [communityId]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E72858" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !community) {
    // Try to surface server error message when available to help debugging
    console.log('GetCommunity error', error);
    const serverMessage = (error as any)?.data?.message || (error as any)?.error || (error as any)?.status || null;
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text style={{ fontSize: 16, color: '#333' }}>Impossible de charger la communauté.</Text>
          {serverMessage ? <Text style={{ marginTop: 8, color: '#999' }}>{String(serverMessage)}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  const isModerator = isUserMemberShip && userRole && ['owner','admin','moderator'].includes(userRole);

  const handleLike = async (postId: any) => {
    // Optimistically update local state
    setLocalPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !!post.isLiked;
          const newLikes = isLiked ? Math.max(0, (post.likes || 0) - 1) : (post.likes || 0) + 1;
          return { ...post, isLiked: !isLiked, likes: newLikes };
        }
        return post;
      })
    );
    try {
      await togglePostLike(postId).unwrap();
      // Optionally re-fetch or invalidate cache for accuracy
      try { dispatch(communityApi.util.invalidateTags([{ type: 'Community' }])); } catch (e) {}
    } catch (e) {
      // Revert on error
      setLocalPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            const isLiked = !!post.isLiked;
            const newLikes = !isLiked ? Math.max(0, (post.likes || 0) - 1) : (post.likes || 0) + 1;
            return { ...post, isLiked: isLiked, likes: newLikes };
          }
          return post;
        })
      );
      console.warn('Like failed', e);
    }
  };

  return (
    <>
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2 bg-white z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full">
          <ChevronLeft size={26} color="#111" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-black" numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, textAlign: 'center', marginHorizontal: 8 }}>
          {community?.name || "Communauté"}
        </Text>
        <TouchableOpacity
          onPress={() => {
            // You can navigate to community settings or show a modal here
            // router.push(`/community-settings/${community?.id}`);
          }}
          className="p-2 rounded-full"
        >
          <Settings size={22} color="#111" />
        </TouchableOpacity>
      </View>
      {/* End Header */}

      <Image
        source={images.bg}
        className="absolute w-full h-auto z-0"
        resizeMode="cover"
      />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1">

        
    

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Banner with Profile */}
          <View className="relative">
            <Image
              source={resolveImageSource(community?.communityFiles?.[0]?.url)}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <Image
                source={resolveImageSource(community?.creator?.profileImage || community?.communityFiles?.[0]?.url)}
                className="w-24 h-24 rounded-full border-4 border-white"
              />
            </View>
          </View>

          {/* Profile Info */}
          <View className="mt-16 px-4 items-center">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-xl font-semibold text-black">{community.name}</Text>
              <TouchableOpacity>
                <Edit size={18} color="#666" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-600 text-center mb-4 px-4">
              {community.description}
            </Text>

            {/* Stats */}
            <View className="flex-row items-center gap-6 mb-6">
                <TouchableOpacity onPress={() => setShowMembersModal(true)} className="items-center">
                  <Text className="text-lg font-semibold text-black">{formatCount(community.totalMembers || 0)}</Text>
                  <Text className="text-xs text-gray-500">Membres</Text>
                </TouchableOpacity>
              <View className="items-center">
                <Text className="text-lg font-semibold text-black">{community.totalProducts || 0}</Text>
                <Text className="text-xs text-gray-500">Products</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-semibold text-black">{community.totalPosts || 0}</Text>
                <Text className="text-xs text-gray-500">Posts</Text>
              </View>
            </View>
          </View>

          {/* Navigation Tabs */}
          <View className="px-4 mb-4">
            <View className="flex-row items-center border-b border-gray-200">
              <TouchableOpacity
                onPress={() => setActiveTab("Feed")}
                className={`flex-1 py-3 items-center border-b-2 ${
                  activeTab === "Feed" ? "border-[#E72858]" : "border-transparent"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Home size={20} color={activeTab === "Feed" ? "#E72858" : "#666"} />
                  <Text className={`text-sm font-medium ${activeTab === "Feed" ? "text-[#E72858]" : "text-gray-600"}`}>
                    Feed
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("Shop")}
                className={`flex-1 py-3 items-center border-b-2 ${
                  activeTab === "Shop" ? "border-[#E72858]" : "border-transparent"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <ShoppingBag size={20} color={activeTab === "Shop" ? "#E72858" : "#666"} />
                  <Text className={`text-sm font-medium ${activeTab === "Shop" ? "text-[#E72858]" : "text-gray-600"}`}>
                    Shop
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("Trajets")}
                className={`flex-1 py-3 items-center border-b-2 ${
                  activeTab === "Trajets" ? "border-[#E72858]" : "border-transparent"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <MapPin size={20} color={activeTab === "Trajets" ? "#E72858" : "#666"} />
                  <Text className={`text-sm font-medium ${activeTab === "Trajets" ? "text-[#E72858]" : "text-gray-600"}`}>
                    Trajets
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          {activeTab === "Feed" && (
            <>
              {/* Composer: Create Post / Reel / 360 (Figma) - visible to members */}
              {isUserMemberShip && (
                <View className="mx-4 mt-3 rounded-3xl border border-gray-200 p-4">
                  <Text className="text-lg font-semibold text-black mb-2">Create Post / Reel</Text>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push(`/create-post?communityId=${community.id}&type=post` as any)}
                    className="bg-white rounded-2xl p-3"
                  >
                    <Text className="text-sm text-gray-600">Write something inspiring…</Text>
                    <View className="mt-4 flex-row items-center">
                      <TouchableOpacity
                        className={`flex-row items-center gap-2 rounded-full px-5 py-3 ${'post' === 'post' ? 'border-2 border-pink-500' : 'bg-gray-100'}`}
                        onPress={() => router.push(`/create-post?communityId=${community.id}&type=post` as any)}
                      >
                        <ImagePlus size={18} color={"#111"} />
                        <Text className={`text-sm font-semibold ml-1`}>Post</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="ml-3 flex-row items-center gap-2 rounded-full px-5 py-3 bg-gray-100"
                        onPress={() => router.push(`/create-post?communityId=${community.id}&type=reel` as any)}
                      >
                        <Video size={18} color={"#111"} />
                        <Text className={`text-sm font-semibold ml-1`}>Reel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="ml-3 flex-row items-center gap-2 rounded-full px-5 py-3 bg-gray-100"
                        onPress={() => router.push(`/create-post?communityId=${community.id}&type=360` as any)}
                      >
                        <Orbit size={18} color={"#111"} />
                        <Text className={`text-sm font-semibold ml-1`}>360</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              <View className="px-4 mb-4">
                <Text className="text-lg font-semibold text-black mb-3">All Posts</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
                  <View className="flex-row gap-3">
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                        className={`flex-row items-center gap-2 px-4 py-2 rounded-full border ${
                          selectedCategory === category.name
                            ? "border-[#E72858] bg-pink-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <category.icon size={16} color={selectedCategory === category.name ? "#E72858" : "#666"} />
                        <Text
                          className={`text-sm font-medium ${
                            selectedCategory === category.name ? "text-[#E72858]" : "text-gray-600"
                          }`}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Posts Feed */}
              <View className="pb-20">
                {localPosts.filter((p: any) => p.status === 'approved').map((post: any) => (
                  <PostCard key={post.id} post={post} onLike={handleLike} />
                ))}

                {/* Pending posts for moderators */}
                        {isModerator && (
                  <View className="mt-6 px-4">
                    <Text className="text-lg font-semibold mb-3">Pending posts</Text>
                        {localPosts.filter((p: any) => p.status === 'pending').map((post: any) => (
                      <View key={post.id} className="mb-4 p-3 border border-gray-200 rounded-lg">
                        <PostCard post={post} key={post.id} onLike={handleLike} />
                        <View className="flex-row justify-end gap-3 mt-2">
                                  <TouchableOpacity
                                    className="px-4 py-2 bg-green-500 rounded"
                                    onPress={() => {
                                      Alert.alert(
                                        'Approve post',
                                        'Are you sure you want to approve and publish this post?',
                                        [
                                          { text: 'Cancel', style: 'cancel' },
                                          {
                                            text: 'Approve',
                                            onPress: async () => {
                                                try {
                                                setActionLoading(prev => ({ ...prev, [post.id]: true }));
                                                await approvePost({ communityId: community.id, postId: post.id }).unwrap();
                                                Toast.show({ type: 'success', text1: 'Post approved', text2: 'The post is now published.' });
                                                // Force refetch of community data so UI updates and moderation controls disappear
                                                try {
                                                  dispatch(communityApi.util.invalidateTags([{ type: 'Community' }]));
                                                } catch (err) {
                                                  // fallback: log but don't block user
                                                  console.warn('Failed to invalidate community tags', err);
                                                }
                                              } catch (e: any) {
                                                console.warn('Approve failed', e);
                                                Toast.show({ type: 'error', text1: 'Approve failed', text2: e?.data?.message || e?.message || 'Unable to approve' });
                                              } finally {
                                                setActionLoading(prev => ({ ...prev, [post.id]: false }));
                                              }
                                            }
                                          }
                                        ]
                                      );
                                    }}
                                  >
                                    {actionLoading[post.id] ? (
                                      <ActivityIndicator color="#fff" />
                                    ) : (
                                      <Text className="text-white">Approve</Text>
                                    )}
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    className="px-4 py-2 bg-red-500 rounded"
                                    onPress={() => {
                                      // Open reject modal to collect optional reason
                                      setRejectingPostId(post.id);
                                      setRejectReason('');
                                      setShowRejectModal(true);
                                    }}
                                  >
                                    {actionLoading[post.id] ? (
                                      <ActivityIndicator color="#fff" />
                                    ) : (
                                      <Text className="text-white">Reject</Text>
                                    )}
                                  </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                {/* Reject reason modal */}
                <Modal visible={showRejectModal} transparent animationType="slide" onRequestClose={() => setShowRejectModal(false)}>
                  <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
                    <View style={{ backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Reject post</Text>
                      <Text style={{ color: '#666', marginBottom: 12 }}>Provide an optional reason for rejecting this post (shown to the author).</Text>
                      <TextInput
                        placeholder="Reason (optional)"
                        value={rejectReason}
                        onChangeText={setRejectReason}
                        style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: 'top' }}
                        multiline
                      />
                      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                        <TouchableOpacity onPress={() => { setShowRejectModal(false); setRejectingPostId(null); setRejectReason(''); }} style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                          <Text style={{ color: '#666' }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={async () => {
                            if (!rejectingPostId) return;
                            try {
                              setActionLoading(prev => ({ ...prev, [rejectingPostId]: true }));
                              await rejectPost({ communityId: community.id, postId: rejectingPostId, reason: rejectReason }).unwrap();
                              Toast.show({ type: 'info', text1: 'Post rejected', text2: 'The post has been rejected.' });
                            } catch (e: any) {
                              console.warn('Reject failed', e);
                              Toast.show({ type: 'error', text1: 'Reject failed', text2: e?.data?.message || e?.message || 'Unable to reject' });
                            } finally {
                              setActionLoading(prev => ({ ...prev, [rejectingPostId]: false }));
                              setShowRejectModal(false);
                              setRejectingPostId(null);
                              setRejectReason('');
                            }
                        }} style={{ backgroundColor: '#E72858', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }}>
                          <Text style={{ color: '#fff', fontWeight: '700' }}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
      <MembersModal visible={showMembersModal} onClose={() => setShowMembersModal(false)} communityId={community?.id} />
    </>
  );
}
