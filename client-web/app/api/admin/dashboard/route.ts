import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    // Set the authorization header for backend API calls
    if (authHeader) {
      // Update the apiClient to use the authorization header
      const token = authHeader.replace('Bearer ', '');
      // For now, we'll proceed without token validation since we're proxying to backend
    }

    // Get dashboard statistics from multiple endpoints
    const [usersResponse, communitiesResponse, postsResponse] = await Promise.allSettled([
      apiClient.get('/users'),
      apiClient.get('/communities'),
      apiClient.get('/posts'),
    ]);

    // Process users data
    let totalUsers = 0;
    let recentUsers = [];
    if (usersResponse.status === 'fulfilled' && usersResponse.value.success) {
      const users = usersResponse.value.data || [];
      totalUsers = users.length;
      recentUsers = users
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email || user.gmail,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
        }));
    }

    // Process communities data
    let totalCommunities = 0;
    let activeCommunities = 0;
    if (communitiesResponse.status === 'fulfilled' && communitiesResponse.value.success) {
      const communities = communitiesResponse.value.data || [];
      totalCommunities = communities.length;
      activeCommunities = communities.filter(c => c.isActive !== false).length;
    }

    // Process posts data
    let totalPosts = 0;
    let recentPosts = [];
    if (postsResponse.status === 'fulfilled' && postsResponse.value.success) {
      const posts = postsResponse.value.data || [];
      totalPosts = posts.length;
      recentPosts = posts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(post => ({
          id: post.id,
          title: post.title,
          author: post.User ? `${post.User.firstName} ${post.User.lastName}` : 'Unknown',
          community: post.Community ? post.Community.name : 'No Community',
          createdAt: post.createdAt,
        }));
    }

    // Calculate growth percentages (mock data for now)
    const userGrowth = '+12%';
    const communityGrowth = '+8%';
    const postGrowth = '+15%';

    const dashboardData = {
      stats: {
        totalUsers,
        totalCommunities,
        activeCommunities,
        totalPosts,
        userGrowth,
        communityGrowth,
        postGrowth,
      },
      recentUsers,
      recentPosts,
      recentActivity: [
        {
          id: 1,
          type: 'user_registration',
          description: 'New user registered',
          user: recentUsers[0]?.name || 'Unknown User',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'post_created',
          description: 'New post published',
          user: recentPosts[0]?.author || 'Unknown User',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: 3,
          type: 'community_created',
          description: 'New community created',
          user: 'Community Creator',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}