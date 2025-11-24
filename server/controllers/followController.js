const { User, Follow } = require('../models/index');

/**
 * @description Suivre un utilisateur.
 * @access Private (Utilisateur Authentifié)
 * @middleware checkFollowPermission (vérifie l'existence de la cible et l'auto-suivi)
 */
exports.followUser = async (req, res) => {
    const followerId = req.user.userId;
    const followingId = req.params.userId; // Cible
    
    // Le statut isFollowing est fourni par checkFollowPermission
    const isFollowing = req.isFollowing; 

    if (isFollowing) {
        return res.status(409).json({ success: false, message: "Vous suivez déjà cet utilisateur." });
    }

    try {
        // Créer la relation Follow
        await Follow.create({
            followerId: followerId,
            followingId: followingId
        });
        
        // 1. Incrémenter totalFollowers de l'utilisateur suivi (followingId)
        await User.increment('totalFollowers', { by: 1, where: { id: followingId } });
        
        // 2. Incrémenter totalFollowing de l'utilisateur qui suit (followerId)
        await User.increment('totalFollowing', { by: 1, where: { id: followerId } });


        return res.status(201).json({
            success: true,
            message: `Vous suivez maintenant l'utilisateur ${followingId}.`
        });

    } catch (error) {
        console.error("Erreur lors de l'action de suivi:", error);
        return res.status(500).json({
            success: false,
            message: "Échec du suivi de l'utilisateur.",
            error: error.message
        });
    }
};


/**
 * @description Se désabonner d'un utilisateur.
 * @access Private (Utilisateur Authentifié)
 * @middleware checkFollowPermission
 */
exports.unfollowUser = async (req, res) => {
    const followerId = req.user.userId;
    const followingId = req.params.userId;
    
    const isFollowing = req.isFollowing; 
    const followInstance = req.followInstance; // Instance de Follow fournie par le middleware

    if (!isFollowing) {
        return res.status(409).json({ success: false, message: "Vous ne suivez pas cet utilisateur." });
    }

    try {
        // Supprimer la relation Follow
        await followInstance.destroy();

        // 1. Décrémenter totalFollowers de l'utilisateur suivi (followingId)
        await User.decrement('totalFollowers', { by: 1, where: { id: followingId } });
        
        // 2. Décrémenter totalFollowing de l'utilisateur qui suit (followerId)
        await User.decrement('totalFollowing', { by: 1, where: { id: followerId } });

        return res.status(200).json({
            success: true,
            message: `Vous vous êtes désabonné de l'utilisateur ${followingId}.`
        });

    } catch (error) {
        console.error("Erreur lors de l'action de désabonnement:", error);
        return res.status(500).json({
            success: false,
            message: "Échec du désabonnement.",
            error: error.message
        });
    }
};


/**
 * @description Obtenir la liste des followers d'un utilisateur donné (avec pagination).
 * @access Public (ou Private si nécessaire)
 */
exports.getFollowers = async (req, res) => {
    const targetUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const { count, rows: followersList } = await Follow.findAndCountAll({
            where: { followingId: targetUserId },
            limit: limit,
            offset: offset,
            include: [
                {
                    model: User,
                    as: 'follower', 
                    attributes: ['id', 'firstName', 'lastName', 'profileImage']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        const followers = followersList.map(follow => follow.follower); // Extraire les objets User (follower)

        const paginationInfos = {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            pageSize: limit
        };

        return res.status(200).json({
            success: true,
            followers: followers,
            paginationInfos: paginationInfos
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des followers:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des abonnés.",
            error: error.message
        });
    }
};


/**
 * @description Obtenir la liste des utilisateurs suivis par un utilisateur donné (avec pagination).
 * @access Public (ou Private si nécessaire)
 */
exports.getFollowing = async (req, res) => {
    const targetUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const { count, rows: followingList } = await Follow.findAndCountAll({
            where: { followerId: targetUserId },
            limit: limit,
            offset: offset,
            include: [
                {
                    model: User,
                    as: 'following', 
                    attributes: ['id', 'firstName', 'lastName', 'profileImage']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        const following = followingList.map(follow => follow.following); // Extraire les objets User (following)

        const paginationInfos = {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            pageSize: limit
        };

        return res.status(200).json({
            success: true,
            following: following,
            paginationInfos: paginationInfos
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des abonnements:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des abonnements.",
            error: error.message
        });
    }
};


/**
 * @description Vérifier si l'utilisateur actuellement connecté suit un autre utilisateur.
 * @access Private (Utilisateur Authentifié)
 * @middleware checkFollowPermission
 */
exports.checkFollowStatus = async (req, res) => {
    // Le statut isFollowing est déjà déterminé par checkFollowPermission
    const isFollowing = req.isFollowing; 
    
    return res.status(200).json({
        success: true,
        isFollowing: isFollowing,
        message: isFollowing ? "L'utilisateur suit cette cible." : "L'utilisateur ne suit pas cette cible."
    });
};