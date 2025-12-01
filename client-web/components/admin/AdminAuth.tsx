'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Loader2 } from 'lucide-react';
import { adminService } from '@/lib/services/adminService';
import { handleApiError } from '@/lib/api';

interface AdminAuthProps {
  children: React.ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    const adminToken = localStorage.getItem('authToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (adminToken && adminUser) {
      try {
        const user = JSON.parse(adminUser);
        // Verify the user has admin privileges
        if (user.role === 'admin' || user.role === 'super_admin' || user.isAdmin) {
          setIsAuthenticated(true);
        } else {
          // Clear invalid admin session
          localStorage.removeItem('authToken');
          localStorage.removeItem('adminUser');
        }
      } catch (error) {
        // Clear corrupted session data
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await adminService.login(credentials.username, credentials.password);
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store authentication data
        localStorage.setItem('authToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        setIsAuthenticated(true);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error: any) {
      setError(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminService.logout();
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminUser');
      setIsAuthenticated(false);
      setCredentials({ username: '', password: '' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>
              Please sign in to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
              <strong>Note:</strong><br />
              Use your admin credentials to access the admin panel.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add logout button to the authenticated admin interface
  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {children}
    </div>
  );
}