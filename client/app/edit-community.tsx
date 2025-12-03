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
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateCommunityMutation, useGetCommunityByIdQuery } from '@/services/communityApi';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronDown, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { COUNTRIES } from "@/constants/constant";

export default function UpdateCommunity() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const communityId = id as string;

  const { data, isLoading } = useGetCommunityByIdQuery(communityId, {
    skip: !communityId,
  });
  
  const [updateCommunity, { isLoading: isUpdating }] = useUpdateCommunityMutation();
  const [isImagePicking, setIsImagePicking] = useState(false);
  
  const community = data?.communityInformations;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('Morocco');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  // Image management
  const [principalImage, setPrincipalImage] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  // ** NEW — Avatar **
  const [avatarImage, setAvatarImage] = useState<any>(null);

  // UI state
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Initialize form with existing data
  useEffect(() => {
    if (community) {
      console.log('🔄 Initializing community data:', {
        hasFiles: !!community.communityFiles,
        fileCount: community.communityFiles?.length
      });
      
      setName(community.name || '');
      setDescription(community.description || '');
      setCountry(community.country || 'Morocco');
      setFacebookLink(community.facebookLink || '');
      setInstagramLink(community.instagramLink || '');
      setWhatsappLink(community.whatsappLink || '');

      if (community.communityFiles && Array.isArray(community.communityFiles)) {
        console.log('📁 Community files:', community.communityFiles.map((f: any) => ({
          id: f.id,
          role: f.role,
          isPrincipale: f.isPrincipale,
          url: f.url?.substring(0, 50) + '...'
        })));
        
        // Banner - find by isPrincipale OR role === 'banner'
        const principal = community.communityFiles.find((file: any) => 
          file.isPrincipale === true || file.role === 'banner'
        );
        if (principal) {
          console.log('🖼️ Setting principal/banner:', { id: principal.id, role: principal.role });
          setPrincipalImage({ uri: principal.url, existing: true, url: principal.url, id: principal.id });
        }

        // Avatar - find by role === 'avatar'
        const avatar = community.communityFiles.find((file: any) => file.role === 'avatar');
        if (avatar) {
          console.log('👤 Setting avatar:', { id: avatar.id, role: avatar.role });
          setAvatarImage({ uri: avatar.url, existing: true, url: avatar.url, id: avatar.id });
        }

        // Gallery - files with role === 'gallery' (exclude banner and avatar)
        const gallery = community.communityFiles.filter((file: any) => 
          file.role === 'gallery' || 
          (!file.isPrincipale && file.role !== 'avatar' && file.role !== 'banner')
        );
        console.log('🎨 Setting gallery images:', gallery.length, 'files');
        setGalleryImages(
          gallery.map((file: any) => ({
            uri: file.url,
            existing: true,
            url: file.url,
            id: file.id
          }))
        );
      }
    }
  }, [community]);

  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));

  const pickImage = async (type: 'principal' | 'gallery' | 'avatar') => {
    try {
      setIsImagePicking(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission requise', 'Nous avons besoin de la permission pour accéder aux photos.');
        setIsImagePicking(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'principal' ? [16, 9] : type === 'avatar' ? [1, 1] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const img = result.assets[0];
        const fileName = img.fileName || `image_${Date.now()}.jpg`;
        const fileExtension = fileName.split('.').pop() || 'jpg';
        const imageObj = {
          uri: img.uri,
          type: `image/${fileExtension}`,
          name: fileName,
          existing: false
        };

        if (type === 'principal') {
          if (principalImage?.existing && principalImage?.id) {
            setImagesToDelete(prev => [...prev, principalImage.id]);
          }
          setPrincipalImage(imageObj);
        }

        if (type === 'avatar') {
          if (avatarImage?.existing && avatarImage?.id) {
            setImagesToDelete(prev => [...prev, avatarImage.id]);
          }
          setAvatarImage(imageObj);
        }

        if (type === 'gallery') {
          if (galleryImages.length + newImages.length < 5) {
            setNewImages(prev => [...prev, imageObj]);
          } else {
            Toast.show({ type: 'error', text1: 'Limite atteinte', text2: 'Max 5 fichiers.' });
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Échec de la sélection de l\'image. Veuillez réessayer.');
    } finally {
      setIsImagePicking(false);
    }
  };

  const removeImage = (image: any, type: 'principal' | 'gallery' | 'new' | 'avatar') => {
    console.log(`🗑️ Removing image of type: ${type}`, { existing: image?.existing, id: image?.id });
    
    if (type === 'principal') {
      if (image.existing && image.id) {
        console.log(`➕ Adding principal image to delete list: ${image.id}`);
        setImagesToDelete(prev => [...prev, image.id]);
      }
      setPrincipalImage(null);
    }
    if (type === 'avatar') {
      if (image.existing && image.id) {
        console.log(`➕ Adding avatar image to delete list: ${image.id}`);
        setImagesToDelete(prev => [...prev, image.id]);
      }
      setAvatarImage(null);
    }
    if (type === 'gallery') {
      if (image.existing && image.id) {
        console.log(`➕ Adding gallery image to delete list: ${image.id}`);
        setImagesToDelete(prev => [...prev, image.id]);
      }
      setGalleryImages(prev => prev.filter(img => img.uri !== image.uri));
    }
    if (type === 'new') {
      setNewImages(prev => prev.filter(img => img.uri !== image.uri));
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le nom de la communauté est requis' });
      return;
    }

    try {
      console.log('📤 Images to delete:', imagesToDelete);
      console.log('🖼️ Principal image:', principalImage);
      console.log('👤 Avatar image:', avatarImage);
      console.log('🎨 New gallery images:', newImages.length);
      
      const formData = new FormData();

      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('country', country.trim());
      formData.append('facebookLink', facebookLink.trim());
      formData.append('instagramLink', instagramLink.trim());
      formData.append('whatsappLink', whatsappLink.trim());

      if (imagesToDelete.length > 0) {
        console.log('🗑️ Sending filesToDelete:', JSON.stringify(imagesToDelete));
        formData.append('filesToDelete', JSON.stringify(imagesToDelete));
      }

      // Append images with their roles
      // PRINCIPAL/BANNER
      if (principalImage && !principalImage.existing) {
        console.log('📎 Appending principal image:', { 
          name: principalImage.name, 
          type: principalImage.type,
          uriPreview: principalImage.uri.substring(0, 50) 
        });
        formData.append('images', {
          uri: principalImage.uri,
          type: principalImage.type,
          name: principalImage.name,
        } as any);
        formData.append('roles', 'banner');
      }

      // AVATAR
      if (avatarImage && !avatarImage.existing) {
        console.log('📎 Appending avatar image:', { 
          name: avatarImage.name, 
          type: avatarImage.type,
          uriPreview: avatarImage.uri.substring(0, 50) 
        });
        formData.append('images', {
          uri: avatarImage.uri,
          type: avatarImage.type,
          name: avatarImage.name,
        } as any);
        formData.append('roles', 'avatar');
      }

      // GALLERY NEW FILES
      newImages.forEach((img) => {
        console.log('📎 Appending gallery image:', { 
          name: img.name, 
          type: img.type,
          uriPreview: img.uri.substring(0, 50) 
        });
        formData.append('images', {
          uri: img.uri,
          type: img.type,
          name: img.name,
        } as any);
        formData.append('roles', 'gallery');
      });

      await updateCommunity({ id: communityId, formData }).unwrap();
      
      Toast.show({ 
        type: 'success', 
        text1: 'Communauté mise à jour', 
        text2: `${name} a été mise à jour avec succès.` 
      });
      
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Update community error', err);
      const message = (err as any)?.data?.message || 'Échec de la mise à jour de la communauté';
      Toast.show({ type: 'error', text1: 'Erreur', text2: message });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#E72858" />
        <Text className="mt-4 text-base text-[#7E7E7E]">Chargement...</Text>
      </View>
    );
  }

  const allGalleryImages = [...galleryImages, ...newImages];

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        
        {/* BANNER */}
        <View className="mt-5 items-center mb-10">
          <TouchableOpacity
            className="w-[345px] h-[164px] rounded-[19px] overflow-hidden bg-[#D9D9D9]"
            onPress={() => pickImage('principal')}
          >
            {principalImage ? (
              <Image source={{ uri: principalImage.uri }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full bg-[#D9D9D9]" />
            )}

            {/* Edit button */}
            <TouchableOpacity className="absolute top-[11px] right-[11px] w-[27px] h-[27px] rounded-[13.5px] bg-white justify-center items-center">
              <Camera size={17} color="#000" />
            </TouchableOpacity>

            {/* Remove principal */}
            {principalImage && (
              <TouchableOpacity
                onPress={() => removeImage(principalImage, 'principal')}
                className="absolute top-[11px] left-[11px] w-[27px] h-[27px] bg-[#E72858] rounded-full justify-center items-center"
              >
                <X size={15} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* AVATAR */}
          <TouchableOpacity
            className="w-[84px] h-[84px] rounded-full bg-[#D9D9D9] -mt-[42px] justify-center items-center relative"
            onPress={() => pickImage('avatar')}
          >
            {avatarImage ? (
              <Image source={{ uri: avatarImage.uri }} className="w-full h-full rounded-full" />
            ) : (
              <View className="w-full h-full rounded-full bg-[#D9D9D9]" />
            )}

            {/* Edit avatar */}
            <View className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#EEE] justify-center items-center">
              <Camera size={17} color="#000" />
            </View>

            {/* Remove avatar */}
            {avatarImage && (
              <TouchableOpacity
                onPress={() => removeImage(avatarImage, 'avatar')}
                className="absolute -top-2 -left-2 w-6 h-6 bg-[#E72858] rounded-full justify-center items-center"
              >
                <X size={13} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>


        <View className="px-[15px] gap-6">
          {/* Community name */}
          <View className="gap-[15px]">
            <Text className="text-xs font-medium text-[#1F1F1F]">Nom de la communauté</Text>
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
            <Text className="text-xs font-medium text-[#1F1F1F]">À propos</Text>
            <TextInput
              className="h-[193px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] pt-[22px] text-xs font-medium text-[#1F1F1F]"
              placeholder="Passionné d'aventure explorant le monde…"
              placeholderTextColor="#7E7E7E"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Country */}
          <View className="gap-[15px]">
            <Text className="text-xs font-medium text-[#1F1F1F]">Pays</Text>
            <TouchableOpacity className="relative" onPress={() => setShowCountryModal(true)}>
              <View className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] justify-center">
                <Text className={`text-xs font-medium ${country ? 'text-[#1F1F1F]' : 'text-[#7E7E7E]'}`}>
                  {country || 'Sélectionnez votre pays'}
                </Text>
              </View>
              <View className="absolute right-[14px] top-[15.5px]">
                <ChevronDown size={18} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Social Links */}
          <View className="gap-6">
            <Text className="text-sm font-medium text-[#1F1F1F]">Liens sociaux (Au moins un requis)</Text>
            <View className="gap-4">
              <View className="gap-[15px]">
                <Text className="text-xs font-medium text-[#1F1F1F]">Facebook</Text>
                <TextInput
                  className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] text-xs font-medium text-[#1F1F1F]"
                  placeholder="https://www.facebook.com/username"
                  placeholderTextColor="#A1A0A0"
                  value={facebookLink}
                  onChangeText={setFacebookLink}
                />
              </View>
              <View className="gap-[15px]">
                <Text className="text-xs font-medium text-[#1F1F1F]">Instagram</Text>
                <TextInput
                  className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] text-xs font-medium text-[#1F1F1F]"
                  placeholder="https://www.instagram.com/username"
                  placeholderTextColor="#A1A0A0"
                  value={instagramLink}
                  onChangeText={setInstagramLink}
                />
              </View>
              <View className="gap-[15px]">
                <Text className="text-xs font-medium text-[#1F1F1F]">WhatsApp</Text>
                <TextInput
                  className="h-[49px] bg-white border border-[#EEEEEE] rounded-[14px] px-[14px] text-xs font-medium text-[#1F1F1F]"
                  placeholder="https://wa.me/1234567890"
                  placeholderTextColor="#A1A0A0"
                  value={whatsappLink}
                  onChangeText={setWhatsappLink}
                />
              </View>
            </View>
          </View>

          {/* Gallery Files (max 5) */}
          <View className="mt-2">
            <Text className="text-sm font-medium text-[#1F1F1F]">Galerie</Text>
            <Text className="text-xs text-[#CCCCCC] mt-1">( max 5 fichiers )</Text>
            <TouchableOpacity 
              onPress={() => pickImage('gallery')} 
              className="mt-3"
              disabled={allGalleryImages.length >= 5}
            >
              <View style={{ 
                borderWidth: 1, 
                borderStyle: 'dashed', 
                borderColor: allGalleryImages.length >= 5 ? '#E5E5E5' : '#B4B4B4', 
                borderRadius: 19, 
                height: 164, 
                justifyContent: 'center', 
                alignItems: 'center',
                opacity: allGalleryImages.length >= 5 ? 0.5 : 1
              }}>
                <Camera size={56} color="#A1A0A0" />
                <Text className="text-sm text-[#A1A0A0] mt-2">
                  {allGalleryImages.length >= 5 ? 'Limite atteinte' : 'Ajouter des fichiers'}
                </Text>
                {allGalleryImages.length > 0 && (
                  <View style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {galleryImages.map((img, idx) => (
                        <View key={`gallery-${idx}`} style={{ width: 64, height: 64, marginRight: 8 }}>
                          <Image source={{ uri: img.uri }} style={{ width: 64, height: 64, borderRadius: 10 }} />
                          <TouchableOpacity 
                            onPress={() => removeImage(img, 'gallery')} 
                            style={{ 
                              position: 'absolute', 
                              top: -6, 
                              right: -6, 
                              backgroundColor: '#E72858', 
                              borderRadius: 12, 
                              width: 24, 
                              height: 24, 
                              justifyContent: 'center', 
                              alignItems: 'center'
                            }}
                          >
                            <X size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {newImages.map((img, idx) => (
                        <View key={`new-${idx}`} style={{ width: 64, height: 64, marginRight: 8 }}>
                          <Image source={{ uri: img.uri }} style={{ width: 64, height: 64, borderRadius: 10 }} />
                          <TouchableOpacity 
                            onPress={() => removeImage(img, 'new')} 
                            style={{ 
                              position: 'absolute', 
                              top: -6, 
                              right: -6, 
                              backgroundColor: '#E72858', 
                              borderRadius: 12, 
                              width: 24, 
                              height: 24, 
                              justifyContent: 'center', 
                              alignItems: 'center'
                            }}
                          >
                            <X size={14} color="#FFFFFF" />
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
        <TouchableOpacity
          disabled={isUpdating || isImagePicking}
          onPress={handleSubmit}
          style={{ opacity: (isUpdating || isImagePicking) ? 0.6 : 1 }}
          className="w-full h-[50px] bg-[#E72858] rounded-[1200px] justify-center items-center"
        >
          {isImagePicking ? (
            <Text className="text-[15px] font-bold text-white">Processing image...</Text>
          ) : isUpdating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-bold text-white">Mettre à jour</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} disabled={isUpdating || isImagePicking}>
          <Text className="text-[15px] font-semibold text-[#1F1F1F]">Annuler</Text>
        </TouchableOpacity>
      </View>

      {/* Country Selection Modal */}
      <Modal visible={showCountryModal} transparent animationType="fade" onRequestClose={() => setShowCountryModal(false)}>
        <TouchableOpacity 
          className="flex-1 bg-black/40 justify-center items-center px-5" 
          activeOpacity={1} 
          onPress={() => setShowCountryModal(false)}
        >
          <TouchableOpacity 
            className="bg-white rounded-2xl w-full max-w-[400px]" 
            style={{ 
              maxHeight: 450, 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.15, 
              shadowRadius: 12, 
              elevation: 8 
            }} 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <View className="px-5 pt-5 pb-3">
              <Text className="text-base font-semibold text-[#1F1F1F]">Sélectionner le pays</Text>
            </View>
            <View className="px-5 pb-3">
              <TextInput 
                className="h-[42px] bg-[#F5F5F5] rounded-[10px] px-[14px] text-sm text-[#1F1F1F]" 
                placeholder="Rechercher un pays..." 
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
                  className={`py-3 px-5 border-b border-[#F5F5F5] ${country === item ? 'bg-[#FFE8EE]' : ''}`} 
                  onPress={() => { 
                    setCountry(item); 
                    setShowCountryModal(false); 
                    setCountrySearch(''); 
                  }}
                >
                  <Text className={`text-sm font-medium ${country === item ? 'text-[#E72858] font-semibold' : 'text-[#1F1F1F]'}`}>
                    {item}
                  </Text>
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