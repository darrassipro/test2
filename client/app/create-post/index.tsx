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
  const [isBookEnabled, setIsBookEnabled] = useState(false);

  const onPick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l'accès à la galerie pour sélectionner des fichiers.");
      return;
    }
    // Use the enum provided by expo-image-picker to avoid casting errors on native bridges
    let mediaTypes = ImagePicker.MediaTypeOptions.Images;
    if (type === "reel") mediaTypes = ImagePicker.MediaTypeOptions.Videos;
    if (type === "360") mediaTypes = ImagePicker.MediaTypeOptions.All;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled) {
      setPicked(result.assets);
    }
  };

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
    formData.append('isVisibleOutsideCommunity', String(isVisibleOutsideCommunity));
    formData.append('collaborationType', collaborationType);

    if (location) formData.append('location', location);
    if (sponsorId) formData.append('sponsorId', sponsorId);
    if (isBookEnabled && collaborationType === 'Hotels' && hotelNuiteeId) {
      formData.append('hotelNuiteeId', hotelNuiteeId);
    }
    if (communityId) formData.append('communityId', String(communityId));

    picked.forEach((asset, idx) => {
      const uri = asset.uri;
      const name = asset.fileName || `file_${idx}`;
      const typeHeader = asset.type === 'video' || (asset.uri && asset.uri.endsWith('.mp4')) ? 'video/mp4' : 'image/jpeg';

      if (typeHeader.startsWith('image')) {
        formData.append('images', { uri, name, type: typeHeader } as any);
      } else if (typeHeader.startsWith('video')) {
        formData.append('videos', { uri, name, type: typeHeader } as any);
      } else if (typeHeader.startsWith('audio')) {
        formData.append('audios', { uri, name, type: typeHeader } as any);
      } else {
        formData.append('virtualTours', { uri, name, type: typeHeader } as any);
      }
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Frame 1171278327 */}
        <View style={{ 
          paddingHorizontal: 15, 
          paddingTop: 16,
          paddingBottom: 12,
          flexDirection: 'row', 
          alignItems: 'center',
        }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
            <ArrowLeft size={24} color="#000000" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={{ 
            fontFamily: 'Inter',
            fontWeight: '600',
            fontSize: 18,
            lineHeight: 27,
            color: '#1F1F1F',
            textTransform: 'capitalize',
            flex: 1
          }}>
            Create Post / Reel
          </Text>
        </View>

        {communityQuery?.data?.communityInformations ? (
          <View style={{ paddingHorizontal: 15, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#7E7E7E' }}>Posting to</Text>
            <TouchableOpacity
              onPress={() => {
                const comm = communityQuery.data.communityInformations;
                router.push(`/community/${comm.id}?communityName=${encodeURIComponent(comm.name)}` as any);
              }}
              style={{ marginTop: 4 }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F1F1F' }}>
                {communityQuery.data.communityInformations.name}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Composer Box - Frame 1171278325 */}
        <View style={{ 
          marginHorizontal: 15, 
          marginTop: 10,
          borderWidth: 1, 
          borderColor: '#EEEEEE', 
          borderRadius: 16,
          padding: 26,
        }}>
          <TextInput
            placeholder="Title (optional)"
            placeholderTextColor="#A1A0A0"
            value={title}
            onChangeText={setTitle}
            style={{ 
              fontFamily: 'Inter',
              fontWeight: '500',
              fontSize: 14,
              lineHeight: 17,
              color: '#1F1F1F',
              marginBottom: 12
            }}
          />
          <TextInput
            placeholder="Write something inspiring…"
            placeholderTextColor="#A1A0A0"
            multiline
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
            style={{ 
              fontFamily: 'Inter',
              fontWeight: '500',
              fontSize: 12.14,
              lineHeight: 15,
              color: '#1F1F1F',
              minHeight: 50,
              marginBottom: 20
            }}
          />

          {/* Type selector buttons - Frame 1171278324 */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            gap: 4
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 20,
                gap: 6.33,
                borderWidth: type === "post" ? 1 : 0,
                borderColor: type === "post" ? '#E72858' : 'transparent',
                backgroundColor: type === "post" ? 'transparent' : '#F4F5F7',
                borderRadius: 120,
                height: 43.23
              }}
              onPress={() => setType("post")}
            >
              <ImagePlus size={19.23} color={type === "post" ? "#E72858" : "#1F1F1F"} strokeWidth={1.6} />
              <Text style={{ 
                fontFamily: 'Inter',
                fontWeight: '600',
                fontSize: 12.817,
                lineHeight: 16,
                color: type === "post" ? '#E72858' : '#1F1F1F',
                textAlign: 'center'
              }}>
                Post
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 20,
                gap: 6.33,
                borderWidth: type === "reel" ? 1 : 0,
                borderColor: type === "reel" ? '#E72858' : 'transparent',
                backgroundColor: type === "reel" ? 'transparent' : '#F4F5F7',
                borderRadius: 120,
                height: 43.23
              }}
              onPress={() => setType("reel")}
            >
              <Video size={19.23} color={type === "reel" ? "#E72858" : "#1F1F1F"} strokeWidth={1.6} />
              <Text style={{ 
                fontFamily: 'Inter',
                fontWeight: '600',
                fontSize: 12.817,
                lineHeight: 16,
                color: type === "reel" ? '#E72858' : '#1F1F1F',
                textAlign: 'center'
              }}>
                Reel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 20,
                gap: 6.33,
                borderWidth: type === "360" ? 1 : 0,
                borderColor: type === "360" ? '#E72858' : 'transparent',
                backgroundColor: type === "360" ? 'transparent' : '#F4F5F7',
                borderRadius: 120,
                height: 43.23
              }}
              onPress={() => setType("360")}
            >
              <Orbit size={19.23} color={type === "360" ? "#E72858" : "#1F1F1F"} strokeWidth={1.6} />
              <Text style={{ 
                fontFamily: 'Inter',
                fontWeight: '600',
                fontSize: 12.817,
                lineHeight: 16,
                color: type === "360" ? '#E72858' : '#1F1F1F',
                textAlign: 'center'
              }}>
                360
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upload Area - Frame 1000003202 */}
        <TouchableOpacity
          onPress={onPick}
          activeOpacity={0.9}
          style={{
            marginHorizontal: 15,
            marginTop: 28,
            borderRadius: 16,
            paddingVertical: 32,
            paddingHorizontal: 7.1,
            alignItems: 'center',
            justifyContent: 'center',
            borderStyle: 'dashed',
            borderWidth: 0.507,
            borderColor: '#0D318B',
            backgroundColor: '#FFFFFF',
            height: 131.4
          }}
        >
          <CloudUpload size={32} color="#E72858" strokeWidth={2.67} />
          <Text style={{ 
            fontFamily: 'Inter',
            fontWeight: '500',
            fontSize: 14,
            lineHeight: 17,
            color: '#000000',
            marginTop: 8,
            textAlign: 'center'
          }}>
            Select a file or drag and drop here
          </Text>
          <Text style={{ 
            fontFamily: 'Inter',
            fontWeight: '400',
            fontSize: 10,
            lineHeight: 12,
            color: 'rgba(0, 0, 0, 0.4)',
            marginTop: 6,
            textAlign: 'center'
          }}>
            JPG, PNG or Mp4, file size no more than 10MB
          </Text>
          {picked.length > 0 ? (
            <Text style={{ 
              marginTop: 8, 
              fontSize: 10,
              color: '#6B7280' 
            }}>
              {picked.length} file(s) selected
            </Text>
          ) : null}
        </TouchableOpacity>

        {/* Location - Component 12 */}
        <View style={{ 
          marginHorizontal: 15, 
          marginTop: 28,
          gap: 9.1 
        }}>
          <Text style={{ 
            fontFamily: 'Inter',
            fontWeight: '500',
            fontSize: 12,
            lineHeight: 15,
            color: '#7E7E7E'
          }}>
            Location
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            borderWidth: 0.7,
            borderColor: '#E5E5E5',
            borderRadius: 14,
            paddingVertical: 16.09,
            paddingHorizontal: 11.89,
            height: 49,
            gap: 5.6
          }}>
            <MapPin size={24} color="#A1A0A0" strokeWidth={2} />
            <TextInput
              placeholder="City, place or address"
              placeholderTextColor="#A1A0A0"
              value={location}
              onChangeText={setLocation}
              style={{ 
                flex: 1,
                fontFamily: 'Inter',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 15,
                color: '#1F1F1F'
              }}
            />
          </View>
        </View>

        {/* Collaboration Section - Frame 1171278465 */}
        <View style={{ 
          marginHorizontal: 15, 
          marginTop: 28,
          gap: 16 
        }}>
          <Text style={{ 
            fontFamily: 'Inter',
            fontWeight: '500',
            fontSize: 12,
            lineHeight: 15,
            color: '#000000'
          }}>
            Collaboration
          </Text>

          {/* Type of Business - Component 14 */}
          <View style={{ gap: 9.1 }}>
            <Text style={{ 
              fontFamily: 'Inter',
              fontWeight: '500',
              fontSize: 12,
              lineHeight: 15,
              color: '#7E7E7E'
            }}>
              Type of Business
            </Text>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 0.7,
                borderColor: '#E5E5E5',
                borderRadius: 14,
                paddingVertical: 16.09,
                paddingHorizontal: 11.89,
                height: 49,
                gap: 5.6
              }}
              onPress={() => {
                const options = ['Hotels','Restaurants','Shops','Services'];
                const idx = options.indexOf(collaborationType);
                setCollaborationType(options[(idx + 1) % options.length]);
              }}
            >
              <Text style={{ 
                flex: 1,
                fontFamily: 'Inter',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 15,
                color: '#A1A0A0'
              }}>
                {collaborationType}
              </Text>
              <ChevronDown size={24} color="#000000" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {collaborationType === 'Hotels' && (
            <View style={{ gap: 9.1 }}>
              <Text style={{ 
                fontFamily: 'Inter',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 15,
                color: '#7E7E7E'
              }}>
                Hotel Nuitee ID (optional)
              </Text>
              <TextInput
                placeholder="Hotel ID to enable booking"
                placeholderTextColor="#A1A0A0"
                value={hotelNuiteeId}
                onChangeText={setHotelNuiteeId}
                style={{ 
                  borderWidth: 0.7,
                  borderColor: '#E5E5E5',
                  borderRadius: 14,
                  paddingVertical: 16.09,
                  paddingHorizontal: 11.89,
                  height: 49,
                  fontFamily: 'Inter',
                  fontWeight: '500',
                  fontSize: 12,
                  lineHeight: 15,
                  color: '#1F1F1F'
                }}
              />
            </View>
          )}

          {/* Sponsor field */}
          <View style={{ gap: 9.1 }}>
            <Text style={{ 
              fontFamily: 'Inter',
              fontWeight: '500',
              fontSize: 12,
              lineHeight: 15,
              color: '#7E7E7E'
            }}>
              Sponsor (optional)
            </Text>
            <TextInput
              placeholder="Sponsor ID"
              placeholderTextColor="#A1A0A0"
              value={sponsorId}
              onChangeText={setSponsorId}
              style={{ 
                borderWidth: 0.7,
                borderColor: '#E5E5E5',
                borderRadius: 14,
                paddingVertical: 16.09,
                paddingHorizontal: 11.89,
                height: 49,
                fontFamily: 'Inter',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 15,
                color: '#1F1F1F'
              }}
            />
          </View>

          {/* Book toggle */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 22,
            marginTop: 8
          }}>
            <Text style={{ 
              fontFamily: 'Inter',
              fontWeight: '500',
              fontSize: 12,
              lineHeight: 15,
              color: '#000000'
            }}>
              Enable booking
            </Text>
            <Switch value={isBookEnabled} onValueChange={(v) => {
              setIsBookEnabled(v);
              if (!v) setHotelNuiteeId('');
            }} />
          </View>
        </View>

        {/* Visibility Section - Frame 1171278464 */}
        <View style={{ 
          marginHorizontal: 15, 
          marginTop: 28,
          gap: 16 
        }}>
          <Text style={{ 
            fontFamily: 'Inter',
            fontWeight: '500',
            fontSize: 12,
            lineHeight: 15,
            color: '#000000'
          }}>
            Visibility
          </Text>

          <View style={{ gap: 5 }}>
            {/* Public option */}
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                gap: 8,
                height: 20
              }}
              onPress={() => setIsVisibleOutsideCommunity(true)}
            >
              <View style={{ 
                width: 20, 
                height: 20,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {isVisibleOutsideCommunity && (
                  <View style={{
                    width: 16.67,
                    height: 16.67,
                    borderRadius: 8.33,
                    backgroundColor: '#E72858'
                  }} />
                )}
                <View style={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: isVisibleOutsideCommunity ? '#E72858' : '#E0E0E0'
                }} />
              </View>
              <Text style={{ 
                fontFamily: 'Inter',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 15,
                color: '#000000'
              }}>
                Public
              </Text>
            </TouchableOpacity>

            {/* Only Community option */}
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                gap: 8,
                height: 20
              }}
              onPress={() => setIsVisibleOutsideCommunity(false)}
            >
              <View style={{ 
                width: 20, 
                height: 20,
                padding: 2,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <View style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E0E0E0'
                }} />
                {!isVisibleOutsideCommunity && (
                  <View style={{
                    position: 'absolute',
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: '#E72858'
                  }} />
                )}
              </View>
              <Text style={{ 
                fontFamily: 'Inter',
                fontWeight: '500',
                fontSize: 12,
                lineHeight: 15,
                color: '#000000'
              }}>
                Only Community
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Actions - Frame 1000003276 */}
        <View style={{ 
          marginHorizontal: 15, 
          marginTop: 64,
          marginBottom: 24,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 16
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ 
              fontFamily: 'Inter',
              fontWeight: '700',
              fontSize: 12,
              lineHeight: 15,
              textAlign: 'center',
              color: '#5B5B5B'
            }}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handlePublish} 
            disabled={isPublishing}
            style={{
              paddingVertical: 4.625,
              paddingHorizontal: 13.4125,
              backgroundColor: isPublishing ? '#D1D5DB' : '#E72858',
              borderRadius: 555,
              height: 37,
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: 125.8
            }}
          >
            <Text style={{ 
              fontFamily: 'Inter',
              fontWeight: '700',
              fontSize: 12,
              lineHeight: 15,
              textAlign: 'center',
              color: '#FFFFFF'
            }}>
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}