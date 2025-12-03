'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Users, Shield, Globe, LogOut, Camera, Eye, EyeOff, ChevronDown } from 'lucide-react';

type SettingSection = 'personal' | 'password' | 'language' | 'logout';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>('personal');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-[13px] mb-[47px]">
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
          <span className="text-[17.5px] leading-[25px] text-black font-semibold">Settings</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-[28px] leading-[20px] font-semibold tracking-[-0.02em] text-black mb-[44px]">
        Settings
      </h1>

      {/* Main Content */}
      <div className="flex gap-5">
        {/* Left Sidebar - Settings Menu */}
        <div className="w-[378px] h-[287px] bg-white border-[1.12px] border-[#EAEBEF] rounded-[19px] p-[25px]">
          <div className="flex flex-col gap-8">
            <button
              onClick={() => setActiveSection('personal')}
              className="flex items-center gap-[11.67px]"
            >
              <Users className={`w-[28.01px] h-[28.01px] ${activeSection === 'personal' ? 'text-[#E72858]' : 'text-[#1B1B1B]'}`} strokeWidth={2.33} />
              <span className={`text-[16.34px] leading-[29px] ${activeSection === 'personal' ? 'font-bold text-[#E72858]' : 'font-medium text-[#1B1B1B]'}`}>
                Personal informations
              </span>
            </button>

            <button
              onClick={() => setActiveSection('password')}
              className="flex items-center gap-[11.67px]"
            >
              <Shield className={`w-[28.01px] h-[28.01px] ${activeSection === 'password' ? 'text-[#E72858]' : 'text-[#1B1B1B]'}`} strokeWidth={2.33} />
              <span className={`text-[16.34px] leading-[29px] ${activeSection === 'password' ? 'font-bold text-[#E72858]' : 'font-medium text-[#1B1B1B]'}`}>
                Password & Security
              </span>
            </button>

            <button
              onClick={() => setActiveSection('language')}
              className="flex items-center gap-[11.67px]"
            >
              <Globe className={`w-[28.01px] h-[28.01px] ${activeSection === 'language' ? 'text-[#E72858]' : 'text-[#1B1B1B]'}`} strokeWidth={2.33} />
              <span className={`text-[16.34px] leading-[29px] ${activeSection === 'language' ? 'font-bold text-[#E72858]' : 'font-medium text-[#1B1B1B]'}`}>
                Langue
              </span>
            </button>

            <button
              onClick={() => setActiveSection('logout')}
              className="flex items-center gap-[11.67px]"
            >
              <LogOut className={`w-[28.01px] h-[28.01px] ${activeSection === 'logout' ? 'text-[#E72858]' : 'text-[#1B1B1B]'}`} strokeWidth={2.33} />
              <span className={`text-[16.34px] leading-[29px] ${activeSection === 'logout' ? 'font-bold text-[#E72858]' : 'font-medium text-[#1B1B1B]'}`}>
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        {activeSection === 'personal' && (
          <div className="w-[949px] h-[584px] bg-white border-[1.12px] border-[#EAEBEF] rounded-[19px] p-[40px]">
            <div className="flex flex-col gap-[85px]">
              <div className="flex flex-col gap-[57px]">
                {/* Profile Picture */}
                <div className="relative w-[113px] h-[108px]">
                  <div className="w-[108px] h-[108px] rounded-full bg-gray-300"></div>
                  <button className="absolute right-0 bottom-0 w-8 h-8 bg-white border-[0.59px] border-[#EEEEEE] rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-black" strokeWidth={1.68} />
                  </button>
                </div>

                {/* Form Fields Row 1 */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-[15px] w-[414px]">
                    <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Nom</label>
                    <div className="flex items-center px-[19px] py-[21.87px] h-[60px] bg-white border border-[#E0E0E0] rounded-[14px]">
                      <input
                        type="text"
                        placeholder="Jenny Wilson"
                        className="w-full text-sm leading-[17px] font-medium text-[#7E7E7E] bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-[15px] w-[414px]">
                    <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Email</label>
                    <div className="flex items-center px-[19px] py-[21.87px] h-[60px] bg-white border border-[#E0E0E0] rounded-[14px]">
                      <input
                        type="email"
                        placeholder="Jennywilson@outlook.com"
                        className="w-full text-sm leading-[17px] font-medium text-[#7E7E7E] bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Fields Row 2 */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-[15px] w-[414px]">
                    <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Role</label>
                    <div className="relative flex items-center px-[19px] py-[21.87px] h-[60px] bg-white border border-[#E0E0E0] rounded-[14px]">
                      <input
                        type="text"
                        value="Admin"
                        readOnly
                        className="w-full text-sm leading-[17px] font-medium text-[#7E7E7E] bg-transparent outline-none"
                      />
                      <ChevronDown className="absolute right-[19px] w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 justify-end">
                <button className="text-sm leading-[17px] font-semibold text-[#6A6A6A]">
                  Cancel
                </button>
                <button className="flex items-center justify-center px-8 py-[13px] h-[49px] bg-[#E72858] rounded-[1200px]">
                  <span className="text-sm leading-[17px] font-bold text-white">Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'password' && (
          <div className="w-[949px] h-[419px] bg-white border-[1.12px] border-[#EAEBEF] rounded-[19px] p-[40px]">
            <div className="flex flex-col gap-[85px]">
              <div className="flex flex-col gap-[57px]">
                {/* Old Password */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-[15px] w-[414px]">
                    <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Old Password</label>
                    <div className="relative flex items-center px-[19px] py-[21.87px] h-[60px] bg-white border border-[#E0E0E0] rounded-[14px]">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        placeholder="Old Password"
                        className="w-full text-sm leading-[17px] font-medium text-[#7E7E7E] bg-transparent outline-none"
                      />
                      <button
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-[19px]"
                      >
                        {showOldPassword ? (
                          <EyeOff className="w-6 h-6 text-black" strokeWidth={2} />
                        ) : (
                          <Eye className="w-6 h-6 text-black" strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* New Password & Confirm Password */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-[15px] w-[414px]">
                    <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">New Password</label>
                    <div className="relative flex items-center px-[19px] py-[21.87px] h-[60px] bg-white border border-[#E0E0E0] rounded-[14px]">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="New Password"
                        className="w-full text-sm leading-[17px] font-medium text-[#7E7E7E] bg-transparent outline-none"
                      />
                      <button
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-[19px]"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-6 h-6 text-black" strokeWidth={2} />
                        ) : (
                          <Eye className="w-6 h-6 text-black" strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[15px] w-[414px]">
                    <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Confirm Password</label>
                    <div className="relative flex items-center px-[19px] py-[21.87px] h-[60px] bg-white border border-[#E0E0E0] rounded-[14px]">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Mot de pass"
                        className="w-full text-sm leading-[17px] font-medium text-[#7E7E7E] bg-transparent outline-none"
                      />
                      <button
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-[19px]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-6 h-6 text-black" strokeWidth={2} />
                        ) : (
                          <Eye className="w-6 h-6 text-black" strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 justify-end">
                <button className="text-sm leading-[17px] font-semibold text-[#6A6A6A]">
                  Cancel
                </button>
                <button className="flex items-center justify-center px-8 py-[13px] h-[49px] bg-[#E72858] rounded-[1200px]">
                  <span className="text-sm leading-[17px] font-bold text-white">Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'language' && (
          <div className="w-[949px] h-[302px] bg-white border-[1.12px] border-[#EAEBEF] rounded-[19px] p-[40px]">
            <div className="flex flex-col gap-[85px]">
              <div className="flex flex-col gap-[57px]">
                {/* Language Selection */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-[15px] w-[414px]">
                    <label className="text-sm leading-[17px] font-medium text-[#7E7E7E]">Language</label>
                    <div className="relative flex items-center px-[19px] py-[21.87px] h-[60px] bg-white border border-[#E0E0E0] rounded-[14px]">
                      <input
                        type="text"
                        value="English"
                        readOnly
                        className="w-full text-sm leading-[17px] font-medium text-[#7E7E7E] bg-transparent outline-none"
                      />
                      <ChevronDown className="absolute right-[19px] w-6 h-6 text-black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 justify-end">
                <button className="text-sm leading-[17px] font-semibold text-[#6A6A6A]">
                  Cancel
                </button>
                <button className="flex items-center justify-center px-8 py-[13px] h-[49px] bg-[#E72858] rounded-[1200px]">
                  <span className="text-sm leading-[17px] font-bold text-white">Save</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
