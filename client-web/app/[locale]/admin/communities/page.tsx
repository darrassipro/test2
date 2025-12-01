'use client';

import { useState, useEffect } from 'react';
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
import { Search, Edit, Trash2, Pause, Play, Building2, Users, FileText, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { adminService, Community } from '@/lib/services/adminService';
import { handleApiError } from '@/lib/api';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPrivacy, setSelectedPrivacy] = useState('All');

  useEffect(() => {
    fetchCommunities();
  }, [searchTerm, selectedStatus, selectedPrivacy]);

  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedPrivacy !== 'All') params.privacy = selectedPrivacy;

      const response = await adminService.getCommunities(params);
      
      if (response.success && response.data) {
        setCommunities(response.data.communities);
        setStats(response.data.stats);
      } else {
        setError(response.message || 'Failed to fetch communities');
      }
    } catch (error: any) {
      setError(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunityAction = async (action: string, communityId: number, additionalData?: any) => {
    try {
      setIsActionLoading(communityId);
      let response;

      switch (action) {
        case 'suspend':
          response = await adminService.suspendCommunity(communityId, additionalData?.reason);
          break;
        case 'activate':
          response = await adminService.activateCommunity(communityId);
          break;
        case 'update_privacy':
          response = await adminService.updateCommunityPrivacy(communityId, additionalData?.isPrivate);
          break;
        case 'delete':
          response = await adminService.deleteCommunity(communityId);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response.success) {
        // Refresh the communities list
        await fetchCommunities();
      } else {
        setError(response.message || 'Action failed');
      }
    } catch (error: any) {
      setError(handleApiError(error));
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

  if (error && communities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchCommunities}>
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
        <Button onClick={fetchCommunities} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
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
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        {community.image ? (
                          <img
                            src={community.image}
                            alt={community.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <Building2 className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{community.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {community.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{community.creator}</TableCell>
                  <TableCell>{community.members.toLocaleString()}</TableCell>
                  <TableCell>{community.posts.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(community.status)}</TableCell>
                  <TableCell>{getPrivacyBadge(community.privacy)}</TableCell>
                  <TableCell>{new Date(community.createdDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={isActionLoading === community.id}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCommunityAction(
                          community.status === 'Active' ? 'suspend' : 'activate', 
                          community.id,
                          { reason: 'Admin action' }
                        )}
                        disabled={isActionLoading === community.id}
                      >
                        {isActionLoading === community.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : community.status === 'Active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCommunityAction('delete', community.id)}
                        disabled={isActionLoading === community.id}
                      >
                        <Trash2 className="h-4 w-4" />
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