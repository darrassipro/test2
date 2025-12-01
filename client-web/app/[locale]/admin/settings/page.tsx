'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Globe, Shield, Bell, Database, Users, Mail } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
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
  });

  const handleSave = (section: string) => {
    console.log(`Saving ${section} settings:`, settings[section as keyof typeof settings]);
    // Here you would typically make an API call to save the settings
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure platform settings and preferences
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <Input
                value={settings.general.siteName}
                onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <Input
                type="email"
                value={settings.general.contactEmail}
                onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Description
            </label>
            <Input
              value={settings.general.siteDescription}
              onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.general.maintenanceMode}
              onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
              Enable Maintenance Mode
            </label>
          </div>
          <Button onClick={() => handleSave('general')}>
            <Save className="h-4 w-4 mr-2" />
            Save General Settings
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>Platform security and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Password Length
              </label>
              <Input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <Input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={settings.security.requireEmailVerification}
                onChange={(e) => handleInputChange('security', 'requireEmailVerification', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="requireEmailVerification" className="text-sm font-medium text-gray-700">
                Require Email Verification
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableTwoFactor"
                checked={settings.security.enableTwoFactor}
                onChange={(e) => handleInputChange('security', 'enableTwoFactor', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="enableTwoFactor" className="text-sm font-medium text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>
          <Button onClick={() => handleSave('security')}>
            <Save className="h-4 w-4 mr-2" />
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>Configure system notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="moderationAlerts"
                checked={settings.notifications.moderationAlerts}
                onChange={(e) => handleInputChange('notifications', 'moderationAlerts', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="moderationAlerts" className="text-sm font-medium text-gray-700">
                Moderation Alerts
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="systemAlerts"
                checked={settings.notifications.systemAlerts}
                onChange={(e) => handleInputChange('notifications', 'systemAlerts', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="systemAlerts" className="text-sm font-medium text-gray-700">
                System Alerts
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="weeklyReports"
                checked={settings.notifications.weeklyReports}
                onChange={(e) => handleInputChange('notifications', 'weeklyReports', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="weeklyReports" className="text-sm font-medium text-gray-700">
                Weekly Reports
              </label>
            </div>
          </div>
          <Button onClick={() => handleSave('notifications')}>
            <Save className="h-4 w-4 mr-2" />
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <CardTitle>Content Settings</CardTitle>
          </div>
          <CardDescription>Content management and moderation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max File Size (MB)
              </label>
              <Input
                type="number"
                value={settings.content.maxFileSize}
                onChange={(e) => handleInputChange('content', 'maxFileSize', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allowed File Types
              </label>
              <Input
                value={settings.content.allowedFileTypes}
                onChange={(e) => handleInputChange('content', 'allowedFileTypes', e.target.value)}
                placeholder="jpg,png,gif,pdf"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoModeration"
                checked={settings.content.autoModeration}
                onChange={(e) => handleInputChange('content', 'autoModeration', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoModeration" className="text-sm font-medium text-gray-700">
                Enable Auto-Moderation
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowFileUploads"
                checked={settings.content.allowFileUploads}
                onChange={(e) => handleInputChange('content', 'allowFileUploads', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="allowFileUploads" className="text-sm font-medium text-gray-700">
                Allow File Uploads
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requirePostApproval"
                checked={settings.content.requirePostApproval}
                onChange={(e) => handleInputChange('content', 'requirePostApproval', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="requirePostApproval" className="text-sm font-medium text-gray-700">
                Require Post Approval
              </label>
            </div>
          </div>
          <Button onClick={() => handleSave('content')}>
            <Save className="h-4 w-4 mr-2" />
            Save Content Settings
          </Button>
        </CardContent>
      </Card>

      {/* Community Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle>Community Settings</CardTitle>
          </div>
          <CardDescription>Community creation and management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Communities per User
              </label>
              <Input
                type="number"
                value={settings.community.maxCommunitiesPerUser}
                onChange={(e) => handleInputChange('community', 'maxCommunitiesPerUser', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Community Privacy
              </label>
              <select
                value={settings.community.defaultCommunityPrivacy}
                onChange={(e) => handleInputChange('community', 'defaultCommunityPrivacy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowCommunityCreation"
                checked={settings.community.allowCommunityCreation}
                onChange={(e) => handleInputChange('community', 'allowCommunityCreation', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="allowCommunityCreation" className="text-sm font-medium text-gray-700">
                Allow Community Creation
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requireCommunityApproval"
                checked={settings.community.requireCommunityApproval}
                onChange={(e) => handleInputChange('community', 'requireCommunityApproval', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="requireCommunityApproval" className="text-sm font-medium text-gray-700">
                Require Community Approval
              </label>
            </div>
          </div>
          <Button onClick={() => handleSave('community')}>
            <Save className="h-4 w-4 mr-2" />
            Save Community Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}