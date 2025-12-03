"use client";

import { Search, Bell, MessageCircle, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { icon: "/home/sunset.png", label: "Beaches" },
  { icon: "/home/mountain.png", label: "Mountains" },
  { icon: "/home/lake.png", label: "Lakes & Rivers" },
  { icon: "/home/desert.png", label: "Desert" },
  { icon: "/home/forest.png", label: "Forest" },
  { icon: "/home/historic-site.png", label: "Historical" },
  { icon: "/home/hiking.png", label: "Hiking" },
];

export default function FeedHeader() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E7E7E7]">
      {/* Top Navigation */}
      <div className="max-w-[1440px] mx-auto px-10 py-[22px]">
        <div className="flex items-center justify-between">
          {/* Logo and Search */}
          <div className="flex items-center gap-2">
            <Link href="/feed">
              <Image src="/Logo/Logo-03.png" alt="Logo" width={139} height={51} />
            </Link>
            
            <div className="relative w-[490px]">
              <div className="flex items-center gap-[6.81px] bg-[#F2F2F2] border border-[#EEEEEE] rounded-full px-[18px] py-[28.94px] h-[60px]">
                <Search size={27.55} className="text-[#1A2038]" />
                <input
                  type="text"
                  placeholder="Search posts, creators, or destinations…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-[#1A2038] placeholder:text-[#1A2038]"
                />
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-[19px]">
            <button className="p-0">
              <MessageCircle size={26} className="text-black" />
            </button>
            <button className="p-0">
              <Bell size={26} className="text-black" />
            </button>
            <button className="p-0">
              <Settings size={26} className="text-black" />
            </button>
            
            <Link href="/profile">
              <div className="w-[43px] h-[43px] rounded-full border-2 border-[#E72858] overflow-hidden">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    width={43}
                    height={43}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-[1440px] mx-auto px-10 pb-4">
        <div className="flex items-center justify-center gap-[14px]">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category.label)}
              className={`flex items-center gap-1 px-[22px] py-2 rounded-full border transition-colors ${
                selectedCategory === category.label
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-[#E0E0E0] hover:border-gray-300"
              }`}
            >
              <Image src={category.icon} alt={category.label} width={24} height={24} />
              <span className="text-sm font-medium">{category.label}</span>
            </button>
          ))}
          
          {/* Navigation arrows */}
          <div className="flex gap-[2px]">
            <button className="w-[26px] h-[26px] rounded-full bg-white border border-[#CECECE] flex items-center justify-center hover:bg-gray-50">
              <span className="text-sm">‹</span>
            </button>
            <button className="w-[26px] h-[26px] rounded-full bg-white border border-[#CECECE] flex items-center justify-center hover:bg-gray-50 rotate-180">
              <span className="text-sm">‹</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
