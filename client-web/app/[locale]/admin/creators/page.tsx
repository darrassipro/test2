'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Eye, Calendar, Upload, Plus, Search } from 'lucide-react';

type CreatorStatus = 'all' | 'active' | 'suspended' | 'pending';

interface Creator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  dateJoined: string;
  communityCount: number;
  followers: number;
  city: string;
  status: 'active' | 'suspended';
}

// Mock data
const mockCreators: Creator[] = [
  {
    id: '1',
    name: 'Cody Fisher',
    email: 'curtis@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'active'
  },
  {
    id: '2',
    name: 'Robert Fox',
    email: 'graham@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'suspended'
  },
  {
    id: '3',
    name: 'Bessie Cooper',
    email: 'young@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'active'
  },
  {
    id: '4',
    name: 'Esther Howard',
    email: 'hanson@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'active'
  },
  {
    id: '5',
    name: 'Cody Fisher',
    email: 'curtis@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'active'
  },
  {
    id: '6',
    name: 'Robert Fox',
    email: 'graham@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'suspended'
  },
  {
    id: '7',
    name: 'Bessie Cooper',
    email: 'young@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'active'
  },
  {
    id: '8',
    name: 'Esther Howard',
    email: 'hanson@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'active'
  },
  {
    id: '9',
    name: 'Bessie Cooper',
    email: 'young@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'active'
  },
  {
    id: '10',
    name: 'Esther Howard',
    email: 'hanson@example.com',
    avatar: '',
    dateJoined: '07/05/2025',
    communityCount: 3,
    followers: 1205665,
    city: 'Rabat',
    status: 'active'
  }
];

export default function CreatorsPage() {
  const [activeTab, setActiveTab] = useState<CreatorStatus>('all');
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const pendingCount = 2;

  const toggleCreator = (id: string) => {
    setSelectedCreators(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const toggleAllCreators = () => {
    if (selectedCreators.length === mockCreators.length) {
      setSelectedCreators([]);
    } else {
      setSelectedCreators(mockCreators.map(c => c.id));
    }
  };

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-[13px] mb-[46px]">
        <div className="flex items-center gap-[5px]">
          <button className="w-9 h-9 flex items-center justify-center bg-[#F7F7F7] border border-[#EEEEEE] rounded-md">
            <ChevronLeft className="w-6 h-6 text-[#1F1F1F]" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center bg-[#F7F7F7] border border-[#EEEEEE] rounded-md opacity-30">
            <ChevronRight className="w-6 h-6 text-[#1F1F1F]" />
          </button>
        </div>
        <div className="flex items-center gap-[5px]">
          <span className="text-[15px] leading-[25px] text-[#919191] font-normal">Pages /</span>
          <span className="text-[17.5px] leading-[25px] text-black font-semibold">Creators</span>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col gap-[15px] mb-[19px]">
        <div className="flex justify-between items-center">
          <h1 className="text-[28px] leading-[20px] font-semibold tracking-[-0.02em] text-black">
            All creators
          </h1>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center justify-center gap-[5.62px] px-[13.48px] py-[5.62px] bg-white border-[0.67px] border-[#D9D9D9] rounded-[6.74px]">
              <Eye className="w-[15.73px] h-[15.73px]" />
              <span className="text-[13.03px] leading-[27px] font-semibold text-[#1F1F1F]">View all</span>
            </button>

            <button className="flex items-center justify-center gap-[5.66px] px-[13.59px] py-[5.66px] bg-white border-[0.68px] border-[#D9D9D9] rounded-[6.79px]">
              <span className="text-[13.13px] leading-[27px] font-semibold text-[#1F1F1F]">Last 30 days</span>
              <Calendar className="w-[22.64px] h-[22.64px] text-[#403F3F]" />
            </button>

            <button className="flex items-center justify-center gap-[5.62px] px-[13.48px] py-[5.62px] bg-white border-[0.67px] border-[#D9D9D9] rounded-[6.74px]">
              <Upload className="w-[15.73px] h-[15.73px]" />
              <span className="text-[13.03px] leading-[27px] font-semibold text-[#1F1F1F]">Export</span>
            </button>

            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-[5.66px] px-[13.59px] py-[5.66px] bg-[#E72858] rounded-lg"
            >
              <Plus className="w-6 h-6 text-white" strokeWidth={2} />
              <span className="text-[13.13px] leading-[27px] font-semibold text-white">Add new creator</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-end items-center gap-[4.71px] border-b border-[#EEEEEE] pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center justify-center px-[22.35px] py-[22px] ${
              activeTab === 'all'
                ? 'bg-white border-b-[3px] border-[#E72858] -mb-[1px]'
                : 'rounded-[6.67px]'
            }`}
          >
            <span className={`text-base leading-[150%] ${activeTab === 'all' ? 'font-medium text-black' : 'font-normal text-black'}`}>
              All creators
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center justify-center px-[22.35px] py-[13.33px] ${
              activeTab === 'active' ? 'bg-white border-b-[3px] border-[#E72858]' : 'rounded-[6.67px]'
            }`}
          >
            <span className={`text-base leading-[150%] ${activeTab === 'active' ? 'font-medium text-black' : 'font-normal text-black'}`}>
              Active
            </span>
          </button>

          <button
            onClick={() => setActiveTab('suspended')}
            className={`flex items-center justify-center px-[22.35px] py-[13.33px] ${
              activeTab === 'suspended' ? 'bg-white border-b-[3px] border-[#E72858]' : 'rounded-[6.67px]'
            }`}
          >
            <span className={`text-base leading-[150%] ${activeTab === 'suspended' ? 'font-medium text-black' : 'font-normal text-black'}`}>
              Suspended
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center justify-center px-[22.35px] py-[13.33px] gap-[7px] ${
              activeTab === 'pending' ? 'bg-white border-b-[3px] border-[#E72858]' : 'rounded-[6.67px]'
            }`}
          >
            <span className={`text-base leading-[150%] ${activeTab === 'pending' ? 'font-medium text-black' : 'font-normal text-black'}`}>
              Pending Approval
            </span>
            {activeTab === 'pending' && (
              <div className="flex items-center justify-center w-[17.29px] h-[17.29px] bg-[#E72858] rounded">
                <span className="text-[12.35px] leading-[150%] font-semibold text-white">{pendingCount}</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative w-full bg-white border-[0.96px] border-[#EAEBEF] rounded-[9.63px]">
        {/* Table Header */}
        <div className="relative h-[53px] bg-[#F8F8F8] border-[0.96px] border-[#EAEBEF] rounded-t-[9.63px] flex items-center px-[26px]">
          <div className="w-5 h-5 border border-[#E0E0E0] rounded bg-white mr-3">
            <input
              type="checkbox"
              checked={selectedCreators.length === mockCreators.length}
              onChange={toggleAllCreators}
              className="w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex items-center flex-1">
            <span className="text-sm leading-5 font-medium text-[#6E6D6D] w-[240px]">Creator name</span>
            <div className="flex items-center gap-0.5 w-[200px]">
              <span className="text-sm leading-5 font-medium text-[#6E6D6D]">Date joined</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-50">
                <path d="M2 5L6 9L10 5" stroke="#6E6D6D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm leading-5 font-medium text-[#6E6D6D] w-[220px]">Community count</span>
            <span className="text-sm leading-5 font-medium text-[#6E6D6D] w-[184px]">Followers</span>
            <span className="text-sm leading-5 font-medium text-[#6E6D6D] w-[141px]">City</span>
            <span className="text-sm leading-5 font-medium text-[#6E6D6D] w-[161px]">Status</span>
            <span className="text-sm leading-5 font-medium text-[#6E6D6D]">Actions</span>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {mockCreators.map((creator, index) => (
            <div key={creator.id}>
              <div className="flex items-center px-[26px] py-4 relative">
                <div className="w-5 h-5 border-[1.2px] border-[#EEEEEE] rounded mr-3">
                  <input
                    type="checkbox"
                    checked={selectedCreators.includes(creator.id)}
                    onChange={() => toggleCreator(creator.id)}
                    className="w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center flex-1">
                  {/* Creator Info */}
                  <div className="flex items-center gap-1.5 w-[240px]">
                    <div className="w-[54px] h-[54px] rounded-full bg-gray-300"></div>
                    <div className="flex flex-col justify-center gap-1.5">
                      <span className="text-base leading-5 font-medium text-black">{creator.name}</span>
                      <span className="text-sm leading-5 font-medium text-[#5B5B5B] text-center">{creator.email}</span>
                    </div>
                  </div>

                  {/* Date Joined */}
                  <span className="text-sm leading-5 font-medium text-[#6E6D6D] w-[200px]">{creator.dateJoined}</span>

                  {/* Community Count */}
                  <span className="text-sm leading-5 font-medium text-black w-[220px]">{creator.communityCount} Communities</span>

                  {/* Followers */}
                  <span className="text-sm leading-5 font-medium text-black w-[184px]">{creator.followers.toLocaleString()}</span>

                  {/* City */}
                  <span className="text-sm leading-5 font-medium text-black w-[141px]">{creator.city}</span>

                  {/* Status */}
                  <div className="w-[161px]">
                    {creator.status === 'active' ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-[3px] bg-[rgba(2,173,91,0.1)] rounded-[120px]">
                        <div className="w-2 h-2 rounded-full bg-[#008A50]"></div>
                        <span className="text-sm leading-5 font-medium text-[#008A50]">Active</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-[3px] bg-[rgba(239,68,68,0.1)] rounded-[120px]">
                        <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                        <span className="text-sm leading-5 font-medium text-[#EF4444]">Suspended</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <button className="flex items-center justify-center">
                    <svg width="18" height="5" viewBox="0 0 18 5" fill="none">
                      <path d="M2.5 2.5H2.51M9 2.5H9.01M15.5 2.5H15.51M3 2.5C3 2.77614 2.77614 3 2.5 3C2.22386 3 2 2.77614 2 2.5C2 2.22386 2.22386 2 2.5 2C2.77614 2 3 2.22386 3 2.5ZM9.5 2.5C9.5 2.77614 9.27614 3 9 3C8.72386 3 8.5 2.77614 8.5 2.5C8.5 2.22386 8.72386 2 9 2C9.27614 2 9.5 2.22386 9.5 2.5ZM16 2.5C16 2.77614 15.7761 3 15.5 3C15.2239 3 15 2.77614 15 2.5C15 2.22386 15.2239 2 15.5 2C15.7761 2 16 2.22386 16 2.5Z" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              {index < mockCreators.length - 1 && (
                <div className="w-full h-px bg-[#EEEEEE]"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-4 mt-[18px]">
        <div className="flex items-center gap-[4.47px]">
          <button className="w-[29.49px] h-[29.49px] border-[0.89px] border-[#EAEBEF] rounded-[4.47px] flex items-center justify-center">
            <svg width="21.45" height="21.45" viewBox="0 0 24 24" fill="none">
              <path d="M11 19L4 12L11 5M4 12H20" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="w-[29.49px] h-[29.49px] border-[0.89px] border-[#EAEBEF] rounded-[4.47px] flex items-center justify-center opacity-30">
            <ChevronLeft className="w-[21.45px] h-[21.45px] text-[#999999]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center gap-[4.47px]">
          <button className="w-[29.49px] h-[29.49px] border-[0.89px] border-[#EAEBEF] rounded-[4.47px] flex items-center justify-center">
            <ChevronRight className="w-[21.45px] h-[21.45px] text-[#1F1F1F]" strokeWidth={1.5} />
          </button>
          <button className="w-[29.49px] h-[29.49px] border-[0.89px] border-[#EAEBEF] rounded-[4.47px] flex items-center justify-center">
            <svg width="21.45" height="21.45" viewBox="0 0 24 24" fill="none">
              <path d="M13 5L20 12L13 19M20 12H4" stroke="#1F1F1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[5px] flex items-center justify-center z-50">
          <div className="relative w-[607px] bg-[#F8F8F8] rounded-[42px] p-12">
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-8 right-8 w-8 h-8 flex items-center justify-center"
            >
              <svg width="8" height="16" viewBox="0 0 8 16" fill="none">
                <path d="M7 1L1 8L7 15" stroke="#000000" strokeWidth="2.67" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Modal Title */}
            <h2 className="text-2xl leading-[25px] font-medium text-black text-center mb-14">
              Add new creators
            </h2>

            {/* Profile Picture */}
            <div className="flex justify-center mb-[35px]">
              <div className="relative">
                <div className="w-[107px] h-[107px] rounded-full bg-gray-300"></div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border-[0.59px] border-[#EEEEEE] rounded-full flex items-center justify-center">
                  <svg width="20.15" height="20.15" viewBox="0 0 24 24" fill="none">
                    <path d="M2 10C2 10 4.00498 7.26822 5.63384 5.63824C7.26269 4.00827 9.5136 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.89691 21 4.43511 18.2543 3.35177 14.5M2 10V4M2 10H8" stroke="#000000" strokeWidth="1.68" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12L15 15" stroke="#000000" strokeWidth="1.68" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-[30px] mb-8">
              {/* Name Field */}
              <div className="flex flex-col gap-[15px]">
                <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Nom</label>
                <input
                  type="text"
                  placeholder="Jenny Wilson"
                  className="w-full h-[60px] px-[19px] bg-white border border-[#E0E0E0] rounded-[14px] text-sm leading-[17px] font-medium text-[#7E7E7E] placeholder:text-[#7E7E7E]"
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-[15px]">
                <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Email</label>
                <input
                  type="email"
                  placeholder="Jennywilson@outlook.com"
                  className="w-full h-[60px] px-[19px] bg-white border border-[#E0E0E0] rounded-[14px] text-sm leading-[17px] font-medium text-[#7E7E7E] placeholder:text-[#7E7E7E]"
                />
              </div>

              {/* Bio Field */}
              <div className="flex flex-col gap-[15px]">
                <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Bio</label>
                <textarea
                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim"
                  className="w-full h-[169px] px-[19px] py-[21.87px] bg-white border border-[#E0E0E0] rounded-[14px] text-sm leading-[17px] font-medium text-[#7E7E7E] placeholder:text-[#7E7E7E] resize-none"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-[15px]">
                <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Passwors"
                    className="w-full h-[60px] px-[19px] pr-[50px] bg-white border border-[#E0E0E0] rounded-[14px] text-sm leading-[17px] font-medium text-[#7E7E7E] placeholder:text-[#7E7E7E]"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[19px] top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-8">
              <button 
                onClick={() => setShowModal(false)}
                className="flex items-center gap-2"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#5B5B5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-lg leading-[37px] font-semibold text-[#5B5B5B] text-center">Cancel</span>
              </button>

              <button className="flex items-center justify-center gap-2 px-[29px] py-2.5 bg-[#E72858] rounded-full">
                <Plus className="w-6 h-6 text-white" strokeWidth={2} />
                <span className="text-base leading-[19px] font-semibold text-white text-center">Add new creator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}