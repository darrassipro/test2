import { View, Text, ScrollView } from "react-native";
import CommunityCard from "./CommunityCard";

const suggestions = [
  {
    id: 1,
    name: "Fayssal Vlog",
    followers: "30k followers",
    avatar: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=200",
    image: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 2,
    name: "Darlene Robertson",
    followers: "30k followers",
    avatar: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=200",
    image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    id: 3,
    name: "Cody Fisher",
    followers: "30k followers",
    avatar: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=200",
    image: "https://images.pexels.com/photos/1118877/pexels-photo-1118877.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
];

export default function SuggestedSection() {
  return (
    <View className="px-4 my-6">
      <Text className="text-2xl font-semibold mb-6">Suggested for you</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
        {suggestions.map((suggestion) => (
          <CommunityCard
            key={suggestion.id}
            id={suggestion.id}
            name={suggestion.name}
            followers={suggestion.followers}
            avatar={suggestion.avatar}
            image={suggestion.image}
          />
        ))}
      </ScrollView>
    </View>
  );
}


