import { useState, useMemo } from "react";
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
import { useEffect, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MembersModal from '@/components/community/MembersModal';
import emitter from '@/lib/eventEmitter';

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
  
  const stableCommunityId = useMemo(() => communityId, [communityId]);
  
  const { data, isLoading, error, refetch } = useGetCommunityByIdQuery(stableCommunityId as any, {
    skip: !stableCommunityId,
  });
  
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

  const [localPosts, setLocalPosts] = useState<any[]>(communityPosts);

  useEffect(() => {
    setLocalPosts(communityPosts);
  }, [communityPosts]);

  // Refetch community data when screen is focused (e.g., after creating a post)
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  useFocusEffect(
    useMemo(() => {
      return () => {
        if (communityId) {
          refetchRef.current();
        }
      };
    }, [communityId])
  );

  if (data) console.log('GetCommunity data received', { data });

  const resolveImageSource = (maybeUrlOrRequire: any) => {
    if (typeof maybeUrlOrRequire === 'string' && maybeUrlOrRequire.length > 0) {
      return { uri: maybeUrlOrRequire };
    }
    return images.bg;
  };

  function formatCount(num: number): string {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`.replace(/\.0$/, "");
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`.replace(/\.0$/, "");
    return String(num);
  }

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
    let changedPost: any = null;
    setLocalPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !!post.isLiked;
          const newLikes = isLiked ? Math.max(0, (post.likes || 0) - 1) : (post.likes || 0) + 1;
          changedPost = { ...post, isLiked: !isLiked, likes: newLikes };
          return changedPost;
        }
        return post;
      })
    );

    // Emit like change event for global feed sync
    if (changedPost && changedPost.isVisibleOutsideCommunity) {
      emitter.emit('postLikeChanged', {
        postId: changedPost.id,
        isLiked: changedPost.isLiked,
        likes: changedPost.likes,
      });
    }

    try {
      await togglePostLike(postId).unwrap();
      try {
        dispatch(communityApi.util.invalidateTags([{ type: 'Community' }]));
      } catch (e) {}
    } catch (e) {
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
      // Optionally emit revert event, but not required for optimistic UI
      console.warn('Like failed', e);
    }
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-white" edges={["top"]} style={{ backgroundColor: '#FFFFFF' }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingHorizontal: 0,
          paddingTop: 16,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
          zIndex: 10,
          height: 70
        }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ 
              paddingLeft: 15,
              paddingRight: 8,
              paddingVertical: 8
            }}
          >
            <ChevronLeft size={24} color="#000000" strokeWidth={2} />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: '600',
              lineHeight: 22,
              color: '#000000',
              marginHorizontal: 8
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {community?.name || "Communauté"}
          </Text>
          <TouchableOpacity
            onPress={() => {}}
            style={{ 
              paddingRight: 15,
              paddingLeft: 8,
              paddingVertical: 8
            }}
          >
            <Settings size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Banner and Profile Image */}
            {(() => {

              const files = community?.communityFiles || [];
              const avatarFile = files.find((f: any) => f.role === 'avatar');
              const bannerFile = files.find((f: any) => f.isPrincipale && f.role === 'banner');
              const extraFiles = files.filter((f: any) => {
                if (avatarFile && f.url === avatarFile.url) return false;
                return !f.isPrincipale && (!bannerFile || f.url !== bannerFile.url);
              });

              return (
                <View style={{ position: 'relative', marginTop: 25 }}>
                  {/* Banner */}
                  {bannerFile ? (
                    <Image
                      source={resolveImageSource(bannerFile.url)}
                      style={{
                        width: '100%',
                        height: 191,
                        marginHorizontal: 'auto',
                        maxWidth: 360,
                        borderRadius: 13,
                        alignSelf: 'center'
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{ width: '100%', height: 191, backgroundColor: '#F3F4F6', borderRadius: 13, alignSelf: 'center', maxWidth: 360 }} />
                  )}
                  {/* Profile Image */}
                  <View style={{
                    position: 'absolute',
                    bottom: -41,
                    left: '50%',
                    marginLeft: -41,
                    width: 82,
                    height: 82,
                    borderRadius: 41,
                    borderWidth: 2.5,
                    borderColor: '#FFFFFF',
                    overflow: 'hidden',
                    backgroundColor: '#D9D9D9'
                  }}>
                    <Image
                      source={resolveImageSource(avatarFile?.url || community?.creator?.profileImage)}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              );
            })()}

            {/* Profile Info*/}
            <View style={{ 
              marginTop: 52,
              paddingHorizontal: 15,
              alignItems: 'center',
              gap: 15
            }}>
              {/* Name + Verified + Edit */}
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'center'
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  lineHeight: 19,
                  color: '#000000',
                  textAlign: 'center'
                }}>
                  {community.name}
                </Text>

                <TouchableOpacity>
                  <Edit size={18} color="#666" />
                </TouchableOpacity>
              </View>
              {/* Description */}
              <Text style={{
                fontSize: 12,
                fontWeight: '500',
                lineHeight: 19,
                color: '#5B5B5B',
                textAlign: 'center',
                paddingHorizontal: 24,
                maxWidth: 326
              }}>
                {community.description}
              </Text>

              {/* Stats */}
              <View style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10.71,
                marginTop: 5
              }}>
                <TouchableOpacity onPress={() => setShowMembersModal(true)} style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 15.14,
                    fontWeight: '700',
                    lineHeight: 24,
                    color: '#000000',
                    textAlign: 'center'
                  }}>
                    {formatCount(community.totalMembers || 0)} Members
                  </Text>
                </TouchableOpacity>
                
                <View style={{ 
                  width: 0,
                  height: 18.55,
                  borderLeftWidth: 0.757,
                  borderColor: '#DBDBDB'
                }} />
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 15.14,
                    fontWeight: '700',
                    lineHeight: 24,
                    color: '#000000',
                    textAlign: 'center'
                  }}>
                    {community.totalProducts || 0} Products
                  </Text>
                </View>
                
                <View style={{ 
                  width: 0,
                  height: 18.55,
                  borderLeftWidth: 0.757,
                  borderColor: '#DBDBDB'
                }} />
                
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 15.14,
                    fontWeight: '700',
                    lineHeight: 24,
                    color: '#000000',
                    textAlign: 'center'
                  }}>
                    {community.totalPosts || 0} Posts
                  </Text>
                </View>
              </View>
            </View>

            {/* Navigation Tabs  */}
            <View style={{ 
              marginTop: 42,
              paddingHorizontal: 15,
              marginBottom: 16
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderWidth: 0.75,
                borderColor: '#EEEEEE',
                borderRadius: 90,
                paddingVertical: 4.5,
                paddingHorizontal: 16
              }}>
                {/* Feed Tab */}
                <TouchableOpacity
                  onPress={() => setActiveTab("Feed")}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 6.75,
                    paddingHorizontal: 18,
                    gap: 6,
                    borderBottomWidth: activeTab === "Feed" ? 2.25 : 0,
                    borderBottomColor: '#E72858'
                  }}
                >
                  <Home size={18} color={activeTab === "Feed" ? "#E72858" : "#1F1F1F"} strokeWidth={1.5} />
                  <Text style={{
                    fontSize: 13.5,
                    fontWeight: activeTab === "Feed" ? '600' : '500',
                    lineHeight: 28,
                    color: activeTab === "Feed" ? "#E72858" : "#1F1F1F"
                  }}>
                    Feed
                  </Text>
                </TouchableOpacity>

                <View style={{ width: 0, height: 18.38, borderLeftWidth: 0.75, borderColor: '#DBDBDB' }} />

                {/* Shop Tab */}
                <TouchableOpacity
                  onPress={() => setActiveTab("Shop")}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 6.75,
                    paddingHorizontal: 18,
                    gap: 6,
                    borderBottomWidth: activeTab === "Shop" ? 2.25 : 0,
                    borderBottomColor: '#E72858'
                  }}
                >
                  <ShoppingBag size={18} color={activeTab === "Shop" ? "#E72858" : "#1F1F1F"} strokeWidth={1.5} />
                  <Text style={{
                    fontSize: 13.5,
                    fontWeight: activeTab === "Shop" ? '600' : '500',
                    lineHeight: 28,
                    color: activeTab === "Shop" ? "#E72858" : "#1F1F1F"
                  }}>
                    Shop
                  </Text>
                </TouchableOpacity>

                <View style={{ width: 0, height: 18.38, borderLeftWidth: 0.75, borderColor: '#DBDBDB' }} />

                {/* Trajets Tab */}
                <TouchableOpacity
                  onPress={() => setActiveTab("Trajets")}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 6.75,
                    paddingHorizontal: 18,
                    gap: 6,
                    borderBottomWidth: activeTab === "Trajets" ? 2.25 : 0,
                    borderBottomColor: '#E72858'
                  }}
                >
                  <MapPin size={18} color={activeTab === "Trajets" ? "#E72858" : "#1F1F1F"} strokeWidth={1.5} />
                  <Text style={{
                    fontSize: 13.5,
                    fontWeight: activeTab === "Trajets" ? '600' : '500',
                    lineHeight: 28,
                    color: activeTab === "Trajets" ? "#E72858" : "#1F1F1F"
                  }}>
                    Trajets
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Feed Content */}
            {activeTab === "Feed" && (
              <>
{/* Carousel of extra files (images/videos) */}
                {(() => {

                  const files = community?.communityFiles || [];
                  const avatarFile = files.find((f: any) => f.role === 'avatar');
                  const bannerFile = files.find((f: any) => f.isPrincipale && f.role === 'banner');
                  const extraFiles = files.filter((f: any) => {
                    if (avatarFile && f.url === avatarFile.url) return false;
                    return !f.isPrincipale && (!bannerFile || f.url !== bannerFile.url);
                  });

                  return (
                    extraFiles.length > 0 && (
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        style={{ marginBottom: 16 }}
                        contentContainerStyle={{ paddingHorizontal: 15 }}
                      >
                        {extraFiles.map((file: any, idx: number) => (
                          <View 
                            key={file.url || idx}
                            style={{ 
                              marginRight: idx < extraFiles.length - 1 ? 12 : 0,
                              borderRadius: 12,
                              overflow: 'hidden',
                              width: 308,
                              height: 380
                            }}
                          >
                            <Image
                              source={resolveImageSource(file.url)}
                              style={{ 
                                width: '100%', 
                                height: '100%'
                              }}
                              resizeMode="cover"
                            />
                          </View>
                        ))}
                      </ScrollView>
                    )
                  );
                })()}

                {/* Pending posts for moderators - AT THE TOP */}
                {isModerator && localPosts.filter((p: any) => p.status === 'pending').length > 0 && (
                  <View style={{ marginTop: 8, paddingHorizontal: 15, marginBottom: 24 }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      lineHeight: 27,
                      color: '#1F1F1F',
                      textTransform: 'capitalize',
                      marginBottom: 12
                    }}>
                      Publication requests
                    </Text>
                    {localPosts.filter((p: any) => p.status === 'pending').map((post: any) => (
                      <View key={post.id} style={{ 
                        marginBottom: 16,
                        borderWidth: 0.62,
                        borderColor: '#E0E0E0',
                        borderRadius: 12.5,
                        overflow: 'hidden'
                      }}>
                        <PostCard post={post} key={post.id} onLike={handleLike} />
                        
                        {/* Action buttons - Figma Frame 1171278487 */}
                        <View style={{ 
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2.84,
                          paddingVertical: 16,
                          paddingHorizontal: 16
                        }}>
                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              paddingVertical: 10.24,
                              paddingHorizontal: 29.71,
                              backgroundColor: '#FFFFFF',
                              borderRadius: 1229.37,
                              minWidth: 105.42,
                              height: 38.49
                            }}
                            onPress={() => {
                              setRejectingPostId(post.id);
                              setRejectReason('');
                              setShowRejectModal(true);
                            }}
                          >
                            {actionLoading[post.id] ? (
                              <ActivityIndicator color="#1F1F1F" />
                            ) : (
                              <Text style={{
                                fontSize: 14.57,
                                fontWeight: '600',
                                lineHeight: 18,
                                color: '#1F1F1F',
                                textAlign: 'center'
                              }}>
                                Delete
                              </Text>
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              paddingVertical: 10.24,
                              paddingHorizontal: 29.71,
                              backgroundColor: '#E72858',
                              borderRadius: 1229.37,
                              minWidth: 124.42,
                              height: 38.49
                            }}
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
                                        Toast.show({
                                          type: 'success',
                                          text1: 'Post approved',
                                          text2: 'The post is now published.'
                                        });
                                        try {
                                          dispatch(communityApi.util.invalidateTags([{ type: 'Community' }]));
                                        } catch (err) {
                                          console.warn('Failed to invalidate community tags', err);
                                        }
                                      } catch (e: any) {
                                        console.warn('Approve failed', e);
                                        Toast.show({
                                          type: 'error',
                                          text1: 'Approve failed',
                                          text2: e?.data?.message || e?.message || 'Unable to approve'
                                        });
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
                              <ActivityIndicator color="#FFFFFF" />
                            ) : (
                              <Text style={{
                                fontSize: 14.57,
                                fontWeight: '600',
                                lineHeight: 18,
                                color: '#FFFFFF',
                                textAlign: 'center'
                              }}>
                                Accepter
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Composer - Create Post */}
                {isUserMemberShip && (
                  <View style={{ 
                    marginHorizontal: 15,
                    marginTop: 12,
                    marginBottom: 16
                  }}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => router.push(`/create-post?communityId=${community.id}&type=post` as any)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: '#EEEEEE'
                      }}
                    >
                      <Text style={{ fontSize: 14, color: '#999', marginBottom: 12 }}>
                        Write something inspiring…
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 20,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderWidth: 2,
                            borderColor: '#E72858'
                          }}
                          onPress={() => router.push(`/create-post?communityId=${community.id}&type=post` as any)}
                        >
                          <ImagePlus size={18} color="#E72858" />
                          <Text style={{ fontSize: 13, fontWeight: '600', color: '#E72858' }}>Post</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 20,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            backgroundColor: '#F5F5F5'
                          }}
                          onPress={() => router.push(`/create-post?communityId=${community.id}&type=reel` as any)}
                        >
                          <Video size={18} color="#1F1F1F" />
                          <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F1F1F' }}>Reel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 20,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            backgroundColor: '#F5F5F5'
                          }}
                          onPress={() => router.push(`/create-post?communityId=${community.id}&type=360` as any)}
                        >
                          <Orbit size={18} color="#1F1F1F" />
                          <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F1F1F' }}>360</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {/* All Posts header */}
                <View style={{ 
                  paddingHorizontal: 15,
                  marginTop: 8,
                  marginBottom: 12
                }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    lineHeight: 27,
                    color: '#1F1F1F'
                  }}>
                    All Posts
                  </Text>
                </View>

                {/* Categories */}
                <View style={{ paddingHorizontal: 15, marginBottom: 16 }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -15 }}>
                    <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 15 }}>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: selectedCategory === category.name ? '#E72858' : '#E0E0E0',
                            backgroundColor: selectedCategory === category.name ? '#FFF5F7' : '#FFFFFF'
                          }}
                        >
                          <category.icon size={16} color={selectedCategory === category.name ? "#E72858" : "#666"} />
                          <Text style={{
                            fontSize: 13,
                            fontWeight: '500',
                            color: selectedCategory === category.name ? '#E72858' : '#666'
                          }}>
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Posts Feed - Approved Posts */}
                <View style={{ paddingBottom: 100 }}>
                  {localPosts.filter((p: any) => p.status === 'approved').map((post: any) => (
                    <PostCard key={post.id} post={post} onLike={handleLike} />
                  ))}

                  {/* Reject reason modal */}
                  <Modal
                    visible={showRejectModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowRejectModal(false)}
                  >
                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
                      <View style={{ backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8 }}>Reject post</Text>
                        <Text style={{ color: '#666', marginBottom: 12 }}>
                          Provide an optional reason for rejecting this post (shown to the author).
                        </Text>
                        <TextInput
                          placeholder="Reason (optional)"
                          value={rejectReason}
                          onChangeText={setRejectReason}
                          style={{
                            borderWidth: 1,
                            borderColor: '#eee',
                            borderRadius: 8,
                            padding: 10,
                            minHeight: 80,
                            textAlignVertical: 'top'
                          }}
                          multiline
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                          <TouchableOpacity
                            onPress={() => {
                              setShowRejectModal(false);
                              setRejectingPostId(null);
                              setRejectReason('');
                            }}
                            style={{ paddingHorizontal: 14, paddingVertical: 10 }}
                          >
                            <Text style={{ color: '#666' }}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={async () => {
                              if (!rejectingPostId) return;
                              try {
                                setActionLoading(prev => ({ ...prev, [rejectingPostId]: true }));
                                await rejectPost({ communityId: community.id, postId: rejectingPostId, reason: rejectReason }).unwrap();
                                Toast.show({
                                  type: 'info',
                                  text1: 'Post rejected',
                                  text2: 'The post has been rejected.'
                                });
                              } catch (e: any) {
                                console.warn('Reject failed', e);
                                Toast.show({
                                  type: 'error',
                                  text1: 'Reject failed',
                                  text2: e?.data?.message || e?.message || 'Unable to reject'
                                });
                              } finally {
                                setActionLoading(prev => ({ ...prev, [rejectingPostId]: false }));
                                setShowRejectModal(false);
                                setRejectingPostId(null);
                                setRejectReason('');
                              }
                            }}
                            style={{ backgroundColor: '#E72858', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }}
                          >
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

      <MembersModal
        visible={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        communityId={stableCommunityId}
      />
    </>
  );
}