'use client';

import { useState, useEffect } from 'react';
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
import { CheckCircle, XCircle, AlertTriangle, Ban, MessageSquare, Shield, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { adminService, Report } from '@/lib/services/adminService';
import { handleApiError } from '@/lib/api';

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    fetchReports();
  }, [selectedStatus, selectedSeverity, selectedType]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params: any = {};
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedSeverity !== 'All') params.severity = selectedSeverity;
      if (selectedType !== 'All') params.type = selectedType;

      const response = await adminService.getReports(params);
      
      if (response.success && response.data) {
        setReports(response.data.reports);
        setStats(response.data.stats);
      } else {
        setError(response.message || 'Failed to fetch reports');
      }
    } catch (error: any) {
      setError(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportAction = async (action: string, reportId: number, additionalData?: any) => {
    try {
      setIsActionLoading(reportId);
      let response;

      switch (action) {
        case 'approve':
          response = await adminService.approveReport(reportId);
          break;
        case 'reject':
          const report = reports.find(r => r.id === reportId);
          if (report) {
            response = await adminService.rejectReport(
              reportId, 
              report.contentId, 
              report.type, 
              additionalData?.reason
            );
          }
          break;
        case 'ban_user':
          response = await adminService.banUserFromReport(
            reportId, 
            additionalData?.userId, 
            additionalData?.reason
          );
          break;
        case 'warn_user':
          response = await adminService.warnUser(
            reportId, 
            additionalData?.userId, 
            additionalData?.message
          );
          break;
        case 'dismiss':
          response = await adminService.dismissReport(reportId);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response.success) {
        // Refresh the reports list
        await fetchReports();
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
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Post':
        return <Shield className="h-4 w-4" />;
      case 'Comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'User Profile':
        return <Ban className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading moderation reports...</p>
        </div>
      </div>
    );
  }

  if (error && reports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchReports}>
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
          <h1 className="text-2xl font-bold text-gray-900">Moderation</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage reported content and user violations
          </p>
        </div>
        <Button onClick={fetchReports} disabled={isLoading}>
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
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.underReview || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Reports</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved || 0}</div>
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
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Post">Post</option>
              <option value="Comment">Comment</option>
              <option value="User Profile">User Profile</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({reports.length})</CardTitle>
          <CardDescription>
            Content and user reports requiring moderation review
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
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(report.type)}
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{report.title}</div>
                        <div className="text-sm text-gray-500">{report.community}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.author}</TableCell>
                  <TableCell>{report.reportedBy}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleReportAction('approve', report.id)}
                        disabled={isActionLoading === report.id}
                        title="Approve (content is not violating)"
                      >
                        {isActionLoading === report.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleReportAction('reject', report.id, { reason: 'Content violates guidelines' })}
                        disabled={isActionLoading === report.id}
                        title="Reject (take action on content)"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleReportAction('ban_user', report.id, { userId: 1, reason: 'Policy violation' })}
                        disabled={isActionLoading === report.id}
                        title="Ban user"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleReportAction('warn_user', report.id, { userId: 1, message: 'Warning for policy violation' })}
                        disabled={isActionLoading === report.id}
                        title="Warn user"
                      >
                        <AlertTriangle className="h-4 w-4" />
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