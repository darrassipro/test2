import { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, Image, TextInput, FlatList, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowLeftIcon, BookmarkIcon, Calendar, Ellipsis, MapPin, MessageCircle, Share2, UserRoundPlus } from "lucide-react-native";
import icons from "@/constants/icons";
import { useGetPostByIdQuery, useTogglePostLikeMutation, useToggleSavePostMutation, useCreateCommentMutation, useRecordShareMutation, useToggleCommentLikeMutation } from '../../services/postApi';
import emitter from "@/lib/eventEmitter";
 
const Details = () => {
  const { id } = useLocalSearchParams();
  const screenWidth = Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, isLoading, error } = useGetPostByIdQuery(id);
  const post = data?.post;

  // Add local post state to allow reacting to external like changes
  const [localPost, setLocalPost] = useState<any>(post);
  // Keep localPost in sync whenever the query returns new data
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  // displayedPost is used throughout the UI instead of raw `post`
  const displayedPost = localPost || post;
  const comments = displayedPost?.comments || [];
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null as null | string);
  const inputRef = useRef<any>(null);
  const [expandedRepliesMap, setExpandedRepliesMap] = useState<Record<string, boolean>>({});
  const toggleReplies = (id: any) => {
    const key = String(id);
    setExpandedRepliesMap((s) => ({ ...s, [key]: !s[key] }));
  };
  const [createComment, { isLoading: isCommenting }] = useCreateCommentMutation();
  const [togglePostLike, { isLoading: isLiking }] = useTogglePostLikeMutation();
  const [toggleSavePost, { isLoading: isSaving }] = useToggleSavePostMutation();
  const [toggleCommentLike, { isLoading: isCommentLikeLoading }] = useToggleCommentLikeMutation();

  const [recordShare, { isLoading: isSharing }] = useRecordShareMutation();

  const formatCount = (num: number) => {
    if (num >= 1e9) return `${parseFloat((num / 1e9).toFixed(1)).toString().replace(/\.0$/, "")}B`;
    if (num >= 1e6) return `${parseFloat((num / 1e6).toFixed(1)).toString().replace(/\.0$/, "")}M`;
    if (num >= 1e3) return `${parseFloat((num / 1e3).toFixed(1)).toString().replace(/\.0$/, "")}K`;
    return String(num);
  };

  const replyingToName = useMemo(() => {
    if (!replyTo) return null;
    const c = comments.find((cm: any) => String(cm.id) === String(replyTo));
    if (!c) return null;
    return `${c.user?.firstName || ''}${c.user?.lastName ? ' ' + c.user?.lastName : ''}`.trim();
  }, [comments, replyTo]);

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr).getTime();
    const seconds = Math.floor((Date.now() - d) / 1000);
    const intervals: [number, string][] = [
      [31536000, "y"],
      [2592000, "mo"],
      [86400, "d"],
      [3600, "h"],
      [60, "m"],
      [1, "s"],
    ];
    for (const [secs, label] of intervals) {
      const val = Math.floor(seconds / secs);
      if (val > 0) return `${val}${label}`;
    }
    return "now";
  };

  const renderMedia = ({ item }: any) => {
    // Pour simplicité, uniquement images; une vidéo aurait un overlay similaire à l'écran feed
    const uri = item.url || item.uri || item.path || item;
    return (
      <View style={{ width: screenWidth, height: 300 }} className="bg-black items-center justify-center">
        <Image
          source={{ uri }}
          className="w-full h-full object-contain"
          resizeMode="contain"
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#E72858" />
      </SafeAreaView>
    );
  }
  if (error || !post) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-700">Erreur lors du chargement du post.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      {/* Header du post */}
      <View className="px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="mr-1" onPress={() => router.back()}>
            <ArrowLeftIcon size={20} color="#000" />
          </TouchableOpacity>
          <Image source={{ uri: post.user?.profileImage }} className="w-10 h-10 rounded-full" />
          <View>
            <View className="flex-row items-center gap-1">
              <Text className="font-semibold">{post.user?.firstName} {post.user?.lastName}</Text>
              {post.user?.isVerified ? (
                <View className="bg-blue-500 rounded-full w-4 h-4 items-center justify-center">
                  <Text className="text-white text-xs">✓</Text>
                </View>
              ) : null}
              {/* TODO: Afficher la date de création */}
            </View>
            {/* TODO: Afficher la localisation si disponible */}
          </View>
        </View>
        <TouchableOpacity className="px-4 py-1.5 rounded-full flex-row items-center gap-1">
          <UserRoundPlus size={18} color="#E72858" />
          <Text className="text-[#E72858] text-sm ml-1 font-semibold">Join</Text>
        </TouchableOpacity>
      </View>

      {/* Slider */}
      <View className="relative">
        <FlatList
          data={displayedPost?.postFiles || displayedPost?.postFiles?.map((f: any) => f.url) || []}
          keyExtractor={(m: any, idx: number) => (m?.id || m?.url || String(idx))}
          renderItem={renderMedia}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setActiveIndex(index);
          }}
        />
        {post.location ? (
          <View className="absolute top-3 left-3 bg-white rounded-full px-3 py-1.5 flex-row items-center gap-1">
            <MapPin size={14} color="#111" />
            <Text className="text-sm font-semibold">{post.location}</Text>
          </View>
        ) : null}
        {post.hotelNuiteeId ? (
          <TouchableOpacity className="absolute top-3 right-3 bg-[#E72858] px-4 py-1.5 rounded-full flex-row items-center gap-1">
            <Calendar size={15} color="#fff" />
            <Text className="text-white text-sm font-semibold ml-2">Book now</Text>
          </TouchableOpacity>
        ) : null}
        {/* Indicateurs */}
        <View className="absolute bottom-2 w-full items-center">
          <View className="flex-row gap-1 bg-black/30 rounded-full px-2 py-1">
            {(post.postFiles || []).map((_: any, i: number) => (
              <View
                key={i}
                className={`h-1.5 rounded-full ${i === activeIndex ? "bg-white w-6" : "bg-white/60 w-2"}`}
              />
            ))}
          </View>
        </View>
      </View>

      <View className="px-4 mt-3">
        <View className="flex-row items-center justify-between">
          <View className="bg-white rounded-full py-3 px-4 flex-row items-center justify-between shadow-lg">
            <View className="flex-row items-center gap-6 px-1">
              <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={async () => {
                  if (isLiking) return;
                  try {
                    await togglePostLike(id).unwrap();
                    // update local state and broadcast change so other screens (PostsSection) react
                    const isNowLiked = !displayedPost?.isLiked;
                    const newLikes = isNowLiked
                      ? (displayedPost?.likesCount || 0) + 1
                      : Math.max(0, (displayedPost?.likesCount || 0) - 1);
                    const updated = { ...(displayedPost || {}), isLiked: isNowLiked, likesCount: newLikes, likes: newLikes };
                    setLocalPost(updated);
                    emitter.emit('postLikeChanged', { postId: id, isLiked: isNowLiked, likes: newLikes });
                  } catch (e) {}
                }}
                disabled={isLiking}
              >
                <Image source={displayedPost?.isLiked ? icons.likeActive : icons.likeInactive} className="w-5 h-5" />
                <Text className={`text-sm font-medium ${displayedPost?.isLiked ? "text-pink-500" : "text-gray-900"}`}>{formatCount(displayedPost?.likesCount || 0)}</Text>
              </TouchableOpacity>
              <View className="flex-row items-center gap-1">
                <MessageCircle size={18} color="#000" />
                <Text className="text-sm font-medium">{formatCount(post.totalCommentsCount || 0)}</Text>
              </View>
              <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={async () => {
                  if (isSharing) return;
                  try {
                    await recordShare({ postId: id }).unwrap();
                  } catch (e) {}
                }}
                disabled={isSharing}
              >
                <Share2 size={18} color="#000" />
                <Text className="text-sm font-medium">{formatCount(post.sharesCount || 0)}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            className="bg-white rounded-full py-3 px-4 flex-row items-center justify-between shadow-lg"
            onPress={async () => {
              if (isSaving) return;
              try {
                await toggleSavePost(id).unwrap();
              } catch (e) {}
            }}
            disabled={isSaving}
          >
            <BookmarkIcon size={18} color={displayedPost?.isSaved ? "#E72858" : "#0F0F0F"} />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-1">
        <ScrollView className="flex-1 px-4 mt-6" contentContainerStyle={{ paddingBottom: 16 }}>
          <Text className="text-[18px] font-semibold mb-4 text-center">Comments</Text>
          {comments.map((c: any) => (
            <View key={c.id} className="bg-white border border-[#E0E0E0] rounded-[16px] p-4 mb-4" style={{ width: '100%' }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  <Image source={{ uri: c.user?.profileImage }} style={{ width: 26, height: 26, borderRadius: 13 }} />
                  <Text className="text-[12px] font-semibold capitalize">{c.user?.firstName} {c.user?.lastName}</Text>
                </View>
                <TouchableOpacity onPress={() => { setReplyTo(c.id); inputRef.current?.focus(); }}>
                  <Ellipsis size={18} color="#111" />
                </TouchableOpacity>
              </View>
              <Text className="text-[12px] font-medium text-black mt-3">{c.content}</Text>
              <View className="flex-row items-center justify-between mt-4">
                <View className="flex-row items-center" style={{ gap: 12 }}>
                    <View className="flex-row items-center" style={{ gap: 6 }}>
                      <TouchableOpacity
                        disabled={isCommentLikeLoading}
                        onPress={async () => {
                          try {
                            await toggleCommentLike({ postId: id, commentId: c.id }).unwrap();
                          } catch (e) {
                          }
                        }}
                        className="flex-row items-center"
                        style={{ gap: 6 }}
                      >
                        <Image source={c.isLiked ? icons.likeActive : icons.likeInactive} style={{ width: 17.45, height: 17.45 }} />
                        <Text className={`text-[10px] font-semibold ${c.isLiked ? 'text-pink-500' : 'text-[#5B5B5B]'}`}>{formatCount(c.likesCount || 0)}</Text>
                      </TouchableOpacity>
                    </View>
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() => toggleReplies(c.id)}
                    style={{ gap: 6 }}
                  >
                    <MessageCircle size={16} color="#5B5B5B" />
                    <Text className="text-[10px] font-semibold text-[#5B5B5B]">{formatCount(c.repliesCount || 0)}</Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-[#7D7D7D] text-[10px]">{timeAgo(c.createdAt)}</Text>
              </View>
              {/* Replies (toggleable) */}
              {((c.replies && c.replies.length > 0) || (c.children && c.children.length > 0)) && expandedRepliesMap[String(c.id)] && (
                <View className="mt-4">
                  <View className="flex-row">
                    <View className="w-0.5 bg-gray-200 mr-3 ml-4" />
                    <View className="flex-1 bg-rose-50 rounded-[16px] p-3 border border-[#E0E0E0]">
                      {(c.replies || c.children || []).map((r: any) => (
                        <View key={r.id} className="mb-3">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center" style={{ gap: 8 }}>
                              <Image source={{ uri: r.user?.profileImage }} style={{ width: 26, height: 26, borderRadius: 13 }} />
                              <Text className="text-[12px] font-semibold capitalize">{r.user?.firstName} {r.user?.lastName}</Text>
                            </View>
                            <Ellipsis size={18} color="#7D7D7D" />
                          </View>
                          <Text className="text-[10.2px] font-medium text-black mt-2">{r.content}</Text>
                          <View className="flex-row items-center justify-between mt-3">
                            <View className="flex-row items-center" style={{ gap: 12 }}>
                                <TouchableOpacity
                                  disabled={isCommentLikeLoading}
                                  onPress={async () => {
                                    try {
                                      await toggleCommentLike({ postId: id, commentId: r.id }).unwrap();
                                    } catch (e) {}
                                  }}
                                  className="flex-row items-center"
                                  style={{ gap: 6 }}
                                >
                                  <Image source={r.isLiked ? icons.likeActive : icons.likeInactive} style={{ width: 17.44, height: 17.44 }} />
                                  <Text className={`text-[10px] font-semibold ${r.isLiked ? 'text-pink-500' : 'text-[#5B5B5B]'}`}>{formatCount(r.likesCount || 0)}</Text>
                                </TouchableOpacity>
                                <View className="flex-row items-center" style={{ gap: 6 }}>
                                  <MessageCircle size={16} color="#5B5B5B" />
                                  <Text className="text-[10px] font-semibold text-[#5B5B5B]">{formatCount(r.repliesCount || 0)}</Text>
                                </View>
                              </View>
                            <Text className="text-[#7D7D7D] text-[9px]">{timeAgo(r.createdAt)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        {replyTo && replyingToName && (
          <View className="px-4 mb-2">
            <View className="flex-row items-center justify-between">
              <Text style={{ color: '#E72858', fontWeight: '700' }}>Réponse à {replyingToName}</Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Text style={{ color: '#666' }}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <TextInput
            placeholder={replyTo ? "Votre réponse..." : "Have something to say? Add a comment..."}
            placeholderTextColor="#9CA3AF"
            className="flex-1"
            ref={inputRef}
            value={commentText}
            onChangeText={setCommentText}
            editable={!isCommenting}
          />
          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            disabled={isCommenting || !commentText.trim()}
            onPress={async () => {
              if (!commentText.trim()) return;
              try {
                await createComment({ postId: id, commentText, replyId: replyTo }).unwrap();
                setCommentText("");
                setReplyTo(null);
              } catch (e) {
                // Optionally: show error toast
              }
            }}
          >
            {isCommenting ? (
              <ActivityIndicator color="#E72858" />
            ) : (
              <Image source={icons.send} className="w-7 h-7" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Details;
