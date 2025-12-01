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
import { Search, Eye, Edit, Trash2, Flag, Heart, MessageCircle, Share } from 'lucide-react';

// Mock data
const posts = [
  {
    id: 1,
    title: 'Introduction to React Hooks',
    content: 'A comprehensive guide to understanding and using React Hooks...',
    author: 'John Doe',
    community: 'Tech Enthusiasts',
    status: 'Published',
    visibility: 'Public',
    createdDate: '2024-01-15',
    likes: 45,
    comments: 12,
    shares: 8,
    reports: 0,
  },
  {
    id: 2,
    title: 'Beautiful Sunset Photography',
    content: 'Captured this amazing sunset yesterday...',
    author: 'Jane Smith',
    community: 'Photography Club',
    status: 'Published',
    visibility: 'Public',
    createdDate: '2024-01-14',
    likes: 123,
    comments: 34,
    shares: 15,
    reports: 0,
  },
  {
    id: 3,
    title: 'Investment Strategy Discussion',
    content: 'Let\'s discuss the best investment strategies for 2024...',
    author: 'Bob Johnson',
    community: 'Private Investors',
    status: 'Published',
    visibility: 'Private',
    createdDate: '2024-01-13',
    likes: 23,
    comments: 7,
    shares: 2,
    reports: 0,
  },
  {
    id: 4,
    title: 'New Game Release Review',
    content: 'Just played the latest AAA game release...',
    author: 'Alice Brown',
    community: 'Gaming Community',
    status: 'Under Review',
    visibility: 'Public',
    createdDate: '2024-01-12',
    likes: 67,
    comments: 23,
    shares: 11,
    reports: 2,
  },
  {
    id: 5,
    title: 'Homemade Pizza Recipe',
    content: 'Here\'s my secret recipe for the perfect homemade pizza...',
    author: 'Charlie Wilson',
    community: 'Cooking Enthusiasts',
    status: 'Published',
    visibility: 'Public',
    createdDate: '2024-01-11',
    likes: 89,
    comments: 18,
    shares: 25,
    reports: 0,
  },
];

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedVisibility, setSelectedVisibility] = useState('All');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || post.status === selectedStatus;
    const matchesVisibility = selectedVisibility === 'All' || post.visibility === selectedVisibility;
    return matchesSearch && matchesStatus && matchesVisibility;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'Under Review':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'Public':
        return <Badge variant="outline">Public</Badge>;
      case 'Private':
        return <Badge className="bg-blue-100 text-blue-800">Private</Badge>;
      default:
        return <Badge variant="secondary">{visibility}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and moderate all platform posts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.status === 'Published').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.status === 'Under Review').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Posts</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posts.filter(p => p.reports > 0).length}
            </div>
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
              <option value="Under Review">Under Review</option>
              <option value="Rejected">Rejected</option>
              <option value="Draft">Draft</option>
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
          <CardTitle>Posts ({filteredPosts.length})</CardTitle>
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
                <TableHead>Reports</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{post.title}</div>
                      <div className="text-sm text-gray-500 truncate">{post.content}</div>
                    </div>
                  </TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{post.community}</TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>{getVisibilityBadge(post.visibility)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        {post.likes}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        {post.comments}
                      </div>
                      <div className="flex items-center">
                        <Share className="h-3 w-3 mr-1" />
                        {post.shares}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.reports > 0 ? (
                      <Badge variant="destructive">{post.reports}</Badge>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell>{post.createdDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
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