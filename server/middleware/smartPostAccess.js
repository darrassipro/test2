const { Community, CommunityMembership } = require('../models');

exports.checkPostAccess = async (req, res, next) => {
    // On vérifie si l’on se trouve dans Home ou dans Community
    // // Le frontend peut envoyer soit ?source=home soit ?communityId=...
    const isHome = req.query.source === 'home'; 
    const communityId = req.query.communityId || req.params.id;
    const userId = req.user ? req.user.userId : null;

    // CAS 1 : PAGE D’ACCUEIL (pas besoin de vérifier l’adhésion pour l’instant)
    if (isHome) {
        req.context = { type: 'HOME' };
        return next();
    }

    // CAS 2: COMMUNITY PAGE
    if (!communityId) {
        // Si aucune communauté n’est spécifiée et qu’il n’a pas indiqué "home",
        // on considère que c’est "home" par défaut ou on retourne une erreur.
        req.context = { type: 'HOME' };
        return next();
    }

    try {
        // 1. Récupérer la communauté
        const community = await Community.findOne({ 
            where: { id: communityId, isDeleted: false } 
        });

        if (!community) {
            return res.status(404).json({ message: "Communauté introuvable" });
        }

        // 2. Vérifier si l’utilisateur est membre
        let isMember = false;
        if (userId) {
            // Est-ce qu’il est le créateur ?
            if (community.creatorUserId === userId) {
                isMember = true;
            } else {
                // Est-il présent dans la table des adhésions ?
                const membership = await CommunityMembership.findOne({
                    where: { communityId, userId }
                });
                isMember = !!membership;
            }
        }

        // On stocke les informations dans req pour que le Controller puisse les utiliser
        req.context = {
            type: 'COMMUNITY',
            communityId: community.id,
            isMember: isMember,
            isPremium: community.isPremium
        };

        next();

    } catch (error) {
        console.error("Erreur middleware access:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};