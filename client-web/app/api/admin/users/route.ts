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
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    // Build query parameters for backend
    const queryParams: Record<string, any> = {
      page,
      limit,
    };

    if (search) queryParams.search = search;
    if (role) queryParams.role = role;
    if (status) queryParams.status = status;

    // Fetch users from backend
    const response = await apiClient.get('/users', queryParams);

    if (!response.success) {
      return NextResponse.json(
        { success: false, message: response.message || 'Failed to fetch users' },
        { status: 500 }
      );
    }

    const users = response.data || [];

    // Transform user data for admin interface
    const transformedUsers = users.map((user: any) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email || user.gmail,
      phone: user.phone,
      profileImage: user.profileImage,
      role: user.role || 'user',
      status: user.isActive !== false ? 'Active' : 'Inactive',
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      // Additional computed fields
      communities: user.communities?.length || 0,
      posts: user.posts?.length || 0,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
    }));

    // Calculate statistics
    const stats = {
      total: transformedUsers.length,
      active: transformedUsers.filter(u => u.status === 'Active').length,
      inactive: transformedUsers.filter(u => u.status === 'Inactive').length,
      verified: transformedUsers.filter(u => u.emailVerified).length,
      admins: transformedUsers.filter(u => u.role === 'admin').length,
      moderators: transformedUsers.filter(u => u.role === 'moderator').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        users: transformedUsers,
        stats,
        pagination: {
          page,
          limit,
          total: transformedUsers.length,
          pages: Math.ceil(transformedUsers.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
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
    const { action, userId, data } = body;

    switch (action) {
      case 'ban':
        // Ban user
        const banResponse = await apiClient.patch(`/users/${userId}`, {
          isActive: false,
          bannedAt: new Date().toISOString(),
          banReason: data?.reason || 'Banned by admin',
        });
        
        return NextResponse.json({
          success: banResponse.success,
          message: banResponse.success ? 'User banned successfully' : banResponse.message,
        });

      case 'unban':
        // Unban user
        const unbanResponse = await apiClient.patch(`/users/${userId}`, {
          isActive: true,
          bannedAt: null,
          banReason: null,
        });
        
        return NextResponse.json({
          success: unbanResponse.success,
          message: unbanResponse.success ? 'User unbanned successfully' : unbanResponse.message,
        });

      case 'update_role':
        // Update user role
        const roleResponse = await apiClient.patch(`/users/${userId}`, {
          role: data?.role,
        });
        
        return NextResponse.json({
          success: roleResponse.success,
          message: roleResponse.success ? 'User role updated successfully' : roleResponse.message,
        });

      case 'delete':
        // Delete user
        const deleteResponse = await apiClient.delete(`/users/${userId}`);
        
        return NextResponse.json({
          success: deleteResponse.success,
          message: deleteResponse.success ? 'User deleted successfully' : deleteResponse.message,
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to perform user action' },
      { status: 500 }
    );
  }
}