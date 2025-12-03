"use client";

import { Suspense } from "react";
import FeedHeader from "@/components/feed/FeedHeader";
import StoriesSection from "@/components/feed/StoriesSection";
import PostsFeed from "@/components/feed/PostsFeed";
import RightSidebar from "@/components/feed/RightSidebar";
import LeftSidebar from "@/components/feed/LeftSidebar";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <FeedHeader />

      <div className="flex max-w-[1440px] mx-auto pt-20">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <LeftSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 px-3 md:px-6 max-w-full lg:max-w-[calc(100%-328px)] xl:max-w-[calc(100%-736px)]">
          {/* Stories Section */}
          <Suspense fallback={<StoriesSkeleton />}>
            <StoriesSection />
          </Suspense>

          {/* Posts Feed */}
          <div className="mt-6">
            <Suspense fallback={<PostsSkeleton />}>
              <PostsFeed />
            </Suspense>
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="hidden xl:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

function StoriesSkeleton() {
  return (
    <div className="mt-[138px] mb-8">
      <h2 className="text-lg font-semibold mb-4">Trajets</h2>
      <div className="flex gap-3 overflow-hidden">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-[150px] h-[216px] bg-gray-200 rounded-[14px] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function PostsSkeleton() {
  return (
    <div className="space-y-6 mt-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-[20px] overflow-hidden">
          <div className="h-[699px] bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
