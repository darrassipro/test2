const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authEnhanced'); 
const adminController = require('../controllers/adminController'); 
const { checkAdminRole } = require('../middleware/checkAdminRole');
const { checkPlatformAdmin } = require('../middleware/checkPlatformAdmin');

// Platform-level admin routes
// GET /api/admin/dashboard
// Get platform dashboard statistics
router.get(
    '/dashboard',
    authenticateToken,
    checkPlatformAdmin,
    adminController.getDashboard
);

// GET /api/admin/analytics
// Get platform analytics data
router.get(
    '/analytics',
    authenticateToken,
    checkPlatformAdmin,
    adminController.getAnalytics
);

// GET /api/admin/reports
// Get content reports
router.get(
    '/reports',
    authenticateToken,
    checkPlatformAdmin,
    adminController.getReports
);

// PATCH /api/admin/reports/:reportId/approve
// Approve a report
router.patch(
    '/reports/:reportId/approve',
    authenticateToken,
    checkPlatformAdmin,
    adminController.approveReport
);

// PATCH /api/admin/reports/:reportId/reject
// Reject a report
router.patch(
    '/reports/:reportId/reject',
    authenticateToken,
    checkPlatformAdmin,
    adminController.rejectReport
);

// PATCH /api/admin/reports/:reportId/dismiss
// Dismiss a report
router.patch(
    '/reports/:reportId/dismiss',
    authenticateToken,
    checkPlatformAdmin,
    adminController.dismissReport
);

// GET /api/admin/settings
// Get platform settings
router.get(
    '/settings',
    authenticateToken,
    checkPlatformAdmin,
    adminController.getSettings
);

// PATCH /api/admin/settings
// Update platform settings
router.patch(
    '/settings',
    authenticateToken,
    checkPlatformAdmin,
    adminController.updateSettings
);

// GET /api/admin/creators
// Get all creators/users with pagination and filters
router.get(
    '/creators',
    authenticateToken,
    checkPlatformAdmin,
    adminController.getCreators
);

// PATCH /api/admin/users/:userId/status
// Update user status (activate/suspend)
router.patch(
    '/users/:userId/status',
    authenticateToken,
    checkPlatformAdmin,
    adminController.updateUserStatus
);

// Community-level admin routes
// POST /api/admin/communities/:communityId/admins
// Ajouter un administrateur (Nécessite au moins le rôle 'admin')
router.post(
    '/communities/:communityId/admins', 
    authenticateToken, 
    checkAdminRole('admin'), 
    adminController.addAdmin
);

// DELETE /api/admin/communities/:communityId/admins/:userId
// Retirer un administrateur (Nécessite au moins le rôle 'admin')
router.delete(
    '/communities/:communityId/admins/:userId', 
    authenticateToken, 
    checkAdminRole('admin'), 
    adminController.removeAdmin
);

// PATCH /api/admin/communities/:communityId/admins/:userId/role
// Modifier le rôle d'un administrateur (Nécessite au moins le rôle 'admin')
router.patch(
    '/communities/:communityId/admins/:userId/role', 
    authenticateToken, 
    checkAdminRole('admin'), 
    adminController.updateAdminRole
);


// GET /api/admin/communities/:communityId/admins
// Obtenir la liste des administrateurs 
router.get(
    '/communities/:communityId/admins', authenticateToken,
    adminController.getCommunityAdmins
);

// GET /api/admin/communities/:communityId/check/:userId
// Vérifier le statut d'administrateur et le rôle d'un utilisateur 
router.get(
    '/communities/:communityId/check/:userId', authenticateToken,
    adminController.checkAdminStatus
);

module.exports = router;