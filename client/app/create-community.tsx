import React, { useState } from 'react';
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
import { getToken } from '@/lib/tokenStorage';
import { API_BASE_URL } from '@/constants/api';
import { useCreateCommunityMutation } from '@/services/communityApi';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronDown } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { COUNTRIES } from "@/constants/constant";

export default function CreateCommunity() {
  const router = useRouter();

  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [country, setCountry] = useState('Morocco');

  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createCommunity, { isLoading: isMutating }] = useCreateCommunityMutation();

  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));

  const handleImagePick = async (type: 'banner' | 'avatar') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder aux photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      if (type === 'avatar') setAvatarImage(result.assets[0].uri);
      else setBannerImage(result.assets[0].uri);
    }
  };

  const handleRemoveFile = (uri: string) => {
    setFiles((prev) => prev.filter((f) => f !== uri));
  };

  const handleAddFile = async () => {
    try {
      if (files.length >= 5) {
        Toast.show({ type: 'error', text1: 'Limite atteinte', text2: 'Vous pouvez ajouter au maximum 5 fichiers.' });
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder aux photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFiles((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (err) {
      console.error('File pick error', err);
    }

  };

  const handleSubmit = () => {
    (async () => {
      if (!name.trim()) {
        Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le nom de la communauté est requis' });
        return;
      }

      try {
        const token = await getToken();

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', about.trim());
        formData.append('country', country);
        formData.append('socialLinks', JSON.stringify({ facebook, instagram, whatsapp }));

        if (bannerImage) {
          const filename = bannerImage.split('/').pop() || 'banner.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          // @ts-ignore
          formData.append('files', { uri: bannerImage, name: filename, type });
        }

        if (avatarImage) {
          const filename = avatarImage.split('/').pop() || 'avatar.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          // @ts-ignore
          formData.append('files', { uri: avatarImage, name: filename, type });
        }

        for (const uri of files) {
          const filename = uri.split('/').pop() || 'file.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          // @ts-ignore
          formData.append('files', { uri, name: filename, type });
        }

        // Use RTK Query mutation to create the community (FormData)
        setIsUploading(true);
        setUploadProgress(0);

        try {
          // Prepare payload in the same shape communityApi expects, with explicit role for each file
          const payload = {
            name: name.trim(),
            description: about.trim(),
            country,
            socialLinks: { facebook, instagram, whatsapp },
            bannerImage: bannerImage ? { uri: bannerImage, name: bannerImage.split('/').pop(), type: 'image/jpeg', role: 'banner' } : null,
            avatarImage: avatarImage ? { uri: avatarImage, name: avatarImage.split('/').pop(), type: 'image/jpeg', role: 'avatar' } : null,
            files: files.map((uri) => ({ uri, name: uri.split('/').pop(), type: 'image/jpeg', role: 'gallery' })),
          };

          const res = await createCommunity(payload).unwrap();
          setIsUploading(false);
          Toast.show({ type: 'success', text1: 'Communauté créée', text2: res.message || `${name} a été créée avec succès.` });
          router.replace('/(tabs)');
        } catch (err) {
          setIsUploading(false);
          console.error('Create community mutation error', err);
          const message = (err as any) && (err as any).data && (err as any).data.message ? (err as any).data.message : 'Échec de la création de la communauté';
          Toast.show({ type: 'error', text1: 'Erreur', text2: message });
        }
      } catch (error) {
        setIsUploading(false);
        setUploadProgress(0);
        console.error('Submit create community error', error);
        Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de créer la communauté' });
      }
    })();
  };
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />


      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Banner */}
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
            onPress={() => handleImagePick('avatar')}
          >
            {avatarImage ? (
              <Image source={{ uri: avatarImage }} className="w-full h-full rounded-full" />
            ) : (
              <View className="w-full h-full bg-[#D9D9D9] rounded-full" />
            )}
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#EEEEEE] justify-center items-center z-10">
              <Camera size={17} color="#000000" />
            </View>
          </TouchableOpacity>
        </View>

        <View className="px-[15px] gap-6">
          {/* Community name */}
          <View className="gap-[15px]">
            <Text className="text-xs font-medium text-[#1F1F1F]">Community name</Text>
            <TextInput
              className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] text-xs font-medium text-[#1F1F1F]"
              placeholder="Fayssal Vlog"
              placeholderTextColor="#7E7E7E"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* About */}
          <View className="gap-[15px]">
            <Text className="text-xs font-medium text-[#1F1F1F]">About</Text>
            <TextInput
              className="h-[193px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] pt-[22px] text-xs font-medium text-[#1F1F1F]"
              placeholder="Adventure lover exploring the world…"
              placeholderTextColor="#7E7E7E"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={about}
              onChangeText={setAbout}
            />
          </View>

          {/* Country */}
          <View className="gap-[15px]">
            <Text className="text-xs font-medium text-[#1F1F1F]">Country</Text>
            <TouchableOpacity className="relative" onPress={() => setShowCountryModal(true)}>
              <View className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] justify-center">
                <Text className={`text-xs font-medium ${country ? 'text-[#1F1F1F]' : 'text-[#7E7E7E]'}`}>{country || 'Select your country'}</Text>
              </View>
              <View className="absolute right-[14px] top-[15.5px]">
                <ChevronDown size={18} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Social Links */}
          <View className="gap-6">
            <Text className="text-sm font-medium text-[#1F1F1F]">Social links (At least one required)</Text>

            <View className="gap-4">
              <View className="gap-[15px]">
                <Text className="text-xs font-medium text-[#1F1F1F]">Facebook</Text>
                <TextInput
                  className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] text-xs font-medium text-[#1F1F1F]"
                  placeholder="https://www.facebook.com/username"
                  placeholderTextColor="#A1A0A0"
                  value={facebook}
                  onChangeText={setFacebook}
                />
              </View>

              <View className="gap-[15px]">
                <Text className="text-xs font-medium text-[#1F1F1F]">Instagram</Text>
                <TextInput
                  className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] text-xs font-medium text-[#1F1F1F]"
                  placeholder="https://www.instagram.com/username"
                  placeholderTextColor="#A1A0A0"
                  value={instagram}
                  onChangeText={setInstagram}
                />
              </View>

              <View className="gap-[15px]">
                <Text className="text-xs font-medium text-[#1F1F1F]">WhatsApp</Text>
                <TextInput
                  className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] text-xs font-medium text-[#1F1F1F]"
                  placeholder="https://wa.me/1234567890"
                  placeholderTextColor="#A1A0A0"
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                />
              </View>
            </View>
          </View>

          {/* Files (max 5) */}
          <View className="mt-2">
            <Text className="text-sm font-medium text-[#1F1F1F]">Files</Text>
            <Text className="text-xs text-[#CCCCCC] mt-1">( max 5 files )</Text>

            <TouchableOpacity onPress={handleAddFile} className="mt-3">
              <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: '#B4B4B4', borderRadius: 19, height: 164, justifyContent: 'center', alignItems: 'center' }}>
                <Camera size={56} color="#A1A0A0" />
                <Text className="text-sm text-[#A1A0A0] mt-2">Add files</Text>
                {files.length > 0 && (
                  <View style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {files.map((uri) => (
                        <View key={uri} style={{ width: 64, height: 64, marginRight: 8 }}>
                          <Image source={{ uri }} style={{ width: 64, height: 64, borderRadius: 10 }} />
                          <TouchableOpacity onPress={() => handleRemoveFile(uri)} style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' }}>
                            <Text style={{ fontSize: 14 }}>×</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-7 left-0 right-0 items-center gap-[10px] px-5">
        {isUploading && (
          <View className="w-full px-3">
            <View style={{ height: 8, backgroundColor: '#F0F0F0', borderRadius: 8, overflow: 'hidden' }}>
              <View style={{ height: 8, backgroundColor: '#E72858', width: `${uploadProgress}%` }} />
            </View>
            <Text className="text-xs text-[#5B5B5B] mt-2 text-center">Uploading {uploadProgress}%</Text>
          </View>
        )}

        <TouchableOpacity
          disabled={isUploading}
          onPress={handleSubmit}
          style={{ opacity: isUploading ? 0.6 : 1 }}
          className="w-full h-[50px] bg-[#E72858] rounded-[1200px] justify-center items-center"
        >
          <Text className="text-[15px] font-bold text-white">{isUploading ? `Uploading ${uploadProgress}%` : 'Create'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} disabled={isUploading}>
          <Text className="text-[15px] font-semibold text-[#1F1F1F]">Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Country Selection Modal */}
      <Modal visible={showCountryModal} transparent animationType="fade" onRequestClose={() => setShowCountryModal(false)}>
        <TouchableOpacity className="flex-1 bg-black/40 justify-center items-center px-5" activeOpacity={1} onPress={() => setShowCountryModal(false)}>
          <TouchableOpacity className="bg-white rounded-2xl w-full max-w-[400px]" style={{ maxHeight: 450, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View className="px-5 pt-5 pb-3">
              <Text className="text-base font-semibold text-[#1F1F1F]">Select Country</Text>
            </View>
            <View className="px-5 pb-3">
              <TextInput className="h-[42px] bg-[#F5F5F5] rounded-[10px] px-[14px] text-sm text-[#1F1F1F]" placeholder="Search country..." placeholderTextColor="#7E7E7E" value={countrySearch} onChangeText={setCountrySearch} autoFocus />
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity className={`py-3 px-5 border-b border-[#F5F5F5] ${country === item ? 'bg-[#FFE8EE]' : ''}`} onPress={() => { setCountry(item); setShowCountryModal(false); setCountrySearch(''); }}>
                  <Text className={`text-sm font-medium ${country === item ? 'text-[#E72858] font-semibold' : 'text-[#1F1F1F]'}`}>{item}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator
              style={{ maxHeight: 320 }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
