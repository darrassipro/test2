"use client";

import { useState } from "react";
import PostCard from "./PostCard";
import { useGetPostsQuery, useToggleLikeMutation } from "@/lib/api/postApi";
import { useJoinCommunityMutation } from "@/lib/api/communityApi";

export default function PostsFeed() {
  const { data: postsData, isLoading, refetch } = useGetPostsQuery({ page: 1, limit: 20 });
  const [toggleLike] = useToggleLikeMutation();
  const [joinCommunity] = useJoinCommunityMutation();
  const [optimisticLikes, setOptimisticLikes] = useState<Record<number, { isLiked: boolean; likesCount: number }>>({});
  const [optimisticJoins, setOptimisticJoins] = useState<Set<number>>(new Set());
  const [joiningCommunities, setJoiningCommunities] = useState<Set<number>>(new Set());

  const posts = postsData?.posts || [];

  const handleLike = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setOptimisticLikes(prev => ({
      ...prev,
      [postId]: {
        isLiked: !post.isLiked,
        likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
      }
    }));

    try {
      await toggleLike(postId).unwrap();
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert on error
      setOptimisticLikes(prev => {
        const newState = { ...prev };
        delete newState[postId];
        return newState;
      });
    }
  };

  const handleJoinCommunity = async (communityId: number) => {
    // Set loading state
    setJoiningCommunities(prev => new Set([...prev, communityId]));
    // Optimistic update
    setOptimisticJoins(prev => new Set([...prev, communityId]));
    
    try {
      const result = await joinCommunity(communityId.toString()).unwrap();
      console.log('Join community success:', result);
      // Refetch posts to get updated isMember status
      await refetch();
    } catch (error) {
      console.error("Error joining community:", error);
      // Revert optimistic update on error
      setOptimisticJoins(prev => {
        const newSet = new Set(prev);
        newSet.delete(communityId);
        return newSet;
      });
    } finally {
      // Remove loading state
      setJoiningCommunities(prev => {
        const newSet = new Set(prev);
        newSet.delete(communityId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-[20px] overflow-hidden">
            <div className="h-[699px] bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No posts yet</h3>
          <p className="mt-2 text-sm text-gray-500">Start following communities to see posts in your feed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {posts.map((post) => {
        const displayPost = optimisticLikes[post.id] 
          ? { ...post, ...optimisticLikes[post.id] }
          : post;
        
        // Apply optimistic join status
        const finalPost = post.community && optimisticJoins.has(post.community.id)
          ? { ...displayPost, isMember: true }
          : displayPost;
        
        const isJoining = post.community && joiningCommunities.has(post.community.id);
        
        return (
          <PostCard
            key={post.id}
            post={finalPost}
            onLike={handleLike}
            onJoinCommunity={handleJoinCommunity}
            isJoining={isJoining}
          />
        );
      })}
    </div>
  );
}
