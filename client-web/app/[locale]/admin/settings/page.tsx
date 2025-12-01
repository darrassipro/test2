'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Bell, FileText, Users, Save, RotateCcw, Download, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '@/lib/api/adminApi';
import type { Settings as SettingsType } from '@/lib/api/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  
  const { data, isLoading, error, refetch } = useGetSettingsQuery(undefined);
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const handleSaveSettings = async (section: string) => {
    try {
      setSuccessMessage('');
      await updateSettings({ section, settings: settings[section] }).unwrap();
      setSuccessMessage(`${section} settings saved successfully`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleResetSettings = async () => {
    try {
      setSuccessMessage('');
      refetch();
      setSuccessMessage('Settings reset to defaults successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to reset settings:', error);
    }
  };

  const handleExportSettings = async () => {
    try {
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `platform-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMessage('Settings exported successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to export settings:', error);
    }
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && Object.keys(settings).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{String(error)}</p>
          <Button onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure platform settings and preferences
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleResetSettings} disabled={isSaving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-600">{String(error)}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-600">{successMessage}</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="community">
            <Users className="h-4 w-4 mr-2" />
            Community
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.general?.siteName || ''}
                  onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general?.siteDescription || ''}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.general?.contactEmail || ''}
                  onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.general?.supportEmail || ''}
                  onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.general?.maintenanceMode || false}
                  onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
              <Button onClick={() => handleSaveSettings('general')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Authentication and security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireEmailVerification"
                  checked={settings.security?.requireEmailVerification || false}
                  onCheckedChange={(checked) => updateSetting('security', 'requireEmailVerification', checked)}
                />
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTwoFactor"
                  checked={settings.security?.enableTwoFactor || false}
                  onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                />
                <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="50"
                  value={settings.security?.passwordMinLength || 8}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.security?.sessionTimeout || 30}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security?.maxLoginAttempts || 5}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>
              <Button onClick={() => handleSaveSettings('security')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications?.emailNotifications || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                />
                <Label htmlFor="emailNotifications">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="pushNotifications"
                  checked={settings.notifications?.pushNotifications || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                />
                <Label htmlFor="pushNotifications">Push Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="moderationAlerts"
                  checked={settings.notifications?.moderationAlerts || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'moderationAlerts', checked)}
                />
                <Label htmlFor="moderationAlerts">Moderation Alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="systemAlerts"
                  checked={settings.notifications?.systemAlerts || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                />
                <Label htmlFor="systemAlerts">System Alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="weeklyReports"
                  checked={settings.notifications?.weeklyReports || false}
                  onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
                />
                <Label htmlFor="weeklyReports">Weekly Reports</Label>
              </div>
              <Button onClick={() => handleSaveSettings('notifications')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Settings */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>Content moderation and upload configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoModeration"
                  checked={settings.content?.autoModeration || false}
                  onCheckedChange={(checked) => updateSetting('content', 'autoModeration', checked)}
                />
                <Label htmlFor="autoModeration">Auto Moderation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowFileUploads"
                  checked={settings.content?.allowFileUploads || false}
                  onCheckedChange={(checked) => updateSetting('content', 'allowFileUploads', checked)}
                />
                <Label htmlFor="allowFileUploads">Allow File Uploads</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.content?.maxFileSize || 10}
                  onChange={(e) => updateSetting('content', 'maxFileSize', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.content?.allowedFileTypes || ''}
                  onChange={(e) => updateSetting('content', 'allowedFileTypes', e.target.value)}
                  placeholder="jpg,png,gif,pdf,doc,docx"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requirePostApproval"
                  checked={settings.content?.requirePostApproval || false}
                  onCheckedChange={(checked) => updateSetting('content', 'requirePostApproval', checked)}
                />
                <Label htmlFor="requirePostApproval">Require Post Approval</Label>
              </div>
              <Button onClick={() => handleSaveSettings('content')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Content Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Settings */}
        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle>Community Settings</CardTitle>
              <CardDescription>Community creation and management settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="allowCommunityCreation"
                  checked={settings.community?.allowCommunityCreation || false}
                  onCheckedChange={(checked) => updateSetting('community', 'allowCommunityCreation', checked)}
                />
                <Label htmlFor="allowCommunityCreation">Allow Community Creation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireCommunityApproval"
                  checked={settings.community?.requireCommunityApproval || false}
                  onCheckedChange={(checked) => updateSetting('community', 'requireCommunityApproval', checked)}
                />
                <Label htmlFor="requireCommunityApproval">Require Community Approval</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCommunitiesPerUser">Max Communities Per User</Label>
                <Input
                  id="maxCommunitiesPerUser"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.community?.maxCommunitiesPerUser || 5}
                  onChange={(e) => updateSetting('community', 'maxCommunitiesPerUser', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultCommunityPrivacy">Default Community Privacy</Label>
                <select
                  id="defaultCommunityPrivacy"
                  value={settings.community?.defaultCommunityPrivacy || 'public'}
                  onChange={(e) => updateSetting('community', 'defaultCommunityPrivacy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <Button onClick={() => handleSaveSettings('community')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Community Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
