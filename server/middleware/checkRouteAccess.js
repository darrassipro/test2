const { Community, Route, CommunityMembership } = require('../models/index'); 

/**
 * @description Middleware pour vérifier les permissions de gérer les trajets (Routes).
 * Règle : Autorisation pour les Membres (création) ET le Créateur de Communauté / Créateur de Route (gestion).
 * @param {string} mode 'create' ou 'manage'
 * @access Utilisateur Authentifié
 */
const checkRouteAccess = (mode) => {
    return async (req, res, next) => {
        const userId = req.user.userId;
        // On récupère le communityId soit du body (création) soit des params (gestion)
        const communityId = req.params.communityId || req.body.communityId; 
        const routeId = req.params.id; 

        if (!communityId) {
            return res.status(400).json({ 
                success: false,
                message: "ID de la communauté manquant." 
            });
        }

        try {
            // 1. Trouver la communauté pour identifier son créateur et l'appartenance du membre
            const community = await Community.findByPk(communityId, {
                attributes: ['id', 'creatorUserId'],
            });

            if (!community) {
                return res.status(404).json({ 
                    success: false,
                    message: "Communauté non trouvée." 
                });
            }

            const isCommunityCreator = community.creatorUserId === userId; 
            // 2. Vérifier l'appartenance à la communauté via la table de jonction
            const membership = await CommunityMembership.findOne({
                where: { 
                    communityId: communityId,
                    userId: userId
                }
            });
            // L'utilisateur est membre si une entrée existe dans CommunityMembership ou s'il est le créateur
            const isMember = !!membership;
            const isAuthorizedToCreate = isCommunityCreator || isMember;
            req.community = community; // Stocker pour le contrôleur

            // -------------------------------------------------------------
            // --- Logique pour la Création (mode === 'create') ---
            // -------------------------------------------------------------
            if (mode === 'create') {
                if (!isAuthorizedToCreate) {
                    return res.status(403).json({ 
                        success: false,
                        message: "Accès refusé. Seuls les membres de la communauté sont autorisés à créer des trajets." 
                    });
                }
                return next();
            }

            // -------------------------------------------------------------
            // --- Logique pour la Gestion (mode === 'manage') : Modifier/Supprimer/Terminer ---
            // -------------------------------------------------------------
            if (mode === 'manage' && routeId) {
                const route = await Route.findByPk(routeId, {
                    // Nous DEVONS récupérer le creatorUserId du trajet
                    attributes: ['id', 'communityId', 'creatorUserId'] 
                });

                if (!route || route.communityId !== communityId) {
                    return res.status(404).json({ 
                        success: false,
                        message: "Trajet non trouvé dans cette communauté." 
                    });
                }
                
                const isRouteCreator = route.creatorUserId === userId; // L'utilisateur est-il le créateur du trajet ?
                
                req.route = route; 

                // Autorisation pour la Gestion : 
                // 1. Être le créateur de la COMMUNAUTÉ (Admin) OU
                // 2. Être le créateur du TRAJET (Propriétaire)
                if (isCommunityCreator || isRouteCreator) {
                    return next();
                }

                return res.status(403).json({ 
                    success: false,
                    message: "Accès refusé. Seul le créateur de la communauté ou le créateur de ce trajet est autorisé à le gérer." 
                });
            }
            
            // Cas par défaut ou erreur
            return res.status(400).json({ 
                success: false,
                message: "Requête de gestion de trajet mal formée." 
            });


        } catch (error) {
            console.error(`Erreur lors de la vérification des permissions de trajet (${mode}):`, error);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur lors de la vérification des permissions de trajet.",
                error: error.message
            });
        }
    };
};

module.exports = { checkRouteAccess };