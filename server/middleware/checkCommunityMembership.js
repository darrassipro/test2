const { Community, CommunityMembership } = require('../models/index');

/**
 * Middleware pour vérifier si l'utilisateur est membre d'une communauté et ajouter le résultat à req.
 * Il vérifie également si la communauté existe.
 * @access Utilisateur Authentifié
 */
const checkCommunityMembership = async (req, res, next) => {
    const communityId = req.params.id;
    const userId = req.user.userId; 

    if (!communityId) {
        return res.status(400).json({ success: false, message: "ID de la communauté manquant." });
    }
    
    try {
        const community = await Community.findOne({
            where: { 
                id: communityId, 
                isDeleted: false 
            }
        });
        if (!community) {
            return res.status(404).json({ success: false, message: "Communauté non trouvée." });
        }
        
        req.community = community; 

        const isMember = await CommunityMembership.findOne({
            where: { communityId, userId }
        });

        req.isUserMemberShip = !!isMember; 
        next();

    } catch (error) {
        console.error("Erreur lors de la vérification de l'adhésion à la communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la vérification de l'adhésion.",
            error: error.message
        });
    }
};

module.exports = { checkCommunityMembership };