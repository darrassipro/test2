const { Community, Admin, CommunityMembership } = require('../models/index');

/**
 * Fonction utilitaire pour récupérer le rôle d'un utilisateur dans une communauté
 * @param {string} communityId ID de la communauté
 * @param {string} userId ID de l'utilisateur
 * @returns {Promise<string|null>} Le rôle ('owner', 'admin', 'moderator') ou null
 */
const getUserRole = async (communityId, userId) => {
    const adminEntry = await Admin.findOne({
        where: { communityId, userId },
        attributes: ['role']
    });
    if (adminEntry) return adminEntry.role;

    // If the user is the creator of the community, consider them the owner
    const community = await Community.findByPk(communityId, { attributes: ['creatorUserId'] });
    if (community && community.creatorUserId === userId) {
        return 'owner';
    }

    return null;
};

/**
 * Middleware pour vérifier si l'utilisateur a un rôle d'administrateur spécifié ou supérieur
 * @param {string} requiredRole Le rôle minimum requis ('owner', 'admin', 'moderator')
 * @returns {Function} Middleware Express
 */
const checkAdminRole = (requiredRole) => {
    
    // Définir la hiérarchie pour la vérification
    const roleHierarchy = {
        'owner': 3,
        'admin': 2,
        'moderator': 1
    };

    return async (req, res, next) => {
        const communityId = req.params.communityId || req.params.id; // Récupérer l'ID de la communauté
        const userId = req.user.userId;

        if (!communityId) {
            return res.status(400).json({ success: false, message: "ID de la communauté manquant." });
        }

        try {
            // 1. Vérifier si la communauté existe
            const community = await Community.findByPk(communityId);
            if (!community) {
                return res.status(404).json({ success: false, message: "Communauté non trouvée." });
            }
            req.community = community; // Stocker la communauté pour le contrôleur

            // 2. Vérifier le rôle de l'utilisateur
            const userRole = await getUserRole(communityId, userId);
            
            // Stocker le rôle de l'utilisateur pour le contrôleur
            req.userRole = userRole; 

            if (!userRole) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Accès refusé. L'utilisateur n'est pas un administrateur de cette communauté." 
                });
            }

            // 3. Vérifier le niveau du rôle requis
            if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Accès refusé. Rôle minimum requis: ${requiredRole}. Votre rôle actuel: ${userRole}.` 
                });
            }

            next();

        } catch (error) {
            console.error("Erreur lors de la vérification du rôle d'administrateur:", error);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur lors de la vérification de l'administration.",
                error: error.message
            });
        }
    };
};

module.exports = { checkAdminRole, getUserRole };