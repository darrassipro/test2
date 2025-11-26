// Centralized interfaces for app types

export interface PostFile {
  id?: string;
  url?: string;
  type?: string;
}

export interface PostUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface Post {
  id: string | number; // server uses UUID, older code may use numeric ids
  title?: string | null;
  description?: string | null;
  user?: PostUser; // association named `user` from server
  postFiles?: PostFile[]; // optional media files
  isVideo?: boolean;
  likes?: number; // optional counts returned by server or computed client-side
  comments?: number;
  shares?: number;
  isLiked?: boolean;
  verified?: boolean;
  createdAt?: string;
  status?: string;
  // Backwards-compatible legacy fields used by some components
  username?: string;
  avatar?: string;
  image?: string;
}

export interface PostCardProps {
  post: Post;
  onLike?: (postId: string | number) => void;
}

export interface CommunityCardProps {
  id: number;
  name: string;
  followers: string;
  avatar: string;
  image: string;
  variant?: "horizontal" | "grid";
  isMember?: boolean;
  onJoin?: (id: number) => void;
}

export interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}


export interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  cardDimensions?: { width: number; height: number };
  sendToBackOnClick?: boolean;
  cardsData?: { id: number; img: string }[];
  animationConfig?: { stiffness: number; damping: number };
}


export interface AccountOption {
  icon: string;
  label: string;
  onPress: () => void;
}


