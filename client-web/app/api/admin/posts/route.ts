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
    const visibility = searchParams.get('visibility') || '';

    // Build query parameters for backend
    const queryParams: Record<string, any> = {
      page,
      limit,
    };

    if (search) queryParams.search = search;
    if (status) queryParams.status = status;
    if (visibility) queryParams.visibility = visibility;

    // Fetch posts from backend
    const response = await apiClient.get('/posts', queryParams);

    if (!response.success) {
      return NextResponse.json(
        { success: false, message: response.message || 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    const posts = response.data || [];

    // Transform post data for admin interface
    const transformedPosts = await Promise.all(
      posts.map(async (post: any) => {
        // Get engagement metrics
        let likes = 0;
        let comments = 0;
        let shares = 0;
        let reports = 0;

        try {
          // Fetch post likes
          const likesResponse = await apiClient.get(`/posts/${post.id}/likes`);
          if (likesResponse.success) {
            likes = likesResponse.data?.length || 0;
          }

          // Fetch post comments
          const commentsResponse = await apiClient.get(`/posts/${post.id}/comments`);
          if (commentsResponse.success) {
            comments = commentsResponse.data?.length || 0;
          }

          // Fetch post shares
          const sharesResponse = await apiClient.get(`/posts/${post.id}/shares`);
          if (sharesResponse.success) {
            shares = sharesResponse.data?.length || 0;
          }

          // Note: Reports would need to be implemented in the backend
          // For now, we'll use a placeholder
          reports = 0;
        } catch (error) {
          console.error(`Error fetching engagement for post ${post.id}:`, error);
        }

        return {
          id: post.id,
          title: post.title,
          content: post.description || post.content,
          author: post.User ? `${post.User.firstName} ${post.User.lastName}` : 'Unknown',
          authorId: post.userId,
          community: post.Community ? post.Community.name : 'No Community',
          communityId: post.communityId,
          status: post.isActive !== false ? 'Published' : 'Inactive',
          visibility: post.isVisibleOutsideCommunity ? 'Public' : 'Private',
          contentType: post.contentType || 'text',
          createdDate: post.createdAt,
          updatedDate: post.updatedAt,
          likes,
          comments,
          shares,
          reports,
          isVr: post.isVr || false,
          isBoosted: post.isBoosted || false,
          files: post.PostFiles || [],
        };
      })
    );

    // Calculate statistics
    const stats = {
      total: transformedPosts.length,
      published: transformedPosts.filter(p => p.status === 'Published').length,
      inactive: transformedPosts.filter(p => p.status === 'Inactive').length,
      public: transformedPosts.filter(p => p.visibility === 'Public').length,
      private: transformedPosts.filter(p => p.visibility === 'Private').length,
      reported: transformedPosts.filter(p => p.reports > 0).length,
      totalLikes: transformedPosts.reduce((sum, p) => sum + p.likes, 0),
      totalComments: transformedPosts.reduce((sum, p) => sum + p.comments, 0),
      totalShares: transformedPosts.reduce((sum, p) => sum + p.shares, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        posts: transformedPosts,
        stats,
        pagination: {
          page,
          limit,
          total: transformedPosts.length,
          pages: Math.ceil(transformedPosts.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch posts' },
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
    const { action, postId, data } = body;

    switch (action) {
      case 'approve':
        // Approve post
        const approveResponse = await apiClient.patch(`/posts/${postId}`, {
          isActive: true,
          approvedAt: new Date().toISOString(),
          moderationStatus: 'approved',
        });
        
        return NextResponse.json({
          success: approveResponse.success,
          message: approveResponse.success ? 'Post approved successfully' : approveResponse.message,
        });

      case 'reject':
        // Reject post
        const rejectResponse = await apiClient.patch(`/posts/${postId}`, {
          isActive: false,
          rejectedAt: new Date().toISOString(),
          moderationStatus: 'rejected',
          rejectionReason: data?.reason || 'Rejected by admin',
        });
        
        return NextResponse.json({
          success: rejectResponse.success,
          message: rejectResponse.success ? 'Post rejected successfully' : rejectResponse.message,
        });

      case 'hide':
        // Hide post
        const hideResponse = await apiClient.patch(`/posts/${postId}`, {
          isActive: false,
          hiddenAt: new Date().toISOString(),
          moderationStatus: 'hidden',
        });
        
        return NextResponse.json({
          success: hideResponse.success,
          message: hideResponse.success ? 'Post hidden successfully' : hideResponse.message,
        });

      case 'boost':
        // Boost post
        const boostResponse = await apiClient.patch(`/posts/${postId}`, {
          isBoosted: true,
          boostedAt: new Date().toISOString(),
        });
        
        return NextResponse.json({
          success: boostResponse.success,
          message: boostResponse.success ? 'Post boosted successfully' : boostResponse.message,
        });

      case 'delete':
        // Delete post
        const deleteResponse = await apiClient.delete(`/posts/${postId}`);
        
        return NextResponse.json({
          success: deleteResponse.success,
          message: deleteResponse.success ? 'Post deleted successfully' : deleteResponse.message,
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Post action error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to perform post action' },
      { status: 500 }
    );
  }
}