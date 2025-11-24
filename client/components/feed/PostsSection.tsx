import { View } from "react-native";
import { useState } from "react";
import PostCard from "./PostCard";

const initialPosts = [
  {
    id: 1,
    username: "Fayssal Vlog",
    location: "Palace Restaurant",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    image:
      "https://images.unsplash.com/photo-1762140170241-7c8e552f25bb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
    likes: 1250000,
    comments: 215,
    shares: 2000,
    verified: true,
    isLiked: false,
    timeAgo: "2h",
    hasBookButton: true,
  },
  {
    id: 2,
    username: "Alscommunity",
    location: "",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100",
    image:
      "https://images.unsplash.com/photo-1762498322297-10a7035e9334?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687",
    likes: 12500,
    comments: 215,
    shares: 2000,
    verified: true,
    isLiked: false,
    timeAgo: "",
    isVideo: true,
  },
];

export default function PostsSection() {
  const [posts, setPosts] = useState(initialPosts);

  const toggleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  return (
    <View>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={toggleLike} />
      ))}
    </View>
  );
}


