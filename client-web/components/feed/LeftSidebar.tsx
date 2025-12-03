"use client";

import Link from "next/link";
import { Home, Users, ShoppingBag, Bookmark, Settings, Bell, HelpCircle, User, Plus } from "lucide-react";
import { useState } from "react";
import { useGetUserCommunitiesQuery } from "@/lib/api/communityApi";

const filterOptions = [
  { id: "trending", label: "Trending", icon: null },
  { id: "new", label: "New Posts", icon: null },
  { id: "nearby", label: "Nearby Posts", icon: null },
  { id: "my-communities", label: "My Communities Only", icon: null },
];

const pages = [
  { href: "/feed", label: "Feed", icon: Home, active: true },
  { href: "/communities", label: "My Communities", icon: Users },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/saved", label: "Saved Posts", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/support", label: "Support", icon: HelpCircle },
  { href: "/profile", label: "Profil", icon: User },
];

export default function LeftSidebar() {
  const [selectedFilter, setSelectedFilter] = useState("trending");
  const { data: communitiesData } = useGetUserCommunitiesQuery({});
  const myCommunities = communitiesData?.data || [];

  const formatMemberCount = (count: number): string => {
    if (!count) return "0 Members";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K Members`;
    }
    return `${count} Members`;
  };

  return (
    <aside className="sticky top-[104px] w-[328px] h-[calc(100vh-104px)] overflow-y-auto pl-10 pr-5 py-8">
      {/* Create Community Button */}
      <button className="w-full h-[60px] bg-[#E72858] rounded-full flex items-center justify-center gap-2 text-white font-semibold text-base mb-5 hover:bg-[#d01f4a] transition-colors">
        <Plus size={24} />
        <span>Create Community</span>
      </button>

      {/* Filter Section */}
      <div className="bg-[#F4F4F4] border border-[#EEEEEE] rounded-[32px] p-8 mb-8">
        <div className="space-y-[30px]">
          {/* Filters */}
          <div className="space-y-2">
            {filterOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-4 cursor-pointer"
              >
                <div className="relative w-6 h-6">
                  <div className="w-6 h-6 rounded-full border border-black flex items-center justify-center">
                    {selectedFilter === option.id && (
                      <div className="w-4 h-4 rounded-full bg-black" />
                    )}
                  </div>
                </div>
                <span className="text-lg font-medium text-black">{option.label}</span>
              </label>
            ))}
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-base font-medium text-[#5B5B5B] mb-4">Pages</h3>
            <div className="space-y-4">
              {pages.map((page) => {
                const Icon = page.icon;
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    className={`flex items-center gap-4 transition-colors ${
                      page.active
                        ? "text-[#E72858]"
                        : "text-black hover:text-[#E72858]"
                    }`}
                  >
                    <Icon size={32} strokeWidth={page.active ? 2.67 : 2.67} />
                    <span className={`text-lg ${page.active ? "font-semibold" : "font-medium"}`}>
                      {page.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* My Communities */}
          <div>
            <h3 className="text-base font-medium text-[#5B5B5B] mb-4">My Communities</h3>
            <div className="space-y-4">
              {myCommunities.length === 0 ? (
                <p className="text-sm text-gray-500">No communities joined yet</p>
              ) : (
                myCommunities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/communities/${community.id}`}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-14 rounded-full overflow-hidden">
                        {community.profileImage ? (
                          <img
                            src={community.profileImage}
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">{community.name?.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-black">
                          {community.name?.length > 15 ? `${community.name.slice(0, 15)}...` : community.name}
                        </h4>
                        <p className="text-base font-medium text-[#5B5B5B]">
                          {formatMemberCount(community.totalMembers || 0)}
                        </p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="2" stroke="black" strokeWidth="2"/>
                        <circle cx="12" cy="5" r="2" stroke="black" strokeWidth="2"/>
                        <circle cx="12" cy="19" r="2" stroke="black" strokeWidth="2"/>
                      </svg>
                    </button>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      <div className="w-1.5 h-[51px] bg-[#E72858] rounded-r-full fixed left-0" />
    </aside>
  );
}
