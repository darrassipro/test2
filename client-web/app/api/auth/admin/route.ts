import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Call the backend authentication API
    const response = await apiClient.post('/auth/login', {
      primaryIdentifier: username,
      password: password,
    });

    if (response.success && response.data) {
      // Check if user has admin privileges
      // This would typically be done by checking user roles in the response
      const { user, token } = response.data;
      
      // For now, we'll check if the user has admin role or is a super admin
      // You should adjust this based on your actual user role structure
      const isAdmin = user.role === 'admin' || user.role === 'super_admin' || user.isAdmin;
      
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, message: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email || user.gmail,
            role: user.role,
            profileImage: user.profileImage,
          },
          token: token,
        },
        message: 'Admin login successful',
      });
    }

    return NextResponse.json(
      { success: false, message: response.message || 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Handle logout
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      // Call backend logout if needed
      await apiClient.post('/auth/logout').catch(() => {
        // Ignore logout errors
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}