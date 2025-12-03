'use client';

import { Bell, Search, User } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="bg-white border-b border-[#EEEEEE]">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 justify-end items-center gap-[21px]">
          {/* Search */}
          <div className="relative w-[335px] h-[45px]">
            <div className="absolute inset-0 bg-white border-[1.5px] border-[#EEEEEE] rounded-xl"></div>
            <div className="absolute left-5 top-1/2 -translate-y-1/2">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.82" cy="6.82" r="5.82" stroke="#6E6D6D" strokeWidth="1.4"/>
                <line x1="11.5" y1="11.5" x2="14" y2="14" stroke="#6E6D6D" strokeWidth="1.4"/>
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search items, categories, or more..."
              className="w-full h-full pl-[46px] pr-5 bg-transparent text-xs text-[#6E6D6D] placeholder-[#6E6D6D] outline-none"
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center gap-[15.36px]">
            <button className="relative w-[21.02px] h-[21.02px]">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 3C8.23858 3 6 5.23858 6 8V11.697L4.45 14.197C4.15 14.647 4 15 4 15.5C4 16.328 4.672 17 5.5 17H16.5C17.328 17 18 16.328 18 15.5C18 15 17.85 14.647 17.55 14.197L16 11.697V8C16 5.23858 13.7614 3 11 3Z" stroke="#6E6E6E" strokeWidth="1.6166"/>
              </svg>
            </button>
            <button className="relative w-[21.02px] h-[21.02px]">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="3" width="16" height="16" rx="2" stroke="#6E6E6E" strokeWidth="1.6166"/>
                <circle cx="11" cy="8.5" r="1.5" fill="#6E6E6E"/>
              </svg>
            </button>
            <button className="relative w-[21.02px] h-[21.02px]">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#6E6E6E" strokeWidth="1.6166"/>
                <circle cx="11" cy="11" r="2.5" fill="#6E6E6E"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="h-6 border-l border-[#EEEEEE]"></div>

          {/* User Profile */}
          <div className="flex items-center gap-[13px] py-1 rounded-lg">
            <div className="flex items-center gap-[6.22px]">
              <div className="w-[33.61px] h-[33.61px] bg-gray-300 rounded-full"></div>
              <button className="w-[18px] h-[18px] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M5 7L9 11L13 7" stroke="#6E6E6E" strokeWidth="1.6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}