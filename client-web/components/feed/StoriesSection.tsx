"use client";

import Image from "next/image";
import { useGetStoriesQuery } from "@/lib/api/storyApi";

export default function StoriesSection() {
  const { data: storiesData, isLoading } = useGetStoriesQuery({});
  const stories = storiesData?.data?.stories || [];

  if (isLoading) {
    return (
      <div className="mt-[138px] mb-8">
        <h2 className="text-lg font-semibold mb-4">Trajets</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="min-w-[150px] h-[216px] bg-gray-200 rounded-[14.22px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <div className="mt-[138px] mb-8">
      <h2 className="text-lg font-semibold text-black mb-4">Trajets</h2>
      
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {stories.map((story) => {
          const authorName = `${story.author?.firstName || ""} ${story.author?.lastName || ""}`.trim() || "Unknown";
          
          return (
            <div
              key={story.id}
              className="relative min-w-[150px] h-[216px] rounded-[14.22px] overflow-hidden cursor-pointer group hover:scale-105 transition-transform"
              style={{
                background: story.mediaUrl
                  ? `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 26.12%), linear-gradient(180deg, rgba(0, 0, 0, 0) 68.76%, rgba(0, 0, 0, 0.5) 100%), url(${story.mediaUrl})`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Story Icon */}
              <div className="absolute top-[11.59px] left-[11.59px] w-[29.01px] h-6">
                <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
                  <path d="M5 0C4 0 3 1 3 2V18C3 19 4 20 5 20H7L10 24L13 20H25C26 20 27 19 27 18V2C27 1 26 0 25 0H5Z" fill="#FFFFFF"/>
                </svg>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-[18.52px] left-[11.59px] right-[11.59px] flex items-center gap-[2.37px]">
                <div className="relative w-[26.07px] h-[26.07px]">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#E72858] to-[#FF009D] p-[2.37px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      {story.author?.profileImage ? (
                        <Image
                          src={story.author.profileImage}
                          alt={authorName}
                          width={21}
                          height={21}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{authorName.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <span className="text-white font-semibold text-[14.22px] leading-[17px] truncate">
                  {authorName.length > 10 ? `${authorName.slice(0, 10)}...` : authorName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
