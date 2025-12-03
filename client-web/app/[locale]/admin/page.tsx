'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download, Eye, Info, ChevronDown } from 'lucide-react';
import { useGetDashboardQuery, useGetCreatorsQuery } from '@/lib/api/adminApi';
import Image from 'next/image';

export default function AdminDashboard() {
  const { data: dashboardResponse, isLoading: dashboardLoading, error: dashboardError } = useGetDashboardQuery({});
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: creatorsResponse, isLoading: creatorsLoading } = useGetCreatorsQuery({
    page: currentPage,
    limit: 10,
    status: activeTab === 'all' ? undefined : activeTab,
  });

  const dashboardData = dashboardResponse?.data;
  const creatorsData = creatorsResponse?.data;
  const creators = creatorsData?.creators || [];
  const pagination = creatorsData?.pagination;

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-[#E72858] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-[13px]">
        <div className="flex items-center gap-[5px]">
          <button className="w-9 h-9 bg-[#F7F7F7] border border-[#EEEEEE] rounded-md flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-[#1F1F1F]" />
          </button>
          <button className="w-9 h-9 bg-[#F7F7F7] border border-[#EEEEEE] rounded-md flex items-center justify-center opacity-30">
            <ChevronRight className="w-6 h-6 text-[#1F1F1F]" />
          </button>
        </div>
        <div className="flex items-center gap-[5px]">
          <span className="text-[#919191] font-normal text-[15px] leading-[25px]">Pages /</span>
          <span className="text-black font-semibold text-[17.5px] leading-[25px]">Dashboard</span>
        </div>
      </div>

      {/* Overview Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-[24px] font-semibold leading-5 tracking-[-0.02em] text-black">Overview</h2>
          <div className="flex items-center gap-1">
            <button className="h-[39.32px] px-[13.59px] py-[5.66px] bg-white border border-[#D9D9D9] rounded-md flex items-center gap-[5.66px]">
              <span className="text-[13.13px] font-semibold leading-[27px] text-[#1F1F1F]">06 Oct 2025 - 07 Oct 2025</span>
              <Calendar className="w-[22.64px] h-[22.64px] text-[#1F1F1F]" />
            </button>
            <button className="h-[39.32px] px-[13.59px] py-[5.66px] bg-white border border-[#D9D9D9] rounded-md flex items-center gap-[5.66px]">
              <span className="text-[13.13px] font-semibold leading-[27px] text-[#1F1F1F]">Last 30 days</span>
              <Calendar className="w-[22.64px] h-[22.64px] text-[#403F3F]" />
            </button>
            <button className="h-[39.23px] px-[13.48px] py-[5.62px] bg-white border border-[#D9D9D9] rounded-md flex items-center gap-[5.62px]">
              <Download className="w-[15.73px] h-[15.73px] text-[#1F1F1F]" />
              <span className="text-[13.13px] font-semibold leading-[27px] text-[#1F1F1F]">Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white border border-[#EAEBEF] rounded-[14px] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#6E6E6E]">Total Creators</span>
                  <Info className="w-4 h-4 text-[#6E6D6D]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[30px] font-semibold leading-8 tracking-[-1px] text-[#353535]">
                  {dashboardData?.stats?.totalUsers?.toLocaleString() || '0'}
                </div>
                <div className={`text-sm font-medium ${
                  (dashboardData?.stats?.userGrowth || 0) >= 0 ? 'text-[#008A50]' : 'text-[#C1272D]'
                }`}>
                  {(dashboardData?.stats?.userGrowth || 0) >= 0 ? '+' : ''}
                  {dashboardData?.stats?.userGrowth || 0}% from last month
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#EAEBEF] rounded-[14px] p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#6E6E6E]">Total Communities</span>
              </div>
              <div className="space-y-1">
                <div className="text-[30px] font-semibold leading-8 tracking-[-1px] text-[#353535]">
                  {dashboardData?.stats?.totalCommunities?.toLocaleString() || '0'}
                </div>
                <div className={`text-sm font-medium ${
                  (dashboardData?.stats?.communityGrowth || 0) >= 0 ? 'text-[#008A50]' : 'text-[#C1272D]'
                }`}>
                  {(dashboardData?.stats?.communityGrowth || 0) >= 0 ? '+' : ''}
                  {dashboardData?.stats?.communityGrowth || 0}% from last month
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#EAEBEF] rounded-[14px] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#6E6E6E]">Active Users</span>
                  <Info className="w-4 h-4 text-[#6E6D6D]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[30px] font-semibold leading-8 tracking-[-1px] text-[#353535]">
                  {dashboardData?.stats?.activeUsers?.toLocaleString() || '0'}
                </div>
                <div className={`text-sm font-medium ${
                  (dashboardData?.stats?.userGrowth || 0) >= 0 ? 'text-[#008A50]' : 'text-[#C1272D]'
                }`}>
                  {(dashboardData?.stats?.userGrowth || 0) >= 0 ? '+' : ''}
                  {dashboardData?.stats?.userGrowth || 0}% from last month
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#EAEBEF] rounded-[14px] p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#6E6E6E]">Total Posts</span>
                  <Info className="w-4 h-4 text-[#6E6D6D]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[30px] font-semibold leading-8 tracking-[-1px] text-[#353535]">
                  {dashboardData?.stats?.totalPosts?.toLocaleString() || '0'}
                </div>
                <div className={`text-sm font-medium ${
                  (dashboardData?.stats?.postGrowth || 0) >= 0 ? 'text-[#008A50]' : 'text-[#C1272D]'
                }`}>
                  {(dashboardData?.stats?.postGrowth || 0) >= 0 ? '+' : ''}
                  {dashboardData?.stats?.postGrowth || 0}% from last month
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-[404px_1fr] gap-[11px]">
        {/* Engagement Chart */}
        <div className="bg-white border border-[#EAEBEF] rounded-[14px] p-[34px] relative">
          <div className="space-y-2.5">
            <span className="text-base font-medium text-[#6E6D6D]">Engagement</span>
            <div className="space-y-[3px]">
              <div className="text-[32px] font-semibold leading-8 tracking-[-1px] text-[#353535]">12,9M</div>
              <div className="text-[11.56px] font-medium text-[#02AD5B]">+20.1% from last month</div>
            </div>
          </div>
          <div className="mt-6 h-[177px] relative">
            {/* Line chart placeholder */}
            <svg className="w-full h-full" viewBox="0 0 317 205">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'rgba(231, 40, 88, 0.25)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(231, 40, 88, 0)' }} />
                </linearGradient>
              </defs>
              <path d="M 6 88 L 42 167 L 79 103 L 122 129 L 160 4 L 232 165 L 254 103 L 282 88 L 320 0" 
                    stroke="#E72858" strokeWidth="3" fill="none" />
              <path d="M 6 88 L 42 167 L 79 103 L 122 129 L 160 4 L 232 165 L 254 103 L 282 88 L 320 0 L 320 205 L 6 205 Z" 
                    fill="url(#gradient)" />
              {/* Data points */}
              <circle cx="6" cy="88" r="6" fill="white" stroke="#E72858" strokeWidth="2" />
              <circle cx="42" cy="167" r="6" fill="white" stroke="#E72858" strokeWidth="2" />
              <circle cx="79" cy="103" r="6" fill="white" stroke="#E72858" strokeWidth="2" />
              <circle cx="122" cy="129" r="6" fill="white" stroke="#E72858" strokeWidth="2" />
              <circle cx="160" cy="4" r="6" fill="white" stroke="#E72858" strokeWidth="2" />
              <circle cx="232" cy="165" r="6" fill="white" stroke="#E72858" strokeWidth="2" />
              <circle cx="254" cy="103" r="6" fill="white" stroke="#E72858" strokeWidth="2" />
              <circle cx="282" cy="88" r="6" fill="white" stroke="#E72858" strokeWidth="2" />
              <circle cx="320" cy="0" r="6" fill="white" stroke="#E72858" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white border border-[#EAEBEF] rounded-[14px] p-[34px] relative">
          <div className="flex justify-between items-start">
            <div className="space-y-2.5">
              <span className="text-base font-medium text-[#6E6D6D]">Revenue</span>
              <div className="space-y-[3px]">
                <div className="text-[30px] font-semibold leading-8 tracking-[-1px] text-[#353535]">MAD 3,5M</div>
                <div className="text-[11.56px] font-medium text-[#02AD5B]">+20.1% from last month</div>
              </div>
            </div>
            <button className="h-[39.32px] px-[13.59px] py-[5.66px] bg-white border border-[#D9D9D9] rounded-md flex items-center gap-[5.66px]">
              <span className="text-[13.13px] font-semibold leading-[27px] text-black">Last 30 days</span>
              <Calendar className="w-[22.64px] h-[22.64px] text-[#403F3F]" />
            </button>
          </div>
          <div className="mt-6 h-[192px] flex items-end gap-10 px-8">
            {/* Bar chart */}
            {[25, 50, 50, 90, 15, 83, 85, 95, 7, 65, 27].map((height, index) => (
              <div key={index} className="flex flex-col justify-end items-start gap-0.5 flex-1">
                <div className="w-full bg-[#F3F3F3] rounded-full" style={{ height: `${100 - height}%` }}></div>
                <div className="w-full rounded-full bg-gradient-to-b from-[#E72858] to-[#FF5D86]" style={{ height: `${height}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-[37px] mt-4 text-[11.56px] text-black/40">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].map((num) => (
              <span key={num}>{num}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Creators Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-[28px] font-semibold leading-5 tracking-[-0.02em] text-black">Creators</h2>
          <div className="flex items-center gap-2.5">
            <button className="h-[39.23px] px-[13.48px] py-[5.62px] bg-white border border-[#D9D9D9] rounded-md flex items-center gap-[5.62px]">
              <Eye className="w-[15.73px] h-[15.73px] text-black" />
              <span className="text-[13.03px] font-semibold leading-[27px] text-[#1F1F1F]">View all</span>
            </button>
            <button className="h-[39.32px] px-[13.59px] py-[5.66px] bg-white border border-[#D9D9D9] rounded-md flex items-center gap-[5.66px]">
              <span className="text-[13.13px] font-semibold leading-[27px] text-[#1F1F1F]">Last 30 days</span>
              <Calendar className="w-[22.64px] h-[22.64px] text-[#403F3F]" />
            </button>
            <button className="h-[39.23px] px-[13.48px] py-[5.62px] bg-white border border-[#D9D9D9] rounded-md flex items-center gap-[5.62px]">
              <Download className="w-[15.73px] h-[15.73px] text-black" />
              <span className="text-[13.03px] font-semibold leading-[27px] text-[#1F1F1F]">Export</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#EEEEEE]">
          <div className="flex items-center gap-1 px-1">
            <button 
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
              className={`px-[22.35px] py-[22px] text-base font-medium ${
                activeTab === 'all' 
                  ? 'text-black border-b-[3px] border-[#E72858]' 
                  : 'text-black'
              }`}
            >
              All creators
            </button>
            <button 
              onClick={() => {
                setActiveTab('active');
                setCurrentPage(1);
              }}
              className={`px-[22.35px] py-[13.33px] text-base rounded-md ${
                activeTab === 'active' ? 'text-black' : 'text-black'
              }`}
            >
              Active
            </button>
            <button 
              onClick={() => {
                setActiveTab('suspended');
                setCurrentPage(1);
              }}
              className={`px-[22.35px] py-[13.33px] text-base rounded-md ${
                activeTab === 'suspended' ? 'text-black' : 'text-black'
              }`}
            >
              Suspended
            </button>
            <button 
              onClick={() => {
                setActiveTab('pending');
                setCurrentPage(1);
              }}
              className={`px-[22.35px] py-[13.33px] text-base rounded-md flex items-center gap-[7px] ${
                activeTab === 'pending' ? 'text-black' : 'text-black'
              }`}
            >
              Pending Approval
              <div className="w-[17.29px] h-[17.29px] bg-[#E72858] rounded flex items-center justify-center">
                <span className="text-[12.35px] font-semibold text-white">0</span>
              </div>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#EAEBEF] rounded-[9.63px] overflow-hidden">
          <div className="bg-[#F8F8F8] border-b border-[#EAEBEF] px-7 py-4 flex items-center">
            <div className="w-5 h-5 border border-[#E0E0E0] rounded bg-white mr-8"></div>
            <div className="grid grid-cols-[1fr_120px_140px_120px_80px_90px_90px] gap-4 flex-1">
              <div className="text-sm font-medium text-[#6E6D6D]">Creator name</div>
              <div className="text-sm font-medium text-[#6E6D6D] flex items-center gap-0.5">
                Date joined
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 5L6 9L10 5" stroke="#6E6D6D" strokeWidth="1.4" />
                </svg>
              </div>
              <div className="text-sm font-medium text-[#6E6D6D]">Community count</div>
              <div className="text-sm font-medium text-[#6E6D6D]">Followers</div>
              <div className="text-sm font-medium text-[#6E6D6D]">City</div>
              <div className="text-sm font-medium text-[#6E6D6D]">Status</div>
              <div className="text-sm font-medium text-[#6E6D6D]">Actions</div>
            </div>
          </div>
          
          <div>
            {creatorsLoading ? (
              <div className="py-12 text-center">
                <div className="h-6 w-6 border-2 border-[#E72858] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading creators...</p>
              </div>
            ) : creators.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">No creators found</p>
              </div>
            ) : (
              creators.map((creator: any, index: number) => (
                <div key={creator.id}>
                  <div className="px-7 py-4 flex items-center">
                    <div className="w-5 h-5 border-[1.2px] border-[#EEEEEE] rounded mr-3"></div>
                    <div className="grid grid-cols-[1fr_120px_140px_120px_80px_90px_90px] gap-4 flex-1 items-center">
                      <div className="flex items-center gap-1.5">
                        {creator.avatar ? (
                          <Image 
                            src={creator.avatar} 
                            alt={creator.name}
                            width={54}
                            height={54}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-[54px] h-[54px] bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-lg font-medium">
                              {creator.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-base font-medium text-black">{creator.name}</div>
                          <div className="text-sm font-medium text-[#5B5B5B]">{creator.email}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-[#6E6D6D]">
                        {new Date(creator.dateJoined).toLocaleDateString('en-GB')}
                      </div>
                      <div className="text-sm font-medium text-black">
                        {creator.communities} {creator.communities === 1 ? 'Community' : 'Communities'}
                      </div>
                      <div className="text-sm font-medium text-black">{creator.followers}</div>
                      <div className="text-sm font-medium text-black">{creator.city}</div>
                      <div>
                        {creator.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#02AD5B]/10 rounded-full">
                            <span className="w-2 h-2 bg-[#008A50] rounded-full"></span>
                            <span className="text-sm font-medium text-[#008A50]">Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EF4444]/10 rounded-full">
                            <span className="w-2 h-2 bg-[#EF4444] rounded-full"></span>
                            <span className="text-sm font-medium text-[#EF4444]">Suspended</span>
                          </span>
                        )}
                      </div>
                      <div>
                        <button className="text-[#1F1F1F]">
                          <svg width="18" height="5" viewBox="0 0 18 5" fill="currentColor">
                            <path d="M2 2.5C2 3.328 1.328 4 0.5 4C-0.328 4 -1 3.328 -1 2.5C-1 1.672 -0.328 1 0.5 1C1.328 1 2 1.672 2 2.5Z" />
                            <path d="M10 2.5C10 3.328 9.328 4 8.5 4C7.672 4 7 3.328 7 2.5C7 1.672 7.672 1 8.5 1C9.328 1 10 1.672 10 2.5Z" />
                            <path d="M18 2.5C18 3.328 17.328 4 16.5 4C15.672 4 15 3.328 15 2.5C15 1.672 15.672 1 16.5 1C17.328 1 18 1.672 18 2.5Z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < creators.length - 1 && <div className="border-b border-[#EEEEEE]"></div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-end">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-[29.49px] h-[29.49px] border border-[#EAEBEF] rounded flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 text-[#999999]" />
                </button>
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-[29.49px] h-[29.49px] border border-[#EAEBEF] rounded flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 text-[#999999]" />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="w-[29.49px] h-[29.49px] border border-[#EAEBEF] rounded flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5 text-[#1F1F1F]" />
                </button>
                <button 
                  onClick={() => setCurrentPage(pagination.totalPages)}
                  disabled={currentPage === pagination.totalPages}
                  className="w-[29.49px] h-[29.49px] border border-[#EAEBEF] rounded flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5 text-[#1F1F1F]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}