export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 10000,
};

export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  
  // User endpoints
  USERS: {
    LIST: '/users',
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    DELETE: '/users/delete',
    STATS: '/users/stats',
  },
  
  // Community endpoints
  COMMUNITIES: {
    LIST: '/communities',
    CREATE: '/communities',
    UPDATE: '/communities',
    DELETE: '/communities',
    MEMBERS: '/communities/members',
    STATS: '/communities/stats',
  },
  
  // Post endpoints
  POSTS: {
    LIST: '/posts',
    CREATE: '/posts',
    UPDATE: '/posts',
    DELETE: '/posts',
    STATS: '/posts/stats',
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    COMMUNITIES: '/admin/communities',
    POSTS: '/admin/posts',
    ANALYTICS: '/admin/analytics',
    MODERATION: '/admin/moderation',
    SETTINGS: '/admin/settings',
  },
};