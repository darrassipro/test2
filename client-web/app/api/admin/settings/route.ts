import { NextRequest, NextResponse } from 'next/server';

// Mock settings data - in a real app, this would be stored in a database
let platformSettings = {
  general: {
    siteName: 'AJIW Platform',
    siteDescription: 'A community platform for sharing and connecting',
    contactEmail: 'admin@ajiw.ma',
    supportEmail: 'support@ajiw.ma',
    maintenanceMode: false,
  },
  security: {
    requireEmailVerification: true,
    enableTwoFactor: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    moderationAlerts: true,
    systemAlerts: true,
    weeklyReports: true,
  },
  content: {
    autoModeration: true,
    allowFileUploads: true,
    maxFileSize: 10,
    allowedFileTypes: 'jpg,png,gif,pdf,doc,docx',
    requirePostApproval: false,
  },
  community: {
    allowCommunityCreation: true,
    requireCommunityApproval: false,
    maxCommunitiesPerUser: 5,
    defaultCommunityPrivacy: 'public',
  },
};

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
    const section = searchParams.get('section');

    if (section && platformSettings[section as keyof typeof platformSettings]) {
      return NextResponse.json({
        success: true,
        data: {
          [section]: platformSettings[section as keyof typeof platformSettings],
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: platformSettings,
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch settings' },
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
    const { section, settings } = body;

    if (!section || !settings) {
      return NextResponse.json(
        { success: false, message: 'Section and settings are required' },
        { status: 400 }
      );
    }

    if (!platformSettings[section as keyof typeof platformSettings]) {
      return NextResponse.json(
        { success: false, message: 'Invalid settings section' },
        { status: 400 }
      );
    }

    // Validate settings based on section
    switch (section) {
      case 'general':
        if (settings.siteName && settings.siteName.length < 3) {
          return NextResponse.json(
            { success: false, message: 'Site name must be at least 3 characters' },
            { status: 400 }
          );
        }
        if (settings.contactEmail && !isValidEmail(settings.contactEmail)) {
          return NextResponse.json(
            { success: false, message: 'Invalid contact email format' },
            { status: 400 }
          );
        }
        break;

      case 'security':
        if (settings.passwordMinLength && (settings.passwordMinLength < 6 || settings.passwordMinLength > 50)) {
          return NextResponse.json(
            { success: false, message: 'Password minimum length must be between 6 and 50' },
            { status: 400 }
          );
        }
        if (settings.sessionTimeout && (settings.sessionTimeout < 5 || settings.sessionTimeout > 1440)) {
          return NextResponse.json(
            { success: false, message: 'Session timeout must be between 5 and 1440 minutes' },
            { status: 400 }
          );
        }
        break;

      case 'content':
        if (settings.maxFileSize && (settings.maxFileSize < 1 || settings.maxFileSize > 100)) {
          return NextResponse.json(
            { success: false, message: 'Max file size must be between 1 and 100 MB' },
            { status: 400 }
          );
        }
        break;

      case 'community':
        if (settings.maxCommunitiesPerUser && (settings.maxCommunitiesPerUser < 1 || settings.maxCommunitiesPerUser > 50)) {
          return NextResponse.json(
            { success: false, message: 'Max communities per user must be between 1 and 50' },
            { status: 400 }
          );
        }
        break;
    }

    // Update the settings
    platformSettings = {
      ...platformSettings,
      [section]: {
        ...platformSettings[section as keyof typeof platformSettings],
        ...settings,
      },
    };

    // In a real application, you would save these settings to a database
    // and possibly trigger configuration updates across the system

    return NextResponse.json({
      success: true,
      message: `${section} settings updated successfully`,
      data: {
        [section]: platformSettings[section as keyof typeof platformSettings],
      },
    });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'reset_to_defaults':
        // Reset all settings to default values
        platformSettings = {
          general: {
            siteName: 'AJIW Platform',
            siteDescription: 'A community platform for sharing and connecting',
            contactEmail: 'admin@ajiw.ma',
            supportEmail: 'support@ajiw.ma',
            maintenanceMode: false,
          },
          security: {
            requireEmailVerification: true,
            enableTwoFactor: false,
            passwordMinLength: 8,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: false,
            moderationAlerts: true,
            systemAlerts: true,
            weeklyReports: true,
          },
          content: {
            autoModeration: true,
            allowFileUploads: true,
            maxFileSize: 10,
            allowedFileTypes: 'jpg,png,gif,pdf,doc,docx',
            requirePostApproval: false,
          },
          community: {
            allowCommunityCreation: true,
            requireCommunityApproval: false,
            maxCommunitiesPerUser: 5,
            defaultCommunityPrivacy: 'public',
          },
        };

        return NextResponse.json({
          success: true,
          message: 'Settings reset to defaults',
          data: platformSettings,
        });

      case 'export_settings':
        // Export current settings
        return NextResponse.json({
          success: true,
          message: 'Settings exported',
          data: {
            settings: platformSettings,
            exportedAt: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to perform settings action' },
      { status: 500 }
    );
  }
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}