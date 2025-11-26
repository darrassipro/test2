import { View, Text, TextInput, Image, TouchableOpacity, Switch, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ImagePlus, Video, Orbit, MapPin, ChevronDown, CloudUpload } from "lucide-react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { useGetCommunityByIdQuery } from '@/services/communityApi';
import { useCreatePostMutation } from '@/services/postApi';

export default function CreatePost() {
  const { communityId, type: initialType } = useLocalSearchParams();
  const communityQuery = useGetCommunityByIdQuery(communityId as any, { skip: !communityId });
  const [createPost, { isLoading: isPublishing }] = useCreatePostMutation();
  const [type, setType] = useState<"post" | "reel" | "360">("post");
  const [picked, setPicked] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [collaborationType, setCollaborationType] = useState('Hotels');
  const [isVisibleOutsideCommunity, setIsVisibleOutsideCommunity] = useState(false);
  const [sponsorId, setSponsorId] = useState('');
  const [hotelNuiteeId, setHotelNuiteeId] = useState('');

  const onPick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l’accès à la galerie pour sélectionner des fichiers.");
      return;
    }
    type MediaTypeLiteral = "images" | "videos" | "all";
    let mediaTypes: MediaTypeLiteral = "images";
    if (type === "reel") mediaTypes = "videos";
    if (type === "360") mediaTypes = "all";
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaTypes as any,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled) {
      setPicked(result.assets);
    }
  };

  // Initialize composer type from query param (if provided)
  useEffect(() => {
    if (!initialType) return;
    const t = String(initialType).toLowerCase();
    if (t === 'post' || t === 'reel' || t === '360') {
      setType(t as any);
    }
  }, [initialType]);

  const handlePublish = async () => {
    try {
      const formData = new FormData();
      formData.append('contentType', type);
      formData.append('title', title);
      formData.append('description', description);
      // Only send fields that backend expects
      formData.append('isVisibleOutsideCommunity', String(isVisibleOutsideCommunity));
      if (sponsorId) formData.append('sponsorId', sponsorId);
      if (hotelNuiteeId) formData.append('hotelNuiteeId', hotelNuiteeId);
      if (communityId) formData.append('communityId', String(communityId));

      // append files
      picked.forEach((asset, idx) => {
        const uri = asset.uri;
        const name = asset.fileName || `file_${idx}.jpg`;
        const typeHeader = asset.type === 'video' || (asset.uri && asset.uri.endsWith('.mp4')) ? 'video/mp4' : 'image/jpeg';
        formData.append('files', { uri, name, type: typeHeader } as any);
      });

      await createPost(formData).unwrap();
      Alert.alert('Success', 'Post published');
      router.back();
    } catch (err: any) {
      console.error('Publish error', err);
      Alert.alert('Erreur', err?.message || 'Échec de la publication');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="pr-2">
            <ArrowLeft size={22} color="#111" />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold">Create Post / Reel</Text>
        </View>

        {communityQuery?.data?.communityInformations ? (
          <View className="px-4">
            <Text className="text-sm font-medium text-gray-700">Posting to</Text>
            <TouchableOpacity
              onPress={() => {
                const comm = communityQuery.data.communityInformations;
                router.push(`/community/${comm.id}?communityName=${encodeURIComponent(comm.name)}` as any);
              }}
              className="mt-2"
            >
              <Text className="text-lg font-semibold">{communityQuery.data.communityInformations.name}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Composer (Figma-like) */}
        <View className="mx-4 mt-3 rounded-3xl border border-gray-200 p-6" style={{ borderRadius: 16 }}>
          <TextInput
            placeholder="Title (optional)"
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
            className="text-base mb-3"
          />
          <TextInput
            placeholder="Write something inspiring..."
            placeholderTextColor="#6B7280"
            multiline
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
            className="h-40 text-base"
          />

          {/* Type selector buttons */}
          <View className="mt-4 flex-row items-center gap-3">
            <TouchableOpacity
              className={`flex-row items-center gap-2 rounded-full px-5 py-3 ${type === "post" ? "border-2 border-pink-500" : "bg-gray-100"}`}
              onPress={() => setType("post")}
            >
              <ImagePlus size={18} color={type === "post" ? "#E72858" : "#111"} />
              <Text className={`${type === "post" ? "text-pink-600" : "text-gray-900"} font-semibold`}>Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-row items-center gap-2 rounded-full px-5 py-3 ${type === "reel" ? "border-2 border-pink-500" : "bg-gray-100"}`}
              onPress={() => setType("reel")}
            >
              <Video size={18} color={type === "reel" ? "#E72858" : "#111"} />
              <Text className={`${type === "reel" ? "text-pink-600" : "text-gray-900"} font-semibold`}>Reel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-row items-center gap-2 rounded-full px-5 py-3 ${type === "360" ? "border-2 border-pink-500" : "bg-gray-100"}`}
              onPress={() => setType("360")}
            >
              <Orbit size={18} color={type === "360" ? "#E72858" : "#111"} />
              <Text className={`${type === "360" ? "text-pink-600" : "text-gray-900"} font-semibold`}>360</Text>
            </TouchableOpacity>
          </View>

          {/* Location input */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Location</Text>
            <View className="flex-row items-center rounded-2xl border border-gray-200 px-4 py-3">
              <MapPin size={18} color="#111" />
              <TextInput
                placeholder="City, place or address"
                placeholderTextColor="#A1A0A0"
                value={location}
                onChangeText={setLocation}
                className="ml-2 flex-1"
              />
            </View>
          </View>

          {/* Collaboration / Type of business */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Collaboration</Text>
            <View>
              <TouchableOpacity className="flex-row items-center rounded-2xl border border-gray-200 px-4 py-3" onPress={() => {
                // simple cycle picker for now
                const options = ['Hotels','Restaurants','Shops','Services'];
                const idx = options.indexOf(collaborationType);
                setCollaborationType(options[(idx + 1) % options.length]);
              }}>
                <Text className="text-gray-500">{collaborationType}</Text>
                <ChevronDown size={18} color="#111" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </View>
          </View>

          {/* If collaboration is Hotels, allow entering hotelNuiteeId */}
          {collaborationType === 'Hotels' && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Hotel Nuitee ID (optional)</Text>
              <TextInput
                placeholder="Hotel ID to enable booking"
                placeholderTextColor="#6B7280"
                value={hotelNuiteeId}
                onChangeText={setHotelNuiteeId}
                className="rounded-xl border border-gray-200 px-4 py-3"
              />
            </View>
          )}

          {/* Sponsor Id */}
          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Sponsor (optional)</Text>
            <TextInput
              placeholder="Sponsor ID"
              placeholderTextColor="#6B7280"
              value={sponsorId}
              onChangeText={setSponsorId}
              className="rounded-xl border border-gray-200 px-4 py-3"
            />
          </View>

          {/* Visibility */}
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-700">Visible outside community</Text>
            <Switch value={isVisibleOutsideCommunity} onValueChange={setIsVisibleOutsideCommunity} />
          </View>

        </View>

        {/* Uploader */}
        <TouchableOpacity
          onPress={onPick}
          activeOpacity={0.9}
          style={{
            marginHorizontal: 16,
            marginTop: 24,
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderStyle: 'dashed',
            borderWidth: 0.5,
            borderColor: '#0D318B'
          }}
        >
          <CloudUpload size={28} color="#0D318B" />
          <Text className="text-lg font-semibold mt-3">Select a file or drag and drop here</Text>
          <Text style={{ color: 'rgba(0,0,0,0.4)', marginTop: 6 }}>JPG, PNG or Mp4, file size no more than 10MB</Text>
          {picked.length > 0 ? (
            <Text style={{ marginTop: 8, color: '#6B7280' }}>{picked.length} file(s) selected</Text>
          ) : null}
        </TouchableOpacity>

        {/* Book button */}
        <View className="mx-4 mt-6 flex-row items-center justify-between">
          <Text className="text-base font-semibold">Book button</Text>
          <Switch value={true} onValueChange={() => {}} />
        </View>

        {/* Footer actions */}
        <View className="mx-4 mt-8 mb-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-gray-600 text-lg">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePublish} disabled={isPublishing} className={`px-8 py-3 rounded-full ${isPublishing ? 'bg-gray-300' : 'bg-pink-500'}`}>
            <Text className="text-white text-lg font-semibold">{isPublishing ? 'Publishing...' : 'Publish'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


