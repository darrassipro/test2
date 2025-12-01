// Admin Dashboard Types
export interface DashboardData {
  stats: {
    totalUsers: number;
    userGrowth: number;
    activeCommunities: number;
    totalCommunities?: number;
    communityGrowth: number;
    totalPosts: number;
    postGrowth: number;
    activeUsers: number;
    activeUsersGrowth: number;
  };
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
    user?: string;
  }>;
  recentUsers?: Array<{
    id: number;
    name: string;
    email: string;
    createdAt: string;
  }>;
  recentPosts?: Array<{
    id: number;
    title: string;
    author: string;
    community: string;
  }>;
  topCommunities?: Array<{
    id: number;
    name: string;
    members: number;
    posts: number;
  }>;
}

// User Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  isBanned?: boolean;
  status?: string;
  profileImage?: string;
  communities?: number;
  posts?: number;
  createdAt: string;
  updatedAt: string;
}

// Community Types
export interface Community {
  id: string;
  name: string;
  description: string;
  creatorUserId: string;
  totalMembers: number;
  totalPosts: number;
  totalProducts: number;
  isVerified: boolean;
  isPrivate: boolean;
  isPremium: boolean;
  isDeleted: boolean;
  price?: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  banner?: string;
}

// Post Types
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId?: number;
  communityId?: number;
  author?: string;
  community?: string;
  status: string;
  visibility?: string;
  likes?: number;
  likesCount?: number;
  comments?: number;
  commentsCount?: number;
  shares?: number;
  createdAt?: string;
  createdDate?: string;
  updatedAt?: string;
}

// Report Types
export interface Report {
  id: number;
  contentType: string;
  contentId: number;
  reason: string;
  description?: string;
  reporterId: number;
  status: string;
  severity: string;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

// Analytics Types
export interface AnalyticsData {
  timeRange: string;
  metrics: {
    users: {
      total: number;
      new: number;
      active: number;
      growth: number;
    };
    communities: {
      total: number;
      new: number;
      active: number;
      growth: number;
    };
    posts: {
      total: number;
      new: number;
      growth: number;
    };
    engagement: {
      likes: number;
      comments: number;
      shares: number;
    };
  };
  charts: {
    userGrowth: Array<{ date: string; count: number }>;
    communityGrowth: Array<{ date: string; count: number }>;
    postActivity: Array<{ date: string; count: number }>;
  };
}

// Settings Types
export interface Settings {
  general?: {
    siteName?: string;
    siteDescription?: string;
    maintenanceMode?: boolean;
  };
  security?: {
    passwordMinLength?: number;
    requireEmailVerification?: boolean;
    maxLoginAttempts?: number;
  };
  notifications?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  };
}
