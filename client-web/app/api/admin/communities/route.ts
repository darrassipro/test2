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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const privacy = searchParams.get('privacy') || '';

    // Build query parameters for backend
    const queryParams: Record<string, any> = {
      page,
      limit,
    };

    if (search) queryParams.search = search;
    if (status) queryParams.status = status;
    if (privacy) queryParams.privacy = privacy;

    // Fetch communities from backend
    const response = await apiClient.get('/communities', queryParams);

    if (!response.success) {
      return NextResponse.json(
        { success: false, message: response.message || 'Failed to fetch communities' },
        { status: 500 }
      );
    }

    const communities = response.data || [];

    // Transform community data for admin interface
    const transformedCommunities = await Promise.all(
      communities.map(async (community: any) => {
        // Get member count
        let memberCount = 0;
        let postCount = 0;
        
        try {
          // Fetch community members
          const membersResponse = await apiClient.get(`/communities/${community.id}/members`);
          if (membersResponse.success) {
            memberCount = membersResponse.data?.length || 0;
          }

          // Fetch community posts
          const postsResponse = await apiClient.get(`/posts?communityId=${community.id}`);
          if (postsResponse.success) {
            postCount = postsResponse.data?.length || 0;
          }
        } catch (error) {
          console.error(`Error fetching data for community ${community.id}:`, error);
        }

        return {
          id: community.id,
          name: community.name,
          description: community.description,
          creator: community.User ? `${community.User.firstName} ${community.User.lastName}` : 'Unknown',
          creatorId: community.userId,
          members: memberCount,
          posts: postCount,
          status: community.isActive !== false ? 'Active' : 'Inactive',
          privacy: community.isPrivate ? 'Private' : 'Public',
          isPremium: community.isPremium || false,
          price: community.price || 0,
          createdDate: community.createdAt,
          category: community.categories?.[0]?.name || 'Uncategorized',
          image: community.CommunityFiles?.[0]?.fileUrl || null,
        };
      })
    );

    // Calculate statistics
    const stats = {
      total: transformedCommunities.length,
      active: transformedCommunities.filter(c => c.status === 'Active').length,
      inactive: transformedCommunities.filter(c => c.status === 'Inactive').length,
      public: transformedCommunities.filter(c => c.privacy === 'Public').length,
      private: transformedCommunities.filter(c => c.privacy === 'Private').length,
      premium: transformedCommunities.filter(c => c.isPremium).length,
      totalMembers: transformedCommunities.reduce((sum, c) => sum + c.members, 0),
      totalPosts: transformedCommunities.reduce((sum, c) => sum + c.posts, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        communities: transformedCommunities,
        stats,
        pagination: {
          page,
          limit,
          total: transformedCommunities.length,
          pages: Math.ceil(transformedCommunities.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Communities API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch communities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, communityId, data } = body;

    switch (action) {
      case 'suspend':
        // Suspend community
        const suspendResponse = await apiClient.patch(`/communities/${communityId}`, {
          isActive: false,
          suspendedAt: new Date().toISOString(),
          suspensionReason: data?.reason || 'Suspended by admin',
        });
        
        return NextResponse.json({
          success: suspendResponse.success,
          message: suspendResponse.success ? 'Community suspended successfully' : suspendResponse.message,
        });

      case 'activate':
        // Activate community
        const activateResponse = await apiClient.patch(`/communities/${communityId}`, {
          isActive: true,
          suspendedAt: null,
          suspensionReason: null,
        });
        
        return NextResponse.json({
          success: activateResponse.success,
          message: activateResponse.success ? 'Community activated successfully' : activateResponse.message,
        });

      case 'update_privacy':
        // Update community privacy
        const privacyResponse = await apiClient.patch(`/communities/${communityId}`, {
          isPrivate: data?.isPrivate,
        });
        
        return NextResponse.json({
          success: privacyResponse.success,
          message: privacyResponse.success ? 'Community privacy updated successfully' : privacyResponse.message,
        });

      case 'delete':
        // Delete community
        const deleteResponse = await apiClient.delete(`/communities/${communityId}`);
        
        return NextResponse.json({
          success: deleteResponse.success,
          message: deleteResponse.success ? 'Community deleted successfully' : deleteResponse.message,
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Community action error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to perform community action' },
      { status: 500 }
    );
  }
}