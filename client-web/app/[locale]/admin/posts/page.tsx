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
import { Search, Edit, Trash2, Eye, EyeOff, CheckCircle, XCircle, TrendingUp, FileText, Heart, MessageCircle, Share, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useGetPostsQuery, useApprovePostMutation, useRejectPostMutation, useDeletePostMutation, useHidePostMutation } from '@/lib/api/postApi';
import type { Post } from '@/lib/api/types';

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedVisibility, setSelectedVisibility] = useState('All');

  const params: any = {};
  if (searchTerm) params.search = searchTerm;
  if (selectedStatus !== 'All') params.status = selectedStatus;
  if (selectedVisibility !== 'All') params.visibility = selectedVisibility;

  const { data, isLoading, error, refetch } = useGetPostsQuery(params);
  const [approvePost] = useApprovePostMutation();
  const [rejectPost] = useRejectPostMutation();
  const [deletePost] = useDeletePostMutation();
  const [hidePost] = useHidePostMutation();

  const posts = data?.posts || [];
  const stats = data?.stats || {};

  const handlePostAction = async (action: string, postId: number, additionalData?: any) => {
    try {
      switch (action) {
        case 'approve':
          await approvePost(postId).unwrap();
          break;
        case 'reject':
          await rejectPost({ postId, reason: additionalData?.reason }).unwrap();
          break;
        case 'hide':
          await hidePost(postId).unwrap();
          break;
        case 'delete':
          await deletePost(postId).unwrap();
          break;
      }
      refetch();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'Draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'Public':
        return <Badge className="bg-blue-100 text-blue-800">Public</Badge>;
      case 'Private':
        return <Badge className="bg-purple-100 text-purple-800">Private</Badge>;
      default:
        return <Badge variant="secondary">{visibility}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{String(error)}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and moderate all platform posts
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{String(error)}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments || 0}</div>
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
                placeholder="Search posts..."
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
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Visibility</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Posts ({posts.length})</CardTitle>
          <CardDescription>
            A list of all posts on your platform including their details and engagement metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Community</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{post.title}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {post.content}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{typeof post.author === 'object' ? (post.author as any)?.name || `${(post.author as any)?.firstName || ''} ${(post.author as any)?.lastName || ''}`.trim() : post.author}</TableCell>
                  <TableCell>{typeof post.community === 'object' ? (post.community as any)?.name : post.community}</TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>{post.visibility ? getVisibilityBadge(post.visibility) : '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {post.likes || post.likesCount || 0}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {post.comments || post.commentsCount || 0}
                      </div>
                      <div className="flex items-center">
                        <Share className="h-3 w-3 mr-1" />
                        {post.shares || 0}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(post.createdDate || post.createdAt || '').toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePostAction('approve', post.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePostAction('hide', post.id)}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePostAction('delete', post.id)}
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