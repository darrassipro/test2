import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp, TrendingDown, Users, FileText, Building2, Activity } from 'lucide-react';

const analyticsData = {
  overview: [
    {
      title: 'Total Users',
      value: '12,345',
      change: '+12%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Active Users (30d)',
      value: '8,234',
      change: '+8%',
      trend: 'up',
      icon: Activity,
    },
    {
      title: 'Total Posts',
      value: '45,678',
      change: '+15%',
      trend: 'up',
      icon: FileText,
    },
    {
      title: 'Total Communities',
      value: '1,234',
      change: '+5%',
      trend: 'up',
      icon: Building2,
    },
  ],
  topCommunities: [
    { name: 'Tech Enthusiasts', members: 2100, posts: 567, engagement: '85%' },
    { name: 'Photography Club', members: 1890, posts: 423, engagement: '78%' },
    { name: 'Gaming Community', members: 1650, posts: 389, engagement: '82%' },
    { name: 'Cooking Enthusiasts', members: 1420, posts: 312, engagement: '76%' },
    { name: 'Fitness & Health', members: 1200, posts: 298, engagement: '73%' },
  ],
  topUsers: [
    { name: 'John Doe', posts: 45, likes: 1234, communities: 8 },
    { name: 'Jane Smith', posts: 38, likes: 987, communities: 6 },
    { name: 'Bob Johnson', posts: 32, likes: 876, communities: 5 },
    { name: 'Alice Brown', posts: 29, likes: 765, communities: 7 },
    { name: 'Charlie Wilson', posts: 25, likes: 654, communities: 4 },
  ],
  recentActivity: [
    { action: 'New user registration', user: 'Mike Davis', time: '2 minutes ago' },
    { action: 'Community created', user: 'Sarah Johnson', time: '15 minutes ago' },
    { action: 'Post published', user: 'Tom Wilson', time: '23 minutes ago' },
    { action: 'User reported content', user: 'Lisa Brown', time: '1 hour ago' },
    { action: 'Community joined', user: 'David Lee', time: '2 hours ago' },
  ],
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform insights and performance metrics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsData.overview.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change} from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* User Growth Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly user registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart placeholder - User Growth</p>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement Metrics</CardTitle>
            <CardDescription>Posts, likes, and comments over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart placeholder - Engagement</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Communities */}
        <Card>
          <CardHeader>
            <CardTitle>Top Communities</CardTitle>
            <CardDescription>Most active communities by engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Community</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Engagement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.topCommunities.map((community, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{community.name}</TableCell>
                    <TableCell>{community.members.toLocaleString()}</TableCell>
                    <TableCell>{community.posts}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{community.engagement}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>Most active users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Communities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.topUsers.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.posts}</TableCell>
                    <TableCell>{user.likes.toLocaleString()}</TableCell>
                    <TableCell>{user.communities}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">by {activity.user}</p>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}