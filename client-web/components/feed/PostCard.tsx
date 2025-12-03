"use client";

import Image from "next/image";
import { ThumbsUp, MessageCircle, Share2, Bookmark, MapPin, Calendar, UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";
import { useToggleSaveMutation } from "@/lib/api/postApi";

interface PostProps {
  post: any;
  onLike: (postId: number) => void;
  onJoinCommunity: (communityId: number) => void;
  isJoining?: boolean;
}

function formatCount(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1).replace(/\.0$/, "")}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return String(num);
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return `${Math.floor(seconds / 604800)}w`;
}

export default function PostCard({ post, onLike, onJoinCommunity, isJoining = false }: PostProps) {
  const authorName = `${post.user.firstName} ${post.user.lastName}`.trim();
  const imageUrl = post.postFiles?.[0]?.url;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const totalSlides = post.postFiles?.length || 1;
  const [toggleSave] = useToggleSaveMutation();

  const handleBookmark = async () => {
    try {
      setIsSaved(!isSaved);
      await toggleSave(post.id).unwrap();
    } catch (error) {
      console.error("Error toggling save:", error);
      setIsSaved(!isSaved);
    }
  };

  return (
    <div className="relative border border-[#E0E0E0] rounded-[20px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-[19px] pt-[19px] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-[6px]">
          <div className="w-[51px] h-[51px] rounded-full overflow-hidden">
            {post.user.profileImage ? (
              <Image
                src={post.user.profileImage}
                alt={authorName}
                width={51}
                height={51}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#E72858] to-[#FF009D] flex items-center justify-center">
                <span className="text-white text-xl font-bold">{authorName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-lg text-black">{authorName}</span>
              {post.verified && (
                <CheckCircle size={24} fill="#E72858" className="text-white" />
              )}
              <span className="text-[#5B5B5B] text-base">• {timeAgo(post.createdAt)}</span>
            </div>
            {post.community && (
              <span className="text-sm text-[#5B5B5B]">{post.community.name}</span>
            )}
          </div>
        </div>

        {/* Join Community Button - Only show if post is visible outside community */}
        {post.isVisibleOutsideCommunity && post.community && (
          post.isMember === true ? (
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 font-bold text-base cursor-default"
            >
              <UserCheck size={14} color="#10B981" />
              <span>Joined</span>
            </button>
          ) : (
            <button
              onClick={() => onJoinCommunity(post.community!.id)}
              disabled={isJoining}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold text-base transition-colors ${
                isJoining
                  ? 'border-gray-300 text-gray-400 cursor-wait'
                  : 'border-[#E72858] text-[#E72858] hover:bg-pink-50'
              }`}
            >
              {isJoining ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <UserPlus size={24} />
                  <span>Join</span>
                </>
              )}
            </button>
          )
        )}
      </div>

      {/* Post Image */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[677px] bg-gradient-to-b from-black/20 to-transparent">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title || "Post image"}
            fill
            className="object-cover"
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No image available</p>
            </div>
          </div>
        )}

        {/* Location Badge */}
        {post.location && (
          <div className="absolute top-2 md:top-4 left-2 md:left-4 flex items-center gap-1 md:gap-2 bg-white rounded-full px-2 md:px-3 py-1 md:py-1.5 shadow-sm">
            <MapPin size={16} className="text-black md:w-5 md:h-5" />
            <span className="font-semibold text-xs md:text-base text-black truncate max-w-[120px] md:max-w-none">{post.location}</span>
          </div>
        )}

        {/* Book Now Button */}
        {post.hotelNuiteeId && (
          <div className="absolute top-2 md:top-4 right-2 md:right-4 flex items-center gap-1 md:gap-2 bg-[#E72858] rounded-full px-3 md:px-[29px] py-1.5 md:py-2.5 shadow-lg cursor-pointer hover:bg-[#d01f4a] transition-colors">
            <Calendar size={16} className="text-white md:w-5 md:h-5" />
            <span className="font-semibold text-xs md:text-[14.22px] text-white">Book now</span>
          </div>
        )}

        {/* 360 Icon - Only show for VR posts */}
        {post.isVr && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-[59px] h-[59px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
              <svg width="49" height="49" viewBox="0 0 49 49" fill="none">
                <path d="M24.5 8.16667C15.5725 8.16667 8.16667 15.5725 8.16667 24.5C8.16667 33.4275 15.5725 40.8333 24.5 40.8333C33.4275 40.8333 40.8333 33.4275 40.8333 24.5C40.8333 15.5725 33.4275 8.16667 24.5 8.16667Z" stroke="white" strokeWidth="3.58333"/>
              </svg>
            </div>
          </div>
        )}

        {/* Carousel Indicators */}
        {totalSlides > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-0.5">
            {[...Array(totalSlides)].map((_, i) => (
              <div
                key={i}
                className={`h-[5px] rounded-full transition-all ${
                  i === currentSlide
                    ? "w-[105px] bg-white"
                    : "w-[105px] bg-white/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="px-3 md:px-4 py-3 flex items-center justify-between">
        {/* Left Actions */}
        <div className="flex items-center gap-4 md:gap-[29px] bg-white border border-[#EEEEEE] rounded-full px-3 md:px-[19px] py-2 md:py-[14px] backdrop-blur-sm">
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center gap-1"
          >
            <ThumbsUp
              size={24}
              fill={post.isLiked ? "#E72858" : "none"}
              className={post.isLiked ? "text-[#E72858]" : "text-black"}
            />
            <span className={`text-sm font-medium ${post.isLiked ? "text-[#E72858]" : "text-black"}`}>
              {formatCount(post.likesCount || 0)}
            </span>
          </button>

          <button className="flex items-center gap-1">
            <MessageCircle size={24} />
            <span className="text-sm font-medium text-black">{formatCount(post.commentsCount || 0)}</span>
          </button>

          <button className="flex items-center gap-1">
            <Share2 size={24} />
            <span className="text-sm font-medium text-black">{formatCount(post.sharesCount || 0)}</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className="w-[51.98px] h-[51.98px] rounded-full bg-white border border-[#EEEEEE] backdrop-blur-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Bookmark
            size={22}
            fill={isSaved ? "#E72858" : "none"}
            className={isSaved ? "text-[#E72858]" : "text-black"}
          />
        </button>
      </div>
    </div>
  );
}
