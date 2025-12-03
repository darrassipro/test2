"use client";

import { UserPlus } from "lucide-react";
import Image from "next/image";
import { useGetCommunitiesQuery, useJoinCommunityMutation } from "@/lib/api/communityApi";

const categories = [
  { icon: "/home/gate.png", label: "Riad" },
  { icon: "/home/food.png", label: "Restaurant" },
  { icon: "/home/motorcycle.png", label: "motos" },
  { icon: "/home/car-wash.png", label: "Car rental" },
  { icon: "/home/bicycle.png", label: "bicycles" },
  { icon: "/home/british-museum.png", label: "Museums" },
  { icon: "/home/resort.png", label: "Hôtel" },
];

const hashtags = [
  "#TravelGoals", "#WanderlustLife", "#ExploreMore",
  "#AdventureAwaits", "#TravelDiaries", "#BucketList",
  "#Nomadlife", "#TravelPhotography", "#DiscoverEarth",
];

export default function RightSidebar() {
  const { data: communitiesData } = useGetCommunitiesQuery({ limit: 3 });
  const [joinCommunity] = useJoinCommunityMutation();
  
  const trendingCommunities = communitiesData?.data || [];

  const handleJoin = async (id: number) => {
    try {
      await joinCommunity(id.toString()).unwrap();
    } catch (error) {
      console.error("Error joining community:", error);
    }
  };

  return (
    <aside className="sticky top-[104px] w-[408px] h-[calc(100vh-104px)] overflow-y-auto pr-10 pl-5 py-8">
      <div className="bg-[#F4F4F4] rounded-[28px] p-8 space-y-[43px]">
        {/* Trending Communities */}
        <div>
          <h2 className="text-base font-medium text-[#5B5B5B] leading-[37px] mb-[15px]">
            Trending Communities
          </h2>
          <div className="space-y-6">
            {trendingCommunities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No trending communities</p>
            ) : (
              trendingCommunities.map((community) => (
                <div key={community.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      {community.profileImage ? (
                        <img
                          src={community.profileImage}
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">{community.name?.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-black">{community.name}</h3>
                      <p className="text-base font-medium text-[#5B5B5B]">
                        {community.totalMembers >= 1000 ? `${(community.totalMembers / 1000).toFixed(0)}K` : community.totalMembers || 0} Members
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoin(community.id)}
                    className="flex items-center gap-2 bg-black text-white rounded-full px-[29px] py-2.5 hover:bg-gray-800 transition-colors"
                  >
                    <UserPlus size={20} />
                    <span className="font-semibold text-[14.22px]">Join</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className="flex items-center gap-2 px-[19px] py-2.5 border border-[#DBDBDB] rounded-full hover:bg-white transition-colors"
              >
                <Image src={category.icon} alt={category.label} width={24} height={24} />
                <span className="font-semibold text-[14.22px] text-black capitalize">
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trending Hashtags */}
        <div>
          <h2 className="text-base font-medium text-[#5B5B5B] leading-[37px] mb-[15px]">
            Trending Hashtags
          </h2>
          <div className="relative w-[352px] h-[142px]">
            {hashtags.map((tag, index) => {
              const positions = [
                { left: 0, top: 0 },
                { left: 119, top: 0 },
                { left: 238, top: 0 },
                { left: 0, top: 49 },
                { left: 119, top: 49 },
                { left: 238, top: 49 },
                { left: 0, top: 98 },
                { left: 119, top: 98 },
                { left: 238, top: 98 },
              ];
              
              return (
                <button
                  key={index}
                  className="absolute flex items-center justify-center px-[19px] py-2.5 border border-black rounded-full hover:bg-black hover:text-white transition-colors"
                  style={{ left: positions[index].left, top: positions[index].top }}
                >
                  <span className="font-semibold text-[14.22px] whitespace-nowrap">{tag}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
