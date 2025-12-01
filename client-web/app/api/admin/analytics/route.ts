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

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const metric = searchParams.get('metric') || 'all';

    // Fetch data from multiple endpoints
    const [usersResponse, communitiesResponse, postsResponse] = await Promise.allSettled([
      apiClient.get('/users'),
      apiClient.get('/communities'),
      apiClient.get('/posts'),
    ]);

    let users = [];
    let communities = [];
    let posts = [];

    if (usersResponse.status === 'fulfilled' && usersResponse.value.success) {
      users = usersResponse.value.data || [];
    }

    if (communitiesResponse.status === 'fulfilled' && communitiesResponse.value.success) {
      communities = communitiesResponse.value.data || [];
    }

    if (postsResponse.status === 'fulfilled' && postsResponse.value.success) {
      posts = postsResponse.value.data || [];
    }

    // Calculate overview metrics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => {
      const lastActivity = new Date(u.lastLogin || u.updatedAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastActivity > thirtyDaysAgo;
    }).length;

    const totalPosts = posts.length;
    const totalCommunities = communities.length;

    // Calculate growth percentages (simplified calculation)
    const userGrowth = '+12%'; // This would be calculated based on historical data
    const postGrowth = '+15%';
    const communityGrowth = '+5%';
    const engagementGrowth = '+8%';

    // Top communities by member count
    const topCommunities = await Promise.all(
      communities.slice(0, 5).map(async (community: any) => {
        let memberCount = 0;
        let postCount = 0;
        
        try {
          const membersResponse = await apiClient.get(`/communities/${community.id}/members`);
          if (membersResponse.success) {
            memberCount = membersResponse.data?.length || 0;
          }

          const communityPosts = posts.filter(p => p.communityId === community.id);
          postCount = communityPosts.length;
        } catch (error) {
          console.error(`Error fetching data for community ${community.id}:`, error);
        }

        return {
          name: community.name,
          members: memberCount,
          posts: postCount,
          engagement: Math.floor(Math.random() * 20 + 70) + '%', // Mock engagement
        };
      })
    );

    // Top users by activity
    const topUsers = users
      .slice(0, 5)
      .map((user: any) => {
        const userPosts = posts.filter(p => p.userId === user.id);
        const userCommunities = communities.filter(c => c.userId === user.id);
        
        return {
          name: `${user.firstName} ${user.lastName}`,
          posts: userPosts.length,
          likes: Math.floor(Math.random() * 1000 + 100), // Mock likes
          communities: userCommunities.length,
        };
      });

    // Recent activity
    const recentActivity = [
      {
        action: 'New user registration',
        user: users[0] ? `${users[0].firstName} ${users[0].lastName}` : 'Unknown User',
        time: '2 minutes ago',
      },
      {
        action: 'Community created',
        user: communities[0] ? `${communities[0].User?.firstName} ${communities[0].User?.lastName}` : 'Unknown User',
        time: '15 minutes ago',
      },
      {
        action: 'Post published',
        user: posts[0] ? `${posts[0].User?.firstName} ${posts[0].User?.lastName}` : 'Unknown User',
        time: '23 minutes ago',
      },
      {
        action: 'User reported content',
        user: 'Moderator',
        time: '1 hour ago',
      },
      {
        action: 'Community joined',
        user: 'New Member',
        time: '2 hours ago',
      },
    ];

    // Growth data (mock data for charts)
    const growthData = {
      users: [
        { month: 'Jan', value: 1200 },
        { month: 'Feb', value: 1350 },
        { month: 'Mar', value: 1500 },
        { month: 'Apr', value: 1680 },
        { month: 'May', value: 1850 },
        { month: 'Jun', value: 2100 },
      ],
      posts: [
        { month: 'Jan', value: 450 },
        { month: 'Feb', value: 520 },
        { month: 'Mar', value: 680 },
        { month: 'Apr', value: 750 },
        { month: 'May', value: 890 },
        { month: 'Jun', value: 1020 },
      ],
      engagement: [
        { month: 'Jan', likes: 2400, comments: 800, shares: 300 },
        { month: 'Feb', likes: 2800, comments: 950, shares: 420 },
        { month: 'Mar', likes: 3200, comments: 1100, shares: 580 },
        { month: 'Apr', likes: 3600, comments: 1250, shares: 650 },
        { month: 'May', likes: 4100, comments: 1400, shares: 750 },
        { month: 'Jun', likes: 4800, comments: 1650, shares: 890 },
      ],
    };

    const analyticsData = {
      overview: [
        {
          title: 'Total Users',
          value: totalUsers.toLocaleString(),
          change: userGrowth,
          trend: 'up',
        },
        {
          title: 'Active Users (30d)',
          value: activeUsers.toLocaleString(),
          change: engagementGrowth,
          trend: 'up',
        },
        {
          title: 'Total Posts',
          value: totalPosts.toLocaleString(),
          change: postGrowth,
          trend: 'up',
        },
        {
          title: 'Total Communities',
          value: totalCommunities.toLocaleString(),
          change: communityGrowth,
          trend: 'up',
        },
      ],
      topCommunities,
      topUsers,
      recentActivity,
      growthData,
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}