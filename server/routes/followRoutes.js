const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authEnhanced');
const followController = require('../controllers/followController');
const { checkFollowPermission } = require('../middleware/checkFollowPermission')

/**
 * @description Routes pour la gestion du suivi entre utilisateurs
 */

// POST /api/follow/:userId - Suivre un utilisateur
router.post('/:userId', authenticateToken, checkFollowPermission, followController.followUser);

// DELETE /api/follow/:userId - Se désabonner d'un utilisateur
router.delete('/:userId', authenticateToken, checkFollowPermission, followController.unfollowUser);

// GET /api/follow/:userId/followers - Liste des followers de l'utilisateur :userId
router.get('/:userId/followers', followController.getFollowers);

// GET /api/follow/:userId/following - Liste des abonnements (utilisateurs suivis) par l'utilisateur :userId
router.get('/:userId/following', followController.getFollowing);

// GET /api/follow/status/:userId - Vérifier le statut de suivi entre l'utilisateur courant et :userId
// Utile pour afficher un bouton 'Suivre' ou 'Abonné'
router.get('/status/:userId', authenticateToken, checkFollowPermission, followController.checkFollowStatus);

module.exports = router;