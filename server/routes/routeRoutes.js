const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authEnhanced'); 
const { checkRouteAccess } = require('../middleware/checkRouteAccess'); 
const routeController = require('../controllers/routeController'); 

// 1. Créer un trajet (POST /api/routes)
router.post(
    '/',
    authenticateToken,
    checkRouteAccess('create'), // Vérifie que l'utilisateur est le créateur de la communauté
    routeController.createRoute
);

// 2. Obtenir les trajets d’une communauté (GET /api/routes/communities/:communityId)
router.get(
    '/communities/:communityId', 
    authenticateToken,
    routeController.getRoutesByCommunity
);

// 3. Obtenir un trajet par ID (GET /api/routes/:id)
router.get(
    '/:id', 
    authenticateToken,
    routeController.getRouteById
);

// 4. Mettre à jour un trajet (PATCH /api/routes/:id)
// Nous utilisons :id pour le routeId et :communityId pour la vérification d'accès
router.patch(
    '/:communityId/:id', 
    authenticateToken,
    checkRouteAccess('manage'), // Vérifie que l'utilisateur est le créateur de la communauté
    routeController.updateRoute
);

// 5. Supprimer un trajet (DELETE /api/routes/:id)
router.delete(
    '/:communityId/:id', 
    authenticateToken,
    checkRouteAccess('manage'), 
    routeController.deleteRoute
);

// 6. Ajouter un point visité (POST /api/routes/:id/traces)
router.post(
    '/:communityId/:id/traces', 
    authenticateToken,
    checkRouteAccess('manage'), 
    routeController.addVisitedTrace
);

// 7. Obtenir tous les points d’un trajet (GET /api/routes/:id/traces)
router.get(
    '/:id/traces', 
    authenticateToken,
    routeController.getRouteTrace
);

// 8. Terminer un trajet (POST /api/routes/:id/end)
router.post(
    '/:id/end', 
    authenticateToken,
    routeController.endRoute 
);


module.exports = router;