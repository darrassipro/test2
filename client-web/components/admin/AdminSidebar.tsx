'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  Building2,
  Menu as MenuIcon,
  X,
  Bell,
  Settings,
  LogOut,
  Wallet,
  ChevronDown,
  LucideIcon,
  BarChart3,
  FileText,
  Shield,
  UserCog,
} from 'lucide-react';
import Image from 'next/image';

type NavigationItem = {
  name: string;
  href: string;
  icon: LucideIcon | React.FC;
};

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Creators', href: '/admin/creators', icon: UserCog },
  { name: 'Communities', href: '/admin/communities', icon: Building2 },
  { name: 'Posts', href: '/admin/posts', icon: FileText },
  { name: 'Moderation', href: '/admin/moderation', icon: Shield },
  { 
    name: 'Trajets', 
    href: '/admin/trajets', 
    icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 19.5L7.5 15M21 4.5L16.5 9M13.5 13.5L9 18M9 6L7.5 7.5M15 12L13.5 13.5" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  },
  { name: 'Monetization', href: '/admin/monetization', icon: Wallet },
];

export function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-[284px] flex-col bg-[#1A2038] rounded-r-[30px]">
          {/* Mobile content - same as desktop */}
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between px-[22px] pt-[27px] pb-6">
              <div className="w-[140px] h-[51px] bg-white/10 rounded flex items-center justify-center text-white font-bold">
                LOGO
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-9 h-9 bg-[#F7F7F7] border border-[#EEEEEE] rounded-md flex items-center justify-center"
              >
                <MenuIcon className="w-6 h-6 text-black" />
              </button>
            </div>

            {/* Navigation - General */}
            <div className="px-0 py-3 flex-1">
              <div className="border-t border-[#515151] pt-3 pb-3">
                <div className="px-6 mb-1.5">
                  <span className="text-sm font-medium text-[#888888]">General</span>
                </div>
                <nav className="space-y-6 px-6">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center gap-2.5 text-sm font-medium',
                          isActive
                            ? 'text-[#E72858] font-semibold'
                            : 'text-white font-medium'
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="w-6 h-6" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Profile Section */}
              <div className="border-t border-[#515151] mt-auto">
                <div className="px-6 py-4.5">
                  <span className="text-sm font-medium text-[#888888] block mb-4">Profile</span>
                  <nav className="space-y-4">
                    <button className="group flex items-center gap-2.5 text-sm font-medium text-white w-full">
                      <Bell className="w-6 h-6" />
                      Notifications
                    </button>
                    <Link href="/admin/settings" className="group flex items-center gap-2.5 text-sm font-medium text-white w-full">
                      <Settings className="w-6 h-6" />
                      Settings
                    </Link>
                    <button onClick={handleLogout} className="group flex items-center gap-2.5 text-sm font-medium text-white w-full">
                      <LogOut className="w-6 h-6" />
                      Log out
                    </button>
                  </nav>
                </div>

                <div className="border-t border-[#515151] px-6 py-4.5">
                  <div className="flex items-center gap-[5px]">
                    <div className="w-[37px] h-[37px] bg-gray-400 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-white">{user?.email}</div>
                    </div>
                    <ChevronDown className="w-[18px] h-[18px] text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[284px] lg:flex-col">
        <div className="flex flex-col flex-grow bg-[#1A2038] rounded-r-[30px] overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between px-[22px] pt-[27px] pb-6">
            <div className="w-[140px] h-[51px] bg-white/10 rounded flex items-center justify-center text-white font-bold">
              LOGO
            </div>
            <button className="w-9 h-9 bg-[#F7F7F7] border border-[#EEEEEE] rounded-md flex items-center justify-center">
              <MenuIcon className="w-6 h-6 text-black" />
            </button>
          </div>

          {/* Navigation - General */}
          <div className="flex-1 flex flex-col">
            <div className="border-t border-[#515151] pt-3 pb-6">
              <div className="px-6 mb-1.5">
                <span className="text-sm font-medium text-[#888888]">General</span>
              </div>
              <nav className="space-y-6 px-6">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-2.5 text-sm font-medium',
                        isActive
                          ? 'text-[#E72858] font-semibold'
                          : 'text-white font-medium'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Profile Section */}
            <div className="mt-auto border-t border-[#515151]">
              <div className="px-6 py-4.5">
                <span className="text-sm font-medium text-[#888888] block mb-4">Profile</span>
                <nav className="space-y-4">
                  <button className="group flex items-center gap-2.5 text-sm font-medium text-white w-full">
                    <Bell className="w-6 h-6" />
                    Notifications
                  </button>
                  <Link href="/admin/settings" className="group flex items-center gap-2.5 text-sm font-medium text-white w-full">
                    <Settings className="w-6 h-6" />
                    Settings
                  </Link>
                  <button onClick={handleLogout} className="group flex items-center gap-2.5 text-sm font-medium text-white w-full">
                    <LogOut className="w-6 h-6" />
                    Log out
                  </button>
                </nav>
              </div>

              <div className="border-t border-[#515151] px-6 py-4.5">
                <div className="flex items-center gap-[5px]">
                  <div className="w-[37px] h-[37px] bg-gray-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-white">{user?.email}</div>
                  </div>
                  <ChevronDown className="w-[18px] h-[18px] text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 bg-white p-2 rounded-md shadow-md"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>
    </>
  );
}