import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronDown } from 'lucide-react-native';
import { useCompleteRegistrationMutation, useGetCurrentUserQuery } from '@/services/userApi';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectUser } from '@/services/slices/userSlice';
import Toast from 'react-native-toast-message';
import { COUNTRIES } from "@/constants/constant";


export default function CompleteProfile() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  
  const [completeRegistration, { isLoading }] = useCompleteRegistrationMutation();
  const { refetch: refetchCurrentUser } = useGetCurrentUserQuery(undefined);
  
  type SocialLinks = { facebook: string; instagram: string; whatsapp: string };
  const parseSocialLinks = (raw: unknown): SocialLinks => {
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        return { facebook: '', instagram: '', whatsapp: '' };
      }
    }
    const obj = (raw as Partial<SocialLinks>) || {};
    return {
      facebook: typeof obj.facebook === 'string' ? obj.facebook : '',
      instagram: typeof obj.instagram === 'string' ? obj.instagram : '',
      whatsapp: typeof obj.whatsapp === 'string' ? obj.whatsapp : '',
    };
  };

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    profileDescription: user?.profileDescription || '',
    country: user?.country || '',
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(parseSocialLinks(user?.socialMediaLinks));
  
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [bannerImage, setBannerImage] = useState<string | null>(user?.banner || null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileDescription: user.profileDescription || '',
        country: user.country || '',
      });
      setSocialLinks(parseSocialLinks(user.socialMediaLinks));
      setProfileImage(user.profileImage || null);
      setBannerImage(user.banner || null);

      // Check profile completion from backend
      if (user.isProfileCompleted) {
        router.replace('/(tabs)');
      }
    }
  }, [user, router]);

  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleImagePick = async (type: 'profile' | 'banner') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder aux photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (type === 'profile') {
        setProfileImage(result.assets[0].uri);
      } else {
        setBannerImage(result.assets[0].uri);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const registrationData: any = {};

      if (formData.firstName.trim()) registrationData.firstName = formData.firstName.trim();
      if (formData.lastName.trim()) registrationData.lastName = formData.lastName.trim();
      if (formData.profileDescription.trim()) registrationData.profileDescription = formData.profileDescription.trim();
      if (formData.country.trim()) registrationData.country = formData.country.trim();
      if (profileImage) registrationData.profileImage = profileImage;
      if (bannerImage) registrationData.banner = bannerImage;

      const linksToSend = {
        facebook: socialLinks.facebook ? socialLinks.facebook.trim() : '',
        instagram: socialLinks.instagram ? socialLinks.instagram.trim() : '',
        whatsapp: socialLinks.whatsapp ? socialLinks.whatsapp.trim() : '',
      };
      registrationData.socialMediaLinks = JSON.stringify(linksToSend);

      const result = await completeRegistration(registrationData).unwrap();

      if (result.success) {
        await refetchCurrentUser();

        Toast.show({
          type: 'success',
          text1: 'Profil mis à jour',
          text2: result.message || 'Vos informations ont été sauvegardées',
        });

        router.replace('/profile-success');
      }
    } catch (error: any) {
      console.error('Error completing profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: error?.data?.error || 'Impossible de sauvegarder le profil',
      });
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View className="flex-row items-center justify-center px-5 pt-[60px] pb-5">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-5 top-[60px]">
          <Text className="text-2xl font-semibold text-black">←</Text>
        </TouchableOpacity>
        <Text className="font-medium text-lg text-black" style={{ fontFamily: 'Inter_500Medium' }}>
          Complete your Profil
        </Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Banner and Profile Image */}
        <View className="mt-5 items-center mb-10">
          <TouchableOpacity 
            className="w-[345px] h-[164px] rounded-[19px] overflow-hidden bg-[#D9D9D9]"
            onPress={() => handleImagePick('banner')}
          >
            {bannerImage ? (
              <Image source={{ uri: bannerImage }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full bg-[#D9D9D9]" />
            )}
            <TouchableOpacity className="absolute top-[11px] right-[11px] w-[27px] h-[27px] rounded-[13.5px] bg-white border-[0.5px] border-[#EEEEEE] justify-center items-center">
              <Camera size={17} color="#000000" />
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-[84px] h-[84px] rounded-full bg-[#D9D9D9] -mt-[42px] justify-center items-center relative"
            onPress={() => handleImagePick('profile')}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="w-full h-full rounded-full" />
            ) : (
              <View className="w-full h-full bg-[#D9D9D9] rounded-full" />
            )}
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#EEEEEE] justify-center items-center z-10">
              <Camera size={17} color="#000000" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="px-[15px] gap-6">
          {/* Full Name */}
          <View className="gap-[15px]">
            <Text className="text-xs font-medium text-[#1F1F1F]" style={{ fontFamily: 'Inter_500Medium' }}>
              Full name
            </Text>
            <TextInput
              className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] text-xs font-medium text-[#1F1F1F]"
              placeholder="Enter your full name"
              placeholderTextColor="#7E7E7E"
              value={`${formData.firstName} ${formData.lastName}`.trim()}
              onChangeText={(text) => {
                const names = text.split(' ');
                setFormData({
                  ...formData,
                  firstName: names[0] || '',
                  lastName: names.slice(1).join(' ') || '',
                });
              }}
            />
          </View>

          {/* About */}
          <View className="gap-[15px]">
            <Text className="text-xs font-medium text-[#1F1F1F]" style={{ fontFamily: 'Inter_500Medium' }}>
              About
            </Text>
            <TextInput
              className="h-[193px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] pt-[22px] text-xs font-medium text-[#1F1F1F]"
              placeholder="Adventure lover exploring the world…"
              placeholderTextColor="#7E7E7E"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={formData.profileDescription}
              onChangeText={(text) => setFormData({ ...formData, profileDescription: text })}
            />
          </View>

          {/* Country */}
          <View className="gap-[15px]">
            <Text className="text-xs font-medium text-[#1F1F1F]" style={{ fontFamily: 'Inter_500Medium' }}>
              Country
            </Text>
            <TouchableOpacity 
              className="relative"
              onPress={() => setShowCountryModal(true)}
            >
              <View className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] justify-center">
                <Text className={`text-xs font-medium ${formData.country ? 'text-[#1F1F1F]' : 'text-[#7E7E7E]'}`}>
                  {(formData.country || 'Select your country').trim()}
                </Text>
              </View>
              <View className="absolute right-[14px] top-[15.5px]">
                <ChevronDown size={18} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Social Links */}
          <View className="gap-6">
            <Text className="text-sm font-medium text-[#1F1F1F]" style={{ fontFamily: 'Inter_500Medium' }}>
              Social links (At least one required)
            </Text>
            
            <View className="gap-4">
              {(['facebook', 'instagram', 'whatsapp'] as (keyof SocialLinks)[]).map((key) => (
                <View className="gap-[15px]" key={key}>
                  <Text className="text-xs font-medium text-[#1F1F1F]" style={{ fontFamily: 'Inter_500Medium' }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <TextInput
                    className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] text-xs font-medium text-[#1F1F1F]"
                    placeholder={
                      key === 'facebook'
                        ? 'https://www.facebook.com/username'
                        : key === 'instagram'
                        ? 'https://www.instagram.com/username'
                        : 'https://wa.me/1234567890'
                    }
                    placeholderTextColor="#A1A0A0"
                    value={socialLinks[key]}
                    onChangeText={(text) => setSocialLinks((prev) => ({ ...prev, [key]: text }))}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-7 left-0 right-0 items-center gap-[17px] px-5">
        <TouchableOpacity 
          className="w-full h-[50px] bg-[#E72858] rounded-[1200px] justify-center items-center"
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text className="text-[15px] font-bold text-white" style={{ fontFamily: 'Inter_500Medium', letterSpacing: 0.007 }}>
            {isLoading ? 'Saving...' : 'Next'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-[15px] font-semibold text-[#1F1F1F]" style={{ fontFamily: 'Inter_500Medium', letterSpacing: 0.007 }}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowCountryModal(false);
          setCountrySearch('');
        }}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/40 justify-center items-center px-5"
          activeOpacity={1}
          onPress={() => {
            setShowCountryModal(false);
            setCountrySearch('');
          }}
        >
          <TouchableOpacity 
            className="bg-white rounded-2xl w-full max-w-[400px]"
            style={{ maxHeight: 450, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="px-5 pt-5 pb-3">
              <Text className="text-base font-semibold text-[#1F1F1F]">
                Select Country
              </Text>
            </View>
            <View className="px-5 pb-3">
              <TextInput
                className="h-[42px] bg-[#F5F5F5] rounded-[10px] px-[14px] text-sm text-[#1F1F1F]"
                placeholder="Search country..."
                placeholderTextColor="#7E7E7E"
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`py-3 px-5 border-b border-[#F5F5F5] ${formData.country === item ? 'bg-[#FFE8EE]' : ''}`}
                  onPress={() => {
                    setFormData({ ...formData, country: item });
                    setShowCountryModal(false);
                    setCountrySearch('');
                  }}
                >
                  <Text className={`text-sm font-medium ${formData.country === item ? 'text-[#E72858] font-semibold' : 'text-[#1F1F1F]'}`}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 320 }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}