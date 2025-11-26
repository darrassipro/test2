import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, Info } from 'lucide-react-native';
import { useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/services/slices/userSlice';

export default function ProfileSuccess() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (user) {
      // Calculate completion percentage based on required fields (same as backend)
      const requiredFields = [
        user.firstName,
        user.lastName,
        user.profileImage,
        user.banner,
        user.profileDescription,
        user.country,
      ];

      const filledFields = requiredFields.filter(field => {
        if (typeof field === 'string') {
          return field.trim().length > 0;
        }
        return Boolean(field);
      }).length;

      // Check if at least one social link is filled
      const hasSocialLinks = user.socialMediaLinks && 
        typeof user.socialMediaLinks === 'object' &&
        Object.values(user.socialMediaLinks).some(
          (value) => typeof value === 'string' && value.trim().length > 0
        );

      // Total: 6 required fields + 1 for social links = 7
      const totalRequired = 7;
      const totalFilled = filledFields + (hasSocialLinks ? 1 : 0);
      const percentage = Math.round((totalFilled / totalRequired) * 100);
      setCompletionPercentage(percentage);
    }
  }, [user]);

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  const handleCreateCommunity = () => {
    router.push('/(tabs)');
  };

  const isComplete = user?.isProfileCompleted;

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Success Content */}
      <View className="items-center gap-8 px-[35px]">
        <View className="w-8 h-8 justify-center items-center">
          {isComplete ? (
            <CheckCircle size={32} color="#E72858" fill="#E72858" />
          ) : (
            <Info size={32} color="#FFA500" fill="#FFA500" />
          )}
        </View>

        <View className="items-center gap-4 w-[305px]">
          {isComplete ? (
            <>
              <Text 
                className="text-2xl font-semibold text-[#1F1F1F] text-center leading-[29px]"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                🎉 Your Profil is completed
              </Text>
              <Text 
                className="text-sm font-normal text-[#5B5B5B] text-center leading-[17px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Welcome to your new travel hub a place where you can share your adventures, inspire others, and grow your supporters.
              </Text>
            </>
          ) : (
            <>
              <Text 
                className="text-2xl font-semibold text-[#1F1F1F] text-center leading-[29px]"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                Profile Updated
              </Text>
              <Text 
                className="text-sm font-normal text-[#5B5B5B] text-center leading-[17px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Your profile is {completionPercentage}% complete. Fill in the remaining details to unlock all features and enhance your experience.
              </Text>
              <View className="w-full h-2 bg-[#F0F0F0] rounded overflow-hidden mt-4">
                <View 
                  className="h-full bg-[#E72858] rounded"
                  style={{ width: `${completionPercentage}%` }}
                />
              </View>
              <Text className="text-lg font-semibold text-[#E72858] mt-2">
                {completionPercentage}%
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Bottom Actions */}
      <View className="absolute bottom-7 left-5 right-5 flex-row gap-[3px]">
        <TouchableOpacity 
          className="flex-1 h-[50px] bg-white border border-[#E0E0E0] rounded-[1200px] justify-center items-center"
          onPress={handleGoHome}
        >
          <Text 
            className="text-[15px] font-semibold text-[#1F1F1F] text-center"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Go to Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-1 h-[50px] bg-[#E72858] rounded-[1200px] justify-center items-center"
          onPress={handleCreateCommunity}
        >
          <Text 
            className="text-[15px] font-semibold text-white text-center"
            style={{ fontFamily: 'Inter_500Medium' }}
          >
            Create Post
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}