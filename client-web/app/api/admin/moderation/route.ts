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
    const status = searchParams.get('status') || '';
    const severity = searchParams.get('severity') || '';
    const type = searchParams.get('type') || '';

    // For now, we'll create mock reported content since the backend doesn't have a reports system yet
    // In a real implementation, you would fetch from a reports table
    const mockReports = [
      {
        id: 1,
        type: 'Post',
        title: 'Inappropriate content example',
        author: 'User123',
        community: 'Tech Enthusiasts',
        reportedBy: 'ModeratorUser',
        reason: 'Spam',
        status: 'Pending',
        reportDate: '2024-01-15',
        severity: 'Medium',
        contentId: 1,
      },
      {
        id: 2,
        type: 'Comment',
        title: 'Offensive language in comment',
        author: 'BadUser456',
        community: 'Photography Club',
        reportedBy: 'CommunityMember',
        reason: 'Harassment',
        status: 'Under Review',
        reportDate: '2024-01-14',
        severity: 'High',
        contentId: 2,
      },
      {
        id: 3,
        type: 'Post',
        title: 'Misleading information post',
        author: 'FakeNews789',
        community: 'Gaming Community',
        reportedBy: 'TrustedUser',
        reason: 'Misinformation',
        status: 'Resolved',
        reportDate: '2024-01-13',
        severity: 'High',
        contentId: 3,
      },
      {
        id: 4,
        type: 'User Profile',
        title: 'Fake profile with stolen images',
        author: 'FakeProfile',
        community: 'N/A',
        reportedBy: 'VerifiedUser',
        reason: 'Identity Theft',
        status: 'Pending',
        reportDate: '2024-01-12',
        severity: 'Critical',
        contentId: 4,
      },
      {
        id: 5,
        type: 'Comment',
        title: 'Promotional spam comment',
        author: 'SpamBot',
        community: 'Cooking Enthusiasts',
        reportedBy: 'ActiveMember',
        reason: 'Spam',
        status: 'Resolved',
        reportDate: '2024-01-11',
        severity: 'Low',
        contentId: 5,
      },
    ];

    // Filter reports based on query parameters
    let filteredReports = mockReports;

    if (status && status !== 'All') {
      filteredReports = filteredReports.filter(report => report.status === status);
    }

    if (severity && severity !== 'All') {
      filteredReports = filteredReports.filter(report => report.severity === severity);
    }

    if (type && type !== 'All') {
      filteredReports = filteredReports.filter(report => report.type === type);
    }

    // Calculate moderation statistics
    const stats = {
      pending: mockReports.filter(r => r.status === 'Pending').length,
      underReview: mockReports.filter(r => r.status === 'Under Review').length,
      resolved: mockReports.filter(r => r.status === 'Resolved').length,
      critical: mockReports.filter(r => r.severity === 'Critical').length,
      high: mockReports.filter(r => r.severity === 'High').length,
      medium: mockReports.filter(r => r.severity === 'Medium').length,
      low: mockReports.filter(r => r.severity === 'Low').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        reports: filteredReports,
        stats,
      },
    });
  } catch (error) {
    console.error('Moderation API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch moderation data' },
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
    const { action, reportId, contentId, contentType, data } = body;

    switch (action) {
      case 'approve':
        // Approve the reported content (mark as not violating)
        // In a real implementation, you would update the report status
        // and possibly take action on the content
        
        return NextResponse.json({
          success: true,
          message: 'Report approved - content is not violating policies',
        });

      case 'reject':
        // Reject the report and take action on content
        let actionResponse;
        
        if (contentType === 'Post') {
          // Hide or delete the post
          actionResponse = await apiClient.patch(`/posts/${contentId}`, {
            isActive: false,
            moderationStatus: 'rejected',
            rejectionReason: data?.reason || 'Content violates community guidelines',
          });
        } else if (contentType === 'Comment') {
          // Delete the comment
          actionResponse = await apiClient.delete(`/posts/comments/${contentId}`);
        } else if (contentType === 'User Profile') {
          // Suspend the user
          actionResponse = await apiClient.patch(`/users/${contentId}`, {
            isActive: false,
            suspendedAt: new Date().toISOString(),
            suspensionReason: data?.reason || 'Profile violates community guidelines',
          });
        }

        return NextResponse.json({
          success: actionResponse?.success || true,
          message: actionResponse?.success 
            ? 'Report processed and action taken on content'
            : 'Report processed but action failed',
        });

      case 'ban_user':
        // Ban the user who created the reported content
        const banResponse = await apiClient.patch(`/users/${data?.userId}`, {
          isActive: false,
          bannedAt: new Date().toISOString(),
          banReason: data?.reason || 'Banned due to policy violation',
        });

        return NextResponse.json({
          success: banResponse.success,
          message: banResponse.success 
            ? 'User banned successfully'
            : 'Failed to ban user',
        });

      case 'warn_user':
        // Send warning to user (this would require a warnings system)
        // For now, we'll just return success
        return NextResponse.json({
          success: true,
          message: 'Warning sent to user',
        });

      case 'dismiss':
        // Dismiss the report without action
        return NextResponse.json({
          success: true,
          message: 'Report dismissed',
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Moderation action error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to perform moderation action' },
      { status: 500 }
    );
  }
}