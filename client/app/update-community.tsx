import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Camera, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useGetCommunityByIdQuery, useUpdateCommunityMutation } from '@/services/communityApi';
import Toast from 'react-native-toast-message';
import CountryModal from '@/components/community/CountryModal';

export default function UpdateCommunity() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const communityId = id as string;

  const { data, isLoading, error } = useGetCommunityByIdQuery(communityId, {
    skip: !communityId,
  });

  const [updateCommunity, { isLoading: isUpdating }] = useUpdateCommunityMutation();

  const community = data?.communityInformations;

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  
  // Image management
  const [principalImage, setPrincipalImage] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
  // UI state
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with existing data
  useEffect(() => {
    if (community) {
      console.log('Community data received:', community);
      console.log('Community files:', community.communityFiles);
      
      setName(community.name || '');
      setDescription(community.description || '');
      setCountry(community.country || '');
      setFacebookLink(community.facebookLink || '');
      setInstagramLink(community.instagramLink || '');
      setWhatsappLink(community.whatsappLink || '');

      // Set existing images
      if (community.communityFiles && Array.isArray(community.communityFiles)) {
        console.log('Processing community files:', community.communityFiles);
        
        const principal = community.communityFiles.find((file: any) => file.isPrincipale === true);
        const gallery = community.communityFiles.filter((file: any) => file.isPrincipale === false);
        
        console.log('Principal image found:', principal);
        console.log('Gallery images found:', gallery);
        
        if (principal) {
          setPrincipalImage({ uri: principal.url, existing: true, url: principal.url });
        }
        
        setGalleryImages(gallery.map((file: any) => ({ 
          uri: file.url, 
          existing: true, 
          url: file.url 
        })));
      } else {
        console.log('No community files found or not an array');
      }
    }
  }, [community]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Community name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async (type: 'principal' | 'gallery') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'principal' ? [16, 9] : [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageAsset = result.assets[0];
        const newImage = {
          uri: imageAsset.uri,
          type: imageAsset.type || 'image/jpeg',
          name: imageAsset.fileName || `image_${Date.now()}.jpg`,
          existing: false
        };

        if (type === 'principal') {
          // If replacing existing principal image, mark it for deletion
          if (principalImage?.existing) {
            setImagesToDelete(prev => [...prev, principalImage.url]);
          }
          setPrincipalImage(newImage);
        } else {
          if (galleryImages.length + newImages.length < 5) {
            setNewImages(prev => [...prev, newImage]);
          } else {
            Alert.alert('Limit reached', 'You can only upload up to 5 gallery images.');
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (imageToRemove: any, type: 'principal' | 'gallery' | 'new') => {
    if (type === 'principal') {
      if (imageToRemove.existing) {
        setImagesToDelete(prev => [...prev, imageToRemove.url]);
      }
      setPrincipalImage(null);
    } else if (type === 'gallery') {
      if (imageToRemove.existing) {
        setImagesToDelete(prev => [...prev, imageToRemove.url]);
      }
      setGalleryImages(prev => prev.filter(img => img.uri !== imageToRemove.uri));
    } else if (type === 'new') {
      setNewImages(prev => prev.filter(img => img.uri !== imageToRemove.uri));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('country', country.trim());
      formData.append('facebookLink', facebookLink.trim());
      formData.append('instagramLink', instagramLink.trim());
      formData.append('whatsappLink', whatsappLink.trim());
      
      // Add images to delete
      if (imagesToDelete.length > 0) {
        formData.append('filesToDelete', JSON.stringify(imagesToDelete));
      }

      // Add new principal image
      if (principalImage && !principalImage.existing) {
        formData.append('images', {
          uri: principalImage.uri,
          type: principalImage.type,
          name: principalImage.name,
        } as any);
        formData.append('principalFileId', '0'); // Indicate first uploaded image is principal
      }

      // Add new gallery images
      newImages.forEach((image) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any);
      });

      await updateCommunity({ id: communityId, formData }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Community Updated!',
        text2: 'Your community has been successfully updated.',
      });

      router.back();
    } catch (error: any) {
      console.error('Update community error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error?.data?.message || 'Failed to update community. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E72858" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Loading community...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !community) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text style={{ fontSize: 16, color: '#333' }}>Failed to load community data.</Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginTop: 16, padding: 12, backgroundColor: '#E72858', borderRadius: 8 }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5'
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>
          Edit Community
        </Text>
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isUpdating}
          style={{
            backgroundColor: isUpdating ? '#ccc' : '#E72858',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            opacity: isUpdating ? 0.7 : 1
          }}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600' }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          {/* Community Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000' }}>
              Community Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter community name"
              style={{
                borderWidth: 1,
                borderColor: errors.name ? '#E72858' : '#E5E5E5',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#fff'
              }}
            />
            {errors.name && (
              <Text style={{ color: '#E72858', fontSize: 12, marginTop: 4 }}>{errors.name}</Text>
            )}
          </View>

          {/* Description */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000' }}>
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your community"
              multiline
              numberOfLines={4}
              style={{
                borderWidth: 1,
                borderColor: errors.description ? '#E72858' : '#E5E5E5',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#fff',
                textAlignVertical: 'top'
              }}
            />
            {errors.description && (
              <Text style={{ color: '#E72858', fontSize: 12, marginTop: 4 }}>{errors.description}</Text>
            )}
          </View>

          {/* Country */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000' }}>
              Country *
            </Text>
            <TouchableOpacity
              onPress={() => setShowCountryModal(true)}
              style={{
                borderWidth: 1,
                borderColor: errors.country ? '#E72858' : '#E5E5E5',
                borderRadius: 8,
                padding: 12,
                backgroundColor: '#fff'
              }}
            >
              <Text style={{ fontSize: 16, color: country ? '#000' : '#999' }}>
                {country || 'Select country'}
              </Text>
            </TouchableOpacity>
            {errors.country && (
              <Text style={{ color: '#E72858', fontSize: 12, marginTop: 4 }}>{errors.country}</Text>
            )}
          </View>

          {/* Principal Image */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000' }}>
              Banner Image
            </Text>
            {principalImage ? (
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: principalImage.uri }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 8,
                    backgroundColor: '#f5f5f5'
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(principalImage, 'principal')}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => pickImage('principal')}
                style={{
                  height: 200,
                  borderWidth: 2,
                  borderColor: '#E5E5E5',
                  borderStyle: 'dashed',
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <Camera size={40} color="#999" />
                <Text style={{ marginTop: 8, color: '#999', fontSize: 14 }}>
                  Add Banner Image
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Gallery Images */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#000' }}>
              Gallery Images (Max 5)
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {/* Existing gallery images */}
              {galleryImages.map((image, index) => (
                <View key={`existing-${index}`} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: image.uri }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: '#f5f5f5'
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(image, 'gallery')}
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: '#E72858',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <X size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* New gallery images */}
              {newImages.map((image, index) => (
                <View key={`new-${index}`} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: image.uri }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      backgroundColor: '#f5f5f5'
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(image, 'new')}
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: '#E72858',
                      borderRadius: 10,
                      width: 20,
                      height: 20,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <X size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add new image button */}
              {(galleryImages.length + newImages.length) < 5 && (
                <TouchableOpacity
                  onPress={() => pickImage('gallery')}
                  style={{
                    width: 80,
                    height: 80,
                    borderWidth: 2,
                    borderColor: '#E5E5E5',
                    borderStyle: 'dashed',
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <Camera size={24} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Social Media Links */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#000' }}>
              Social Media Links
            </Text>
            
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#666' }}>
                Facebook
              </Text>
              <TextInput
                value={facebookLink}
                onChangeText={setFacebookLink}
                placeholder="https://facebook.com/your-page"
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#fff'
                }}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#666' }}>
                Instagram
              </Text>
              <TextInput
                value={instagramLink}
                onChangeText={setInstagramLink}
                placeholder="https://instagram.com/your-profile"
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#fff'
                }}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#666' }}>
                WhatsApp
              </Text>
              <TextInput
                value={whatsappLink}
                onChangeText={setWhatsappLink}
                placeholder="https://wa.me/your-number"
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: '#fff'
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Country Modal */}
      <CountryModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        onSelectCountry={(selectedCountry) => {
          setCountry(selectedCountry);
          setShowCountryModal(false);
        }}
      />
    </SafeAreaView>
  );
}