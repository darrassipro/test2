export interface PostFile {
  id?: string;
  url?: string;
  type?: string;
  isPrincipale?: boolean;
  createdAt?: string;
}

export interface PostUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isVerified?: boolean;
}

export interface Community {
  id: number;
  name: string;
  description?: string;
  totalMembers?: number;
  creator?: PostUser;
  communityFiles?: PostFile[];
}

export interface Post {
  id: string | number;
  title?: string | null;
  description?: string | null;
  contentType?: 'post' | 'reel' | '360';
  location?: string | null;
  user?: PostUser;
  postFiles?: PostFile[];
  isVideo?: boolean;
  
  // Engagement metrics
  likes?: number;
  likesCount?: number;
  comments?: number;
  totalCommentsCount?: number;
  shares?: number;
  sharesCount?: number;
  
  // User interactions
  isLiked?: boolean;
  isSaved?: boolean;
  isMember?: boolean;
  
  // Community relation
  community?: Community;
  communityId?: number;
  isVisibleOutsideCommunity?: boolean;
  
  // Hotel booking
  hotelNuiteeId?: string | null;
  
  // Sponsor
  sponsorId?: string | null;
  
  // Status
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string | null;
  
  // Metadata
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Backwards-compatible legacy fields
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

export interface Comment {
  id: string | number;
  content: string;
  user?: PostUser;
  likesCount?: number;
  isLiked?: boolean;
  repliesCount?: number;
  replies?: Comment[];
  children?: Comment[];
  createdAt?: string;
}