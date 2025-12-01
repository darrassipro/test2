import { apiClient, ApiResponse } from '@/lib/api';

// Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  communities: number;
  posts: number;
  followers: number;
  following: number;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  creator: string;
  creatorId: number;
  members: number;
  posts: number;
  status: string;
  privacy: string;
  isPremium: boolean;
  price: number;
  createdDate: string;
  category: string;
  image?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorId: number;
  community: string;
  communityId?: number;
  status: string;
  visibility: string;
  contentType: string;
  createdDate: string;
  updatedDate: string;
  likes: number;
  comments: number;
  shares: number;
  reports: number;
  isVr: boolean;
  isBoosted: boolean;
  files: any[];
}

export interface Report {
  id: number;
  type: string;
  title: string;
  author: string;
  community: string;
  reportedBy: string;
  reason: string;
  status: string;
  reportDate: string;
  severity: string;
  contentId: number;
}

export interface DashboardData {
  stats: {
    totalUsers: number;
    totalCommunities: number;
    activeCommunities: number;
    totalPosts: number;
    userGrowth: string;
    communityGrowth: string;
    postGrowth: string;
  };
  recentUsers: any[];
  recentPosts: any[];
  recentActivity: any[];
}

export interface AnalyticsData {
  overview: any[];
  topCommunities: any[];
  topUsers: any[];
  recentActivity: any[];
  growthData: any;
}

// Admin Service Class
class AdminService {
  // Authentication
  async login(username: string, password: string): Promise<ApiResponse> {
    return apiClient.post('/api/auth/admin', { username, password });
  }

  async logout(): Promise<ApiResponse> {
    return apiClient.delete('/api/auth/admin');
  }

  // Dashboard
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return apiClient.get('/api/admin/dashboard');
  }

  // Users
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<{ users: User[]; stats: any; pagination: any }>> {
    return apiClient.get('/api/admin/users', params);
  }

  async banUser(userId: number, reason?: string): Promise<ApiResponse> {
    return apiClient.post('/api/admin/users', {
      action: 'ban',
      userId,
      data: { reason },
    });
  }

  async unbanUser(userId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/users', {
      action: 'unban',
      userId,
    });
  }

  async updateUserRole(userId: number, role: string): Promise<ApiResponse> {
    return apiClient.post('/api/admin/users', {
      action: 'update_role',
      userId,
      data: { role },
    });
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/users', {
      action: 'delete',
      userId,
    });
  }

  // Communities
  async getCommunities(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    privacy?: string;
  }): Promise<ApiResponse<{ communities: Community[]; stats: any; pagination: any }>> {
    return apiClient.get('/api/admin/communities', params);
  }

  async suspendCommunity(communityId: number, reason?: string): Promise<ApiResponse> {
    return apiClient.post('/api/admin/communities', {
      action: 'suspend',
      communityId,
      data: { reason },
    });
  }

  async activateCommunity(communityId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/communities', {
      action: 'activate',
      communityId,
    });
  }

  async updateCommunityPrivacy(communityId: number, isPrivate: boolean): Promise<ApiResponse> {
    return apiClient.post('/api/admin/communities', {
      action: 'update_privacy',
      communityId,
      data: { isPrivate },
    });
  }

  async deleteCommunity(communityId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/communities', {
      action: 'delete',
      communityId,
    });
  }

  // Posts
  async getPosts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    visibility?: string;
  }): Promise<ApiResponse<{ posts: Post[]; stats: any; pagination: any }>> {
    return apiClient.get('/api/admin/posts', params);
  }

  async approvePost(postId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/posts', {
      action: 'approve',
      postId,
    });
  }

  async rejectPost(postId: number, reason?: string): Promise<ApiResponse> {
    return apiClient.post('/api/admin/posts', {
      action: 'reject',
      postId,
      data: { reason },
    });
  }

  async hidePost(postId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/posts', {
      action: 'hide',
      postId,
    });
  }

  async boostPost(postId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/posts', {
      action: 'boost',
      postId,
    });
  }

  async deletePost(postId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/posts', {
      action: 'delete',
      postId,
    });
  }

  // Analytics
  async getAnalytics(params?: {
    timeRange?: string;
    metric?: string;
  }): Promise<ApiResponse<AnalyticsData>> {
    return apiClient.get('/api/admin/analytics', params);
  }

  // Moderation
  async getReports(params?: {
    status?: string;
    severity?: string;
    type?: string;
  }): Promise<ApiResponse<{ reports: Report[]; stats: any }>> {
    return apiClient.get('/api/admin/moderation', params);
  }

  async approveReport(reportId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/moderation', {
      action: 'approve',
      reportId,
    });
  }

  async rejectReport(reportId: number, contentId: number, contentType: string, reason?: string): Promise<ApiResponse> {
    return apiClient.post('/api/admin/moderation', {
      action: 'reject',
      reportId,
      contentId,
      contentType,
      data: { reason },
    });
  }

  async banUserFromReport(reportId: number, userId: number, reason?: string): Promise<ApiResponse> {
    return apiClient.post('/api/admin/moderation', {
      action: 'ban_user',
      reportId,
      data: { userId, reason },
    });
  }

  async warnUser(reportId: number, userId: number, message?: string): Promise<ApiResponse> {
    return apiClient.post('/api/admin/moderation', {
      action: 'warn_user',
      reportId,
      data: { userId, message },
    });
  }

  async dismissReport(reportId: number): Promise<ApiResponse> {
    return apiClient.post('/api/admin/moderation', {
      action: 'dismiss',
      reportId,
    });
  }

  // Settings
  async getSettings(section?: string): Promise<ApiResponse> {
    const params = section ? { section } : undefined;
    return apiClient.get('/api/admin/settings', params);
  }

  async updateSettings(section: string, settings: any): Promise<ApiResponse> {
    return apiClient.post('/api/admin/settings', { section, settings });
  }

  async resetSettings(): Promise<ApiResponse> {
    return apiClient.put('/api/admin/settings', { action: 'reset_to_defaults' });
  }

  async exportSettings(): Promise<ApiResponse> {
    return apiClient.put('/api/admin/settings', { action: 'export_settings' });
  }
}

export const adminService = new AdminService();