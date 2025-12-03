'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Eye, Calendar, Download, ArrowUpDown, ChevronDown, X, Check, MoreVertical, Search, Grid, List, Edit, Ban, Trash2 } from 'lucide-react';

export default function CommunitiesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewCommunityId, setViewCommunityId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewCommunity = (id: string) => {
    setViewCommunityId(id);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setViewCommunityId(null);
  };

  // Mock data for communities
  const communities = [
    { id: '1', name: 'TravelCom', image: '/placeholder.jpg', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Active' },
    { id: '2', name: 'Floyd Miles', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Free', status: 'Active' },
    { id: '3', name: 'Robert Fox', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Active' },
    { id: '4', name: 'Esther Howard', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Suspended' },
    { id: '5', name: 'Kathryn Murphy', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Pending' },
    { id: '6', name: 'Guy Hawkins', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Active' },
    { id: '7', name: 'Arlene McCoy', image: '/placeholder.jpg', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Active' },
    { id: '8', name: 'Albert Flores', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Active' },
    { id: '9', name: 'Eleanor Pena', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Active' },
    { id: '10', name: 'Leslie Alexander', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Active' },
    { id: '11', name: 'Annette Black', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Active' },
    { id: '12', name: 'Jane Cooper', image: '/placeholder.png', dateCreated: '07/05/2025', creator: { name: 'Cody Fisher', email: 'curtis@example.com', image: '/placeholder.png' }, members: '1,205,665', type: 'Paid', status: 'Active' },
  ];

  const toggleCommunity = (id: string) => {
    setSelectedCommunities(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedCommunities(prev =>
      prev.length === communities.length ? [] : communities.map(c => c.id)
    );
  };

  return (
    <div className="min-h-screen bg-white lg:rounded-[40px] p-4 lg:p-0 lg:pl-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-[13px] lg:absolute lg:left-[340px] lg:top-[33px] mb-4 lg:mb-0">
        <div className="flex items-center gap-[5px]">
          <button className="flex items-center justify-center w-[36px] h-[36px] bg-[#F7F7F7] border border-[#EEEEEE] rounded-[6px]">
            <ChevronLeft className="w-6 h-6 text-[#1F1F1F]" />
          </button>
          <button className="flex items-center justify-center w-[36px] h-[36px] bg-[#F7F7F7] border border-[#EEEEEE] rounded-[6px]">
            <ChevronRight className="w-6 h-6 text-[#1F1F1F] opacity-30" />
          </button>
        </div>
        <div className="flex items-center gap-[5px]">
          <span className="font-normal text-[15px] leading-[25px] text-[#919191]">Pages /</span>
          <span className="font-semibold text-[17.5px] leading-[25px] text-black">Communities</span>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex flex-wrap items-center gap-4 lg:absolute lg:right-8 lg:top-[28px] lg:flex-nowrap lg:gap-[21px] mb-4 lg:mb-0">
        {/* Search */}
        <div className="relative w-full lg:w-[335px] h-[45px]">
          <div className="absolute inset-0 bg-white border-[1.5px] border-[#EEEEEE] rounded-[12px]"></div>
          <Search className="absolute left-[20px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6E6D6D]" />
          <input
            type="text"
            placeholder="Search items, categories, or more..."
            className="absolute left-[46px] right-[12px] top-1/2 -translate-y-1/2 h-[20px] font-normal text-[12px] leading-[20px] tracking-[-0.02em] text-[#6E6D6D] bg-transparent outline-none"
          />
        </div>

        {/* View Toggle */}
        <div className="hidden lg:flex items-center gap-[15.36px]">
          <button className="w-[21.02px] h-[21.02px] border-[1.6166px] border-[#6E6E6E] rounded flex items-center justify-center">
            <Grid className="w-3 h-3 text-[#6E6E6E]" />
          </button>
          <button className="w-[21.02px] h-[21.02px] border-[1.6166px] border-[#6E6E6E] rounded flex items-center justify-center">
            <List className="w-3 h-3 text-[#6E6E6E]" />
          </button>
          <button className="w-[21.02px] h-[21.02px] border-[1.6166px] border-[#6E6E6E] rounded flex items-center justify-center">
            <Grid className="w-2 h-2 text-[#6E6E6E]" />
          </button>
        </div>

        <div className="hidden lg:block w-0 h-[23.88px] border-[1.62786px] border-[#EEEEEE]"></div>

        {/* Profile */}
        <div className="hidden lg:flex items-center gap-[13px]">
          <div className="w-[33.61px] h-[33.61px] bg-gray-300 rounded-full"></div>
          <ChevronDown className="w-[18px] h-[18px] text-[#6E6E6E]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full lg:static lg:ml-0 lg:pt-[113px] max-w-[calc(100vw-320px-64px)] lg:max-w-none">
        {/* Title and Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-[15px]">
          <h1 className="font-semibold text-[24px] lg:text-[28px] leading-[20px] tracking-[-0.02em] text-black">All communities</h1>
          
          <div className="flex flex-wrap items-center gap-[10px]">
            <button className="flex items-center justify-center gap-[5.62px] px-[13.48px] py-[5.62px] bg-white border-[0.674057px] border-[#D9D9D9] rounded-[6.74057px]">
              <Eye className="w-[15.73px] h-[15.73px]" />
              <span className="font-semibold text-[13.03px] leading-[27px] text-[#1F1F1F]">View all</span>
            </button>
            <button className="flex items-center justify-center gap-[5.66px] px-[13.59px] py-[5.66px] bg-white border-[0.679339px] border-[#D9D9D9] rounded-[6.79339px]">
              <span className="font-semibold text-[13.13px] leading-[27px] text-[#1F1F1F]">Last 30 days</span>
              <Calendar className="w-[22.64px] h-[22.64px] text-[#403F3F]" />
            </button>
            <button className="flex items-center justify-center gap-[5.62px] px-[13.48px] py-[5.62px] bg-white border-[0.674057px] border-[#D9D9D9] rounded-[6.74057px]">
              <Download className="w-[15.73px] h-[15.73px]" />
              <span className="font-semibold text-[13.03px] leading-[27px] text-[#1F1F1F]">Export</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-[4.71px] border-b border-[#EEEEEE] mb-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center justify-center px-[22.35px] py-[22px] whitespace-nowrap ${
              activeTab === 'all' ? 'border-b-[3px] border-[#E72858]' : ''
            }`}
          >
            <span className={`${activeTab === 'all' ? 'font-medium' : 'font-normal'} text-[16px] leading-[150%] text-black`}>
              All communities
            </span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center justify-center px-[22.35px] py-[13.33px] rounded-[6.67px] whitespace-nowrap ${
              activeTab === 'active' ? 'border-b-[3px] border-[#E72858]' : ''
            }`}
          >
            <span className="font-normal text-[16px] leading-[150%] text-black">Active</span>
          </button>
          <button
            onClick={() => setActiveTab('suspended')}
            className={`flex items-center justify-center px-[22.35px] py-[13.33px] rounded-[6.67px] whitespace-nowrap ${
              activeTab === 'suspended' ? 'border-b-[3px] border-[#E72858]' : ''
            }`}
          >
            <span className="font-normal text-[16px] leading-[150%] text-black">Suspended</span>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center justify-center px-[22.35px] py-[13.33px] gap-[7px] rounded-[6.67px] whitespace-nowrap ${
              activeTab === 'pending' ? 'border-b-[3px] border-[#E72858]' : ''
            }`}
          >
            <span className="font-normal text-[16px] leading-[150%] text-black">Pending Approval</span>
            <div className="flex items-center justify-center w-[17.29px] h-[17.29px] bg-[#E72858] rounded-[4px]">
              <span className="font-semibold text-[12.35px] leading-[150%] text-white">2</span>
            </div>
          </button>
        </div>

        {/* Table Container */}
        <div className="w-full mt-0 border border-[#EAEBEF] rounded-[9.63373px] overflow-x-auto">
          {/* Table Header */}
          <div className="min-w-[800px] h-[53px] bg-[#F8F8F8] border-b border-[#EAEBEF] rounded-t-[9.63373px] flex items-center px-[26px]">
            <div className="w-[20px] h-[20px] border border-[#E0E0E0] rounded-[4px] bg-white mr-[12px]"></div>
            <div className="flex items-center justify-between flex-1">
              <span className="font-medium text-[14px] leading-[20px] text-[#6E6D6D] w-[118px]">Community name</span>
              <div className="flex items-center gap-[2px] w-[101px]">
                <span className="font-medium text-[14px] leading-[20px] text-[#6E6D6D]">Date created</span>
                <ArrowUpDown className="w-[12px] h-[12px] text-[#6E6D6D]" />
              </div>
              <span className="font-medium text-[14px] leading-[20px] text-[#6E6D6D] w-[51px]">Creator</span>
              <span className="font-medium text-[14px] leading-[20px] text-[#6E6D6D] w-[74.84px]">Members</span>
              <span className="font-medium text-[14px] leading-[20px] text-[#6E6D6D] w-[34px]">Type</span>
              <span className="font-medium text-[14px] leading-[20px] text-[#6E6D6D] w-[52.27px]">Status</span>
              <span className="font-medium text-[14px] leading-[20px] text-[#6E6D6D] w-[52.27px]">Actions</span>
            </div>
          </div>

          {/* Table Body */}
          {communities.map((community, index) => (
            <div key={community.id}>
              <div className="min-w-[800px] h-[54px] flex items-center px-[26px]">
                <div
                  onClick={() => toggleCommunity(community.id)}
                  className="w-[20px] h-[20px] border-[1.2px] border-[#EEEEEE] rounded-[4px] mr-[12px] cursor-pointer flex items-center justify-center"
                >
                  {selectedCommunities.includes(community.id) && (
                    <Check className="w-[14px] h-[14px] text-[#E72858]" />
                  )}
                </div>
                
                <div className="flex items-center justify-between flex-1">
                  {/* Community */}
                  <div className="flex items-center gap-[6px] w-[199px]">
                    <div className="w-[54px] h-[54px] bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="font-medium text-[16px] leading-[20px] text-black truncate">{community.name}</span>
                    </div>
                  </div>

                  {/* Date Created */}
                  <span className="font-medium text-[14px] leading-[20px] text-[#6E6D6D] w-[80px]">{community.dateCreated}</span>

                  {/* Creator */}
                  <div className="flex items-center gap-[6px] w-[199px]">
                    <div className="w-[54px] h-[54px] bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex flex-col justify-center gap-[6px] min-w-0">
                      <span className="font-medium text-[16px] leading-[20px] text-black truncate">{community.creator.name}</span>
                      <span className="font-medium text-[14px] leading-[20px] text-center text-[#5B5B5B] truncate">{community.creator.email}</span>
                    </div>
                  </div>

                  {/* Members */}
                  <span className="font-medium text-[14px] leading-[20px] text-black w-[67px]">{community.members}</span>

                  {/* Type */}
                  <span className="font-medium text-[14px] leading-[20px] text-black w-[30px]">{community.type}</span>

                  {/* Status */}
                  <div className="w-[108px]">
                    {community.status === 'Active' && (
                      <div className="flex items-center gap-[4px] px-[10px] py-[3px] bg-[rgba(2,173,91,0.1)] rounded-[120px] w-fit">
                        <div className="w-[8px] h-[8px] bg-[#008A50] rounded-full"></div>
                        <span className="font-medium text-[14px] leading-[20px] text-[#008A50] whitespace-nowrap">Active</span>
                      </div>
                    )}
                    {community.status === 'Suspended' && (
                      <div className="flex items-center gap-[4px] px-[10px] py-[3px] bg-[rgba(239,68,68,0.1)] rounded-[120px] w-fit">
                        <div className="w-[8px] h-[8px] bg-[#EF4444] rounded-full"></div>
                        <span className="font-medium text-[14px] leading-[20px] text-[#EF4444] whitespace-nowrap">Suspended</span>
                      </div>
                    )}
                    {community.status === 'Pending' && (
                      <div className="flex items-center gap-[4px]">
                        <button className="flex items-center justify-center gap-[4px] px-[10px] py-[8px] bg-[#E72858] rounded-[120px]">
                          <Check className="w-[15px] h-[15px] text-white" />
                          <span className="font-medium text-[14px] leading-[20px] text-white whitespace-nowrap">Approve</span>
                        </button>
                        <button className="flex items-center justify-center gap-[4px] px-[10px] py-[3px] bg-[rgba(91,91,91,0.1)] rounded-[120px]">
                          <X className="w-[15px] h-[15px] text-[#5B5B5B]" />
                          <span className="font-medium text-[14px] leading-[20px] text-[#5B5B5B] whitespace-nowrap">Reject</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="w-[52.27px] flex items-center justify-center relative">
                    <button 
                      className="p-1"
                      onClick={() => setOpenMenuId(openMenuId === community.id ? null : community.id)}
                    >
                      <MoreVertical className="w-5 h-5 text-[#1F1F1F]" />
                    </button>

                    {/* Action Menu Popup */}
                    {openMenuId === community.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-0 top-8 w-[196px] bg-white rounded-[21px] shadow-[0px_151px_60px_rgba(156,156,156,0.01),0px_85px_51px_rgba(156,156,156,0.05),0px_38px_38px_rgba(156,156,156,0.09),0px_9px_21px_rgba(156,156,156,0.1)] z-50"
                      >
                        <div className="flex flex-col items-center justify-center gap-[7px] px-[23px] py-[20.5px]">
                          {/* Edit Details */}
                          <button className="flex items-center gap-[8px] w-full h-[25px]">
                            <Edit className="w-[20px] h-[20px] text-[#1F1F1F]" />
                            <span className="font-medium text-[14px] leading-[25px] text-[#1F1F1F]">Edit details</span>
                          </button>

                          <div className="w-full h-[0.5px] bg-[#E0E0E0]"></div>

                          {/* View Community */}
                          <button 
                            className="flex items-center gap-[8px] w-full h-[25px]"
                            onClick={() => handleViewCommunity(community.id)}
                          >
                            <Eye className="w-[20px] h-[20px] text-[#1F1F1F]" />
                            <span className="font-medium text-[14px] leading-[25px] text-[#1F1F1F]">View community</span>
                          </button>

                          <div className="w-full h-[0.5px] bg-[#E0E0E0]"></div>

                          {/* Block */}
                          <button className="flex items-center gap-[8px] w-full h-[25px]">
                            <Ban className="w-[20px] h-[20px] text-[#1F1F1F]" />
                            <span className="font-medium text-[14px] leading-[25px] text-[#1F1F1F]">Block</span>
                          </button>

                          <div className="w-full h-[0.5px] bg-[#E0E0E0]"></div>

                          {/* Delete Community */}
                          <button className="flex items-center gap-[8px] w-full h-[25px]">
                            <Trash2 className="w-[20px] h-[20px] text-[#EF4646]" />
                            <span className="font-medium text-[14px] leading-[25px] text-[#EF4646]">Delete community</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {index < communities.length - 1 && (
                <div className="w-full h-[1px] bg-[#EEEEEE]"></div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center lg:justify-end items-center gap-[16.09px] mt-4">
          {/* Previous buttons */}
          <div className="flex items-center gap-[4.47px]">
            <button className="relative w-[29.49px] h-[29.49px] border-[0.89375px] border-[#EAEBEF] rounded-[4.47px] flex items-center justify-center">
              <div className="flex">
                <ChevronLeft className="w-[14px] h-[14px] text-[#999999]" />
                <ChevronLeft className="w-[14px] h-[14px] text-[#999999] -ml-2" />
              </div>
            </button>
            <button className="relative w-[29.49px] h-[29.49px] border-[0.89375px] border-[#EAEBEF] rounded-[4.47px] flex items-center justify-center">
              <ChevronLeft className="w-[14px] h-[14px] text-[#999999]" />
            </button>
          </div>

          {/* Next buttons */}
          <div className="flex items-center gap-[4.47px]">
            <button className="relative w-[29.49px] h-[29.49px] border-[0.89375px] border-[#EAEBEF] rounded-[4.47px] flex items-center justify-center">
              <ChevronRight className="w-[14px] h-[14px] text-[#1F1F1F]" />
            </button>
            <button className="relative w-[29.49px] h-[29.49px] border-[0.89375px] border-[#EAEBEF] rounded-[4.47px] flex items-center justify-center">
              <div className="flex">
                <ChevronRight className="w-[14px] h-[14px] text-[#1F1F1F] -mr-2" />
                <ChevronRight className="w-[14px] h-[14px] text-[#1F1F1F]" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* View Community Modal */}
      {viewCommunityId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="relative w-full max-w-[900px] max-h-[85vh] bg-white rounded-[35px] overflow-hidden flex flex-col">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              <div className="px-12 pt-12 pb-8">
                {/* Header with Back Arrow */}
                <div className="flex items-center gap-[10px] mb-[81px]">
                  <button className="w-8 h-4 border-[2.67px] border-black rounded flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-black" />
                  </button>
                  <h1 className="font-medium text-[32px] leading-[25px] text-black">
                    Community details | Morocco travel Guides
                  </h1>
                  <div className="ml-auto flex items-center justify-center gap-[8px] px-[20px] py-[6px] bg-[#03974F] rounded-[1200px]">
                    <Check className="w-5 h-5 text-white" />
                    <span className="font-semibold text-[14.22px] leading-[17px] text-white">Free</span>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex items-center gap-[7.11px] mb-[64px]">
                  <div className="w-[64px] h-[64px] bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex flex-col justify-center gap-[7.11px]">
                    <span className="font-medium text-[18.963px] leading-[24px] text-black">Cody Fisher</span>
                    <span className="font-medium text-[16.5926px] leading-[24px] text-[#5B5B5B]">curtis@example.com</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#E0E0E0] mb-[32px]"></div>

                {/* Overview Section */}
                <div className="mb-[64px]">
                  <h2 className="font-medium text-[28px] leading-[25px] text-black mb-[24px]">Overview</h2>
                  
                  {/* Description */}
                  <div className="mb-[16px]">
                    <h3 className="font-medium text-[20px] leading-[25px] text-black mb-[16px]">Description</h3>
                    <p className="font-normal text-[18px] leading-[25px] text-[#1F1F1F]">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                  </div>

                  <div className="w-full h-[1px] bg-[#E0E0E0] my-[16px]"></div>

                  {/* Details Grid */}
                  <div className="flex items-center gap-[91px]">
                    <div className="flex flex-col gap-[16px]">
                      <span className="font-medium text-[20px] leading-[25px] text-black">Category</span>
                      <span className="font-normal text-[18px] leading-[25px] text-[#1F1F1F]">Travel</span>
                    </div>

                    <div className="w-[0.5px] h-[59.5px] bg-[#E0E0E0]"></div>

                    <div className="flex flex-col gap-[16px]">
                      <span className="font-medium text-[20px] leading-[25px] text-black">Creation Date</span>
                      <span className="font-normal text-[18px] leading-[25px] text-[#1F1F1F]">12/12/2025</span>
                    </div>

                    <div className="w-[0.5px] h-[59.5px] bg-[#E0E0E0]"></div>

                    <div className="flex flex-col gap-[16px]">
                      <span className="font-medium text-[20px] leading-[25px] text-black">Category</span>
                      <div className="flex items-center gap-[4px] px-[10px] py-[3px] bg-[rgba(2,173,91,0.1)] rounded-[120px] w-fit">
                        <div className="w-[8px] h-[8px] bg-[#008A50] rounded-full"></div>
                        <span className="font-medium text-[14px] leading-[20px] text-[#008A50]">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="flex items-center gap-[13px] mb-[64px]">
                  {/* Members */}
                  <div className="flex-1 h-[122px] bg-white border border-[#E0E0E0] rounded-[14px] px-[24px] py-[22px]">
                    <div className="flex flex-col gap-[16px]">
                      <span className="font-medium text-[18px] leading-[25px] text-[#6E6E6E]">Members</span>
                      <span className="font-semibold text-[30px] leading-[32px] tracking-[-1px] text-[#353535] text-right">60,663</span>
                    </div>
                  </div>

                  {/* Posts */}
                  <div className="flex-1 h-[122px] bg-white border border-[#E0E0E0] rounded-[14px] px-[24px] py-[22px]">
                    <div className="flex flex-col gap-[16px]">
                      <span className="font-medium text-[18px] leading-[25px] text-[#6E6E6E]">Posts</span>
                      <span className="font-semibold text-[30px] leading-[32px] tracking-[-1px] text-[#353535] text-right">456</span>
                    </div>
                  </div>

                  {/* Trajets */}
                  <div className="flex-1 h-[122px] bg-white border border-[#E0E0E0] rounded-[14px] px-[24px] py-[22px]">
                    <div className="flex flex-col gap-[16px]">
                      <span className="font-medium text-[18px] leading-[25px] text-[#6E6E6E]">Trajets</span>
                      <span className="font-semibold text-[30px] leading-[32px] tracking-[-1px] text-[#353535] text-right">19</span>
                    </div>
                  </div>

                  {/* Engagement Rate */}
                  <div className="flex-1 h-[122px] bg-white border border-[#E0E0E0] rounded-[14px] px-[24px] py-[22px]">
                    <div className="flex flex-col gap-[16px]">
                      <span className="font-medium text-[18px] leading-[25px] text-[#6E6E6E]">Engagement Rate</span>
                      <span className="font-semibold text-[30px] leading-[32px] tracking-[-1px] text-[#353535] text-right">8.5%</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#E0E0E0] mb-[32px]"></div>

                {/* Content Section */}
                <div className="mb-[32px]">
                  <h2 className="font-medium text-[28px] leading-[25px] text-black mb-[24px]">Content</h2>
                  
                  <div className="flex gap-[120px]">
                    {/* Latest Posts */}
                    <div className="flex flex-col gap-[16px]">
                      <h3 className="font-medium text-[20px] leading-[25px] text-black">Latest Posts</h3>
                      
                      {/* Post 1 */}
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[43px] h-[43px] bg-gray-300 rounded-[8px] flex-shrink-0"></div>
                        <span className="font-normal text-[18px] leading-[25px] text-[#1F1F1F]">Lorem ipsum dolor sit amet, consectetur ....</span>
                      </div>

                      {/* Post 2 */}
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[43px] h-[43px] bg-gray-300 rounded-[8px] flex-shrink-0"></div>
                        <span className="font-normal text-[18px] leading-[25px] text-[#1F1F1F]">Lorem ipsum dolor sit amet, consectetur ....</span>
                      </div>

                      {/* Post 3 */}
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[43px] h-[43px] bg-gray-300 rounded-[8px] flex-shrink-0"></div>
                        <span className="font-normal text-[18px] leading-[25px] text-[#1F1F1F]">Lorem ipsum dolor sit amet, consectetur ....</span>
                      </div>
                    </div>

                    {/* Latest Trajets */}
                    <div className="flex flex-col gap-[16px]">
                      <h3 className="font-medium text-[20px] leading-[25px] text-black">Latest Trajets</h3>
                      
                      {/* Trajet 1 */}
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[43px] h-[43px] bg-gray-300 rounded-[8px] flex-shrink-0"></div>
                        <span className="font-normal text-[18px] leading-[25px] text-[#1F1F1F]">Casablanca - Rabat</span>
                      </div>

                      {/* Trajet 2 */}
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[43px] h-[43px] bg-gray-300 rounded-[8px] flex-shrink-0"></div>
                        <span className="font-normal text-[18px] leading-[25px] text-[#1F1F1F]">Casablanca - Rabat</span>
                      </div>

                      {/* Trajet 3 */}
                      <div className="flex items-center gap-[8px]">
                        <div className="w-[43px] h-[43px] bg-gray-300 rounded-[8px] flex-shrink-0"></div>
                        <span className="font-normal text-[18px] leading-[25px] text-[#1F1F1F]">Casablanca - Rabat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Bar with Actions */}
            <div className="w-full h-[138px] bg-white shadow-[0px_-284px_114px_rgba(209,209,209,0.01),0px_-160px_96px_rgba(209,209,209,0.05),0px_-71px_71px_rgba(209,209,209,0.09),0px_-18px_39px_rgba(209,209,209,0.1)] rounded-b-[35px] flex items-center justify-center gap-[16px] px-12">
              {/* View Community Button */}
              <button className="flex items-center justify-center gap-[8px] px-[29px] py-[10px] h-[60px] border border-[#E0E0E0] rounded-[1200px]">
                <Eye className="w-6 h-6 text-[#1F1F1F]" />
                <span className="font-semibold text-[16px] leading-[19px] text-[#1F1F1F]">View community</span>
              </button>

              {/* Suspend Community Button */}
              <button className="flex items-center justify-center gap-[8px] px-[29px] py-[10px] h-[60px] border border-[#E0E0E0] rounded-[1200px]">
                <Ban className="w-6 h-6 text-[#1F1F1F]" />
                <span className="font-semibold text-[16px] leading-[19px] text-[#1F1F1F]">Suspend community</span>
              </button>

              {/* Delete Community Button */}
              <button className="flex items-center justify-center gap-[8px] px-[29px] py-[10px] h-[60px] border border-[#E0E0E0] rounded-[1200px]">
                <Trash2 className="w-6 h-6 text-[#EF4646]" />
                <span className="font-semibold text-[16px] leading-[19px] text-[#EF4646]">Delete community</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}