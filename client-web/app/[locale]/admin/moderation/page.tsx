'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Flag, CheckCircle, XCircle, Eye, AlertTriangle, Clock } from 'lucide-react';

// Mock data for reported content
const reportedContent = [
  {
    id: 1,
    type: 'Post',
    title: 'Inappropriate content example',
    author: 'User123',
    community: 'Tech Enthusiasts',
    reportedBy: 'ModeratorUser',
    reason: 'Spam',
    status: 'Pending',
    reportDate: '2024-01-15',
    severity: 'Medium',
  },
  {
    id: 2,
    type: 'Comment',
    title: 'Offensive language in comment',
    author: 'BadUser456',
    community: 'Photography Club',
    reportedBy: 'CommunityMember',
    reason: 'Harassment',
    status: 'Under Review',
    reportDate: '2024-01-14',
    severity: 'High',
  },
  {
    id: 3,
    type: 'Post',
    title: 'Misleading information post',
    author: 'FakeNews789',
    community: 'Gaming Community',
    reportedBy: 'TrustedUser',
    reason: 'Misinformation',
    status: 'Resolved',
    reportDate: '2024-01-13',
    severity: 'High',
  },
  {
    id: 4,
    type: 'User Profile',
    title: 'Fake profile with stolen images',
    author: 'FakeProfile',
    community: 'N/A',
    reportedBy: 'VerifiedUser',
    reason: 'Identity Theft',
    status: 'Pending',
    reportDate: '2024-01-12',
    severity: 'Critical',
  },
  {
    id: 5,
    type: 'Comment',
    title: 'Promotional spam comment',
    author: 'SpamBot',
    community: 'Cooking Enthusiasts',
    reportedBy: 'ActiveMember',
    reason: 'Spam',
    status: 'Resolved',
    reportDate: '2024-01-11',
    severity: 'Low',
  },
];

const moderationStats = [
  {
    title: 'Pending Reports',
    value: reportedContent.filter(r => r.status === 'Pending').length,
    icon: Clock,
    color: 'text-yellow-600',
  },
  {
    title: 'Under Review',
    value: reportedContent.filter(r => r.status === 'Under Review').length,
    icon: Eye,
    color: 'text-blue-600',
  },
  {
    title: 'Resolved Today',
    value: reportedContent.filter(r => r.status === 'Resolved').length,
    icon: CheckCircle,
    color: 'text-green-600',
  },
  {
    title: 'Critical Reports',
    value: reportedContent.filter(r => r.severity === 'Critical').length,
    icon: AlertTriangle,
    color: 'text-red-600',
  },
];

export default function ModerationPage() {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const filteredReports = reportedContent.filter(report => {
    const matchesStatus = selectedStatus === 'All' || report.status === selectedStatus;
    const matchesSeverity = selectedSeverity === 'All' || report.severity === selectedSeverity;
    return matchesStatus && matchesSeverity;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Under Review':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'Dismissed':
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'High':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'Low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const handleApprove = (id: number) => {
    console.log('Approving report:', id);
  };

  const handleReject = (id: number) => {
    console.log('Rejecting report:', id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage reported content and user violations
        </p>
      </div>

      {/* Moderation Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {moderationStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common moderation tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <Flag className="h-4 w-4 mr-2" />
              Review Reports
            </Button>
            <Button variant="outline" className="justify-start">
              <Eye className="h-4 w-4 mr-2" />
              Audit Content
            </Button>
            <Button variant="outline" className="justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Ban User
            </Button>
            <Button variant="outline" className="justify-start">
              <CheckCircle className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed">Dismissed</option>
            </select>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Severity</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reported Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reported Content ({filteredReports.length})</CardTitle>
          <CardDescription>
            Review and take action on reported content and user violations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{report.title}</div>
                      <div className="text-sm text-gray-500">{report.community}</div>
                    </div>
                  </TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.author}</TableCell>
                  <TableCell>{report.reportedBy}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{report.reportDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => console.log('View content:', report.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {report.status !== 'Resolved' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleApprove(report.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleReject(report.id)}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
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