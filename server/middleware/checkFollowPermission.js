const { User, Follow } = require('../models/index');

/**
 * Middleware pour vérifier les permissions de suivre/se désabonner d'un utilisateur.
 * Ajoute la cible à req.targetUser et le statut de suivi à req.isFollowing.
 * @access Utilisateur Authentifié
 */
const checkFollowPermission = async (req, res, next) => {
    const followerId = req.user.userId; // L'utilisateur qui initie l'action
    const followingId = req.params.userId; // L'utilisateur cible

    if (!followingId) {
        return res.status(400).json({ success: false, message: "ID utilisateur cible manquant." });
    }

    if (followerId === followingId) {
        return res.status(400).json({ success: false, message: "Erreur: Vous ne pouvez pas vous suivre vous-même." });
    }

    try {
        // 1. Vérifier que l'utilisateur cible existe
        const targetUser = await User.findByPk(followingId, {
            attributes: ['id', 'isDeleted']
        });

        if (!targetUser || targetUser.isDeleted) {
            return res.status(404).json({ success: false, message: "Utilisateur cible non trouvé." });
        }
        
        // Stocker l'utilisateur cible pour le contrôleur
        req.targetUser = targetUser; 

        // 2. Vérifier si la relation de suivi existe déjà
        const existingFollow = await Follow.findOne({
            where: {
                followerId: followerId,
                followingId: followingId
            }
        });

        // Stocker le statut de suivi et l'objet Follow s'il existe
        req.isFollowing = !!existingFollow;
        req.followInstance = existingFollow;

        next();

    } catch (error) {
        console.error("Erreur lors de la vérification des permissions de suivi:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la vérification de permission de suivi.",
            error: error.message
        });
    }
};

module.exports = { checkFollowPermission };