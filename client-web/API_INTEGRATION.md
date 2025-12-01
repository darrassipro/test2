# Admin Panel API Integration

This document describes the API integration for the admin panel, connecting the Next.js frontend with the Express.js backend.

## Overview

The admin panel has been updated to use real API endpoints instead of mock data. The integration includes:

- **Authentication**: Real admin login with JWT tokens
- **Dashboard**: Live statistics from backend data
- **User Management**: CRUD operations for users
- **Community Management**: CRUD operations for communities
- **Post Management**: CRUD operations for posts
- **Analytics**: Real-time analytics data
- **Moderation**: Content moderation system
- **Settings**: Platform configuration management

## Architecture

### API Routes Structure
```
/app/api/
├── auth/
│   └── admin/route.ts          # Admin authentication
└── admin/
    ├── dashboard/route.ts      # Dashboard statistics
    ├── users/route.ts          # User management
    ├── communities/route.ts    # Community management
    ├── posts/route.ts          # Post management
    ├── analytics/route.ts      # Analytics data
    ├── moderation/route.ts     # Content moderation
    └── settings/route.ts       # Platform settings
```

### Service Layer
```
/lib/services/
└── adminService.ts             # API service methods
```

### Configuration
```
/lib/
├── config.ts                   # API configuration
└── api.ts                      # API client utilities
```

## API Endpoints

### Authentication
- `POST /api/auth/admin` - Admin login
- `DELETE /api/auth/admin` - Admin logout

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics

### User Management
- `GET /api/admin/users` - List users with filters
- `POST /api/admin/users` - User actions (ban, unban, delete, update role)

### Community Management
- `GET /api/admin/communities` - List communities with filters
- `POST /api/admin/communities` - Community actions (suspend, activate, delete)

### Post Management
- `GET /api/admin/posts` - List posts with filters
- `POST /api/admin/posts` - Post actions (approve, reject, hide, boost, delete)

### Analytics
- `GET /api/admin/analytics` - Get analytics data with time range filters

### Moderation
- `GET /api/admin/moderation` - List reported content
- `POST /api/admin/moderation` - Moderation actions (approve, reject, ban user, warn)

### Settings
- `GET /api/admin/settings` - Get platform settings
- `POST /api/admin/settings` - Update settings by section
- `PUT /api/admin/settings` - Reset settings or export

## Backend Integration

The Next.js API routes act as a proxy layer between the frontend and the Express.js backend:

1. **Frontend** → Next.js API Routes → **Express.js Backend**
2. Authentication tokens are passed through to the backend
3. Data is transformed and validated before sending to frontend
4. Error handling and response formatting is standardized

## Environment Configuration

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NODE_ENV=development
```

## Authentication Flow

1. User enters credentials in admin login form
2. Frontend calls `/api/auth/admin` with credentials
3. Next.js API route calls backend `/auth/login`
4. Backend validates credentials and returns JWT token
5. Token is stored in localStorage and used for subsequent requests
6. All admin API calls include `Authorization: Bearer <token>` header

## Error Handling

- Network errors are caught and displayed to users
- API errors include proper HTTP status codes
- Loading states are shown during API calls
- Retry functionality is available for failed requests

## Data Flow

### Dashboard Example
1. Dashboard component calls `adminService.getDashboardData()`
2. Service calls `/api/admin/dashboard`
3. API route fetches data from multiple backend endpoints
4. Data is aggregated and transformed
5. Response includes stats, recent users, recent posts, and activity

### User Management Example
1. Users page calls `adminService.getUsers(params)`
2. Service calls `/api/admin/users` with filters
3. API route calls backend `/users` endpoint
4. User data is transformed for admin interface
5. Actions like ban/unban call the same endpoint with action parameters

## Testing

Run the API test script:
```bash
node scripts/test-api.js
```

This will test:
- Admin authentication
- Dashboard API
- Users API
- Communities API

## Security

- All admin routes require authentication
- JWT tokens are validated on each request
- Admin role verification is performed
- Sensitive operations require proper authorization
- CORS is configured for frontend-backend communication

## Features Implemented

### ✅ Completed
- [x] Admin authentication with real backend
- [x] Dashboard with live statistics
- [x] User management (list, ban, unban, delete, role updates)
- [x] Community management (list, suspend, activate, delete)
- [x] Post management (list, approve, reject, hide, boost, delete)
- [x] Analytics with real data and charts
- [x] Moderation system with report handling
- [x] Settings management with validation
- [x] Loading states and error handling
- [x] Responsive design and proper UI feedback

### 🔄 Backend Dependencies
The following features depend on backend implementation:
- Real-time notifications
- Advanced analytics calculations
- File upload handling
- Email notifications
- Two-factor authentication
- Advanced search and filtering

## Next Steps

1. **Backend Integration**: Ensure backend APIs match the expected interface
2. **Testing**: Test with real backend server running
3. **Error Handling**: Implement more specific error messages
4. **Performance**: Add caching and pagination for large datasets
5. **Security**: Implement rate limiting and additional security measures
6. **Monitoring**: Add logging and monitoring for API calls

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend URL
2. **Authentication Failures**: Check JWT token format and expiration
3. **API Timeouts**: Verify backend server is running and accessible
4. **Data Format Mismatches**: Check backend response format matches expected interface

### Debug Mode

Set `NODE_ENV=development` to enable:
- Detailed error logging
- API request/response logging
- Development-specific error messages