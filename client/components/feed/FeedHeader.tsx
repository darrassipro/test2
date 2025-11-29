import { View, Image,  } from "react-native";
import { Bell, MessageCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAppSelector } from "@/lib/hooks";
import { selectUser } from "@/services/slices/userSlice";
import icons from '@/constants/icons';
export default function FeedHeader() {
  const router = useRouter();
  const user = useAppSelector(selectUser);

  return (
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-gray-100">
          <View className="flex-row items-center gap-4">
            <Image source={icons.logo} className="w-8 h-8" /> 
          </View>
          <View className="flex-row items-center gap-4">
            <Bell size={24} color="#000" />
            <MessageCircle size={24} color="#000" />
            <Image
              source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100' }}
              className="w-8 h-8 rounded-full"
            />
          </View>
        </View>
  );
}