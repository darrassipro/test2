const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authEnhanced'); 
const adminController = require('../controllers/adminController'); 
const { checkAdminRole } = require('../middleware/checkAdminRole'); 


// POST /api/admin/communities/:communityId/admins
// Ajouter un administrateur (Nécessite au moins le rôle 'admin')
router.post(
    '/:communityId/admins', 
    authenticateToken, 
    checkAdminRole('admin'), 
    adminController.addAdmin
);

// DELETE /api/admin/communities/:communityId/admins/:userId
// Retirer un administrateur (Nécessite au moins le rôle 'admin')
router.delete(
    '/:communityId/admins/:userId', 
    authenticateToken, 
    checkAdminRole('admin'), 
    adminController.removeAdmin
);

// PATCH /api/admin/communities/:communityId/admins/:userId/role
// Modifier le rôle d'un administrateur (Nécessite au moins le rôle 'admin')
router.patch(
    '/:communityId/admins/:userId/role', 
    authenticateToken, 
    checkAdminRole('admin'), 
    adminController.updateAdminRole
);


// GET /api/admin/communities/:communityId/admins
// Obtenir la liste des administrateurs 
router.get(
    '/:communityId/admins', authenticateToken,
    adminController.getCommunityAdmins
);

// GET /api/admin/communities/:communityId/check/:userId
// Vérifier le statut d'administrateur et le rôle d'un utilisateur 
router.get(
    '/:communityId/check/:userId', authenticateToken,
    adminController.checkAdminStatus
);

module.exports = router;