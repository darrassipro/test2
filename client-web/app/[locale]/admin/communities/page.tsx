'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Trash2, Loader2, AlertCircle, RefreshCw, Building2, Users, FileText } from 'lucide-react';
import { useGetCommunitiesQuery, useDeleteCommunityMutation } from '@/lib/api/communityApi';
import type { Community } from '@/lib/api/types';

export default function CommunitiesPage() {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPrivacy, setSelectedPrivacy] = useState('All');

  const { data, isLoading, error, refetch } = useGetCommunitiesQuery({});
  const [deleteCommunity] = useDeleteCommunityMutation();

  const communities = data?.communities || [];
  const stats = data?.stats || { total: 0, active: 0, suspended: 0 };

  const handleCommunityAction = async (action: string, communityId: string) => {
    try {
      setIsActionLoading(communityId);

      if (action === 'delete') {
        await deleteCommunity(communityId).unwrap();
        refetch();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'Suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPrivacyBadge = (privacy: string) => {
    switch (privacy) {
      case 'Public':
        return <Badge className="bg-blue-100 text-blue-800">Public</Badge>;
      case 'Private':
        return <Badge className="bg-purple-100 text-purple-800">Private</Badge>;
      default:
        return <Badge variant="secondary">{privacy}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load communities</p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
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
          <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all platform communities
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Failed to load communities</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Communities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            <select
              value={selectedPrivacy}
              onChange={(e) => setSelectedPrivacy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Privacy</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Communities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Communities ({communities.length})</CardTitle>
          <CardDescription>
            A list of all communities on your platform including their details and activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Community</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Privacy</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map((community) => (
                <TableRow key={community.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{community.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {community.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{community.creatorUserId}</TableCell>
                  <TableCell>{(community.totalMembers || 0).toLocaleString()}</TableCell>
                  <TableCell>{(community.totalPosts || 0).toLocaleString()}</TableCell>
                  <TableCell>{community.isVerified ? <Badge className="bg-green-100 text-green-800">Verified</Badge> : <Badge variant="secondary">Unverified</Badge>}</TableCell>
                  <TableCell>{community.isPrivate ? <Badge className="bg-purple-100 text-purple-800">Private</Badge> : <Badge className="bg-blue-100 text-blue-800">Public</Badge>}</TableCell>
                  <TableCell>{new Date(community.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCommunityAction('delete', community.id)}
                        disabled={isActionLoading === community.id}
                      >
                        {isActionLoading === community.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}