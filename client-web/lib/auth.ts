import { apiClient } from './api';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  phone: string;
  profileImage?: string;
  banner?: string;
  profileDescription?: string;
  country?: string;
  socialMediaLinks?: Record<string, string>;
  totalFollowers: number;
  totalCommunities: number;
  isVerified: boolean;
  isActive: boolean;
  role?: string;
  createdAt: string;
  updatedAt: string;
  isProfileCompleted?: boolean;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<User>('/users/me');
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function logout(): Promise<boolean> {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.success;
  } catch (error) {
    return false;
  }
}
