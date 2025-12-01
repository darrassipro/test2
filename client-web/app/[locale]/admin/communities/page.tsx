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
import { Search, Plus, Edit, Trash2, Users, FileText, Eye } from 'lucide-react';

// Mock data
const communities = [
  {
    id: 1,
    name: 'Tech Enthusiasts',
    description: 'A community for technology lovers',
    creator: 'John Doe',
    members: 1250,
    posts: 342,
    status: 'Active',
    privacy: 'Public',
    createdDate: '2024-01-15',
    category: 'Technology',
  },
  {
    id: 2,
    name: 'Photography Club',
    description: 'Share and discuss photography',
    creator: 'Jane Smith',
    members: 890,
    posts: 156,
    status: 'Active',
    privacy: 'Public',
    createdDate: '2024-01-10',
    category: 'Arts',
  },
  {
    id: 3,
    name: 'Private Investors',
    description: 'Investment discussions and tips',
    creator: 'Bob Johnson',
    members: 45,
    posts: 23,
    status: 'Active',
    privacy: 'Private',
    createdDate: '2024-01-20',
    category: 'Finance',
  },
  {
    id: 4,
    name: 'Gaming Community',
    description: 'All things gaming related',
    creator: 'Alice Brown',
    members: 2100,
    posts: 567,
    status: 'Active',
    privacy: 'Public',
    createdDate: '2023-12-01',
    category: 'Gaming',
  },
  {
    id: 5,
    name: 'Cooking Enthusiasts',
    description: 'Share recipes and cooking tips',
    creator: 'Charlie Wilson',
    members: 678,
    posts: 234,
    status: 'Under Review',
    privacy: 'Public',
    createdDate: '2024-02-01',
    category: 'Food',
  },
];

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPrivacy, setSelectedPrivacy] = useState('All');

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || community.status === selectedStatus;
    const matchesPrivacy = selectedPrivacy === 'All' || community.privacy === selectedPrivacy;
    return matchesSearch && matchesStatus && matchesPrivacy;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Under Review':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      case 'Suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPrivacyBadge = (privacy: string) => {
    switch (privacy) {
      case 'Public':
        return <Badge variant="outline">Public</Badge>;
      case 'Private':
        return <Badge className="bg-blue-100 text-blue-800">Private</Badge>;
      default:
        return <Badge variant="secondary">{privacy}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communities</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor all platform communities
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Communities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {communities.filter(c => c.status === 'Active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {communities.reduce((sum, c) => sum + c.members, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {communities.reduce((sum, c) => sum + c.posts, 0).toLocaleString()}
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
              <option value="Under Review">Under Review</option>
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
          <CardTitle>Communities ({filteredCommunities.length})</CardTitle>
          <CardDescription>
            A list of all communities on your platform including their details and statistics.
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
              {filteredCommunities.map((community) => (
                <TableRow key={community.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{community.name}</div>
                      <div className="text-sm text-gray-500">{community.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{community.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>{community.creator}</TableCell>
                  <TableCell>{community.members.toLocaleString()}</TableCell>
                  <TableCell>{community.posts}</TableCell>
                  <TableCell>{getStatusBadge(community.status)}</TableCell>
                  <TableCell>{getPrivacyBadge(community.privacy)}</TableCell>
                  <TableCell>{community.createdDate}</TableCell>
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