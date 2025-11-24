import { View, Text, TextInput, Image, TouchableOpacity, Switch, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, ImagePlus, Video, Orbit, MapPin, ChevronDown, CloudUpload } from "lucide-react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function CreatePost() {
  const [type, setType] = useState<"post" | "reel" | "360">("post");
  const [picked, setPicked] = useState<ImagePicker.ImagePickerAsset[]>([]);

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

        {/* Composer */}
        <View className="mx-4 mt-3 rounded-3xl border border-gray-200 p-4">
          <TextInput
            placeholder="Write something inspiring..."
            placeholderTextColor="#6B7280"
            multiline
            textAlignVertical="top"
            className="h-40 text-base"
          />
          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-row gap-2">
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
          </View>
        </View>

        {/* Uploader */}
        <TouchableOpacity
          className="mx-4 mt-6 rounded-3xl border-2 border-dashed border-gray-300 p-8 items-center justify-center"
          activeOpacity={0.9}
          onPress={onPick}
        >
          <CloudUpload size={28} color="#E72858" />
          <Text className="text-lg font-semibold mt-3">Select a file or drag and drop here</Text>
          <Text className="text-gray-400 mt-1">JPG, PNG or Mp4, file size no more than 10MB</Text>
          {picked.length > 0 ? (
            <Text className="mt-2 text-gray-500">{picked.length} file(s) selected</Text>
          ) : null}
        </TouchableOpacity>

        {/* Location */}
        <View className="mx-4 mt-6">
          <Text className="text-base font-semibold mb-2">Location</Text>
          <View className="flex-row items-center rounded-2xl border border-gray-200 px-4 py-4">
            <MapPin size={18} color="#111" />
            <Text className="text-gray-400 ml-2">Rabat</Text>
          </View>
        </View>

        {/* Collaboration */}
        <View className="mx-4 mt-6">
          <Text className="text-base font-semibold mb-2">Collaboration</Text>
          <Text className="text-gray-500 mb-2">Type of Business</Text>
          <View className="flex-row items-center justify-between rounded-2xl border border-gray-200 px-4 py-4">
            <Text className="text-gray-400">Hotels</Text>
            <ChevronDown size={18} color="#111" />
          </View>
        </View>

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
          <TouchableOpacity className="bg-pink-500 px-8 py-3 rounded-full">
            <Text className="text-white text-lg font-semibold">Publish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


