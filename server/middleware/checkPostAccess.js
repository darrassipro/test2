const { Post } = require('../models');
const { getUserRole } = require('./checkAdminRole'); 

const checkPostAccess = async (req, res, next) => {
    const userId = req.user.userId;
    const postId = req.params.postId || req.params.id; 
    if (!postId) {
        return res.status(400).json({ success: false, message: "ID du post manquant." });
    }

    try {
        const post = await Post.findByPk(postId, {
            attributes: ['id', 'userId', 'communityId']
        });

        if (!post) {
            return res.status(404).json({ success: false, message: "Post non trouvé." });
        }

        // 1. Vérifier si l'utilisateur est le créateur du post
        const isCreator = post.userId === userId;

        // 2. Vérifier si l'utilisateur est un Admin/Owner de la communauté
        const userRole = await getUserRole(post.communityId, userId);
        const isAdminOrOwner = userRole && ['owner', 'admin'].includes(userRole);

        // 3. Autoriser si l'utilisateur est le créateur OU un admin/owner
        if (isCreator || isAdminOrOwner) {
            req.post = post; // Stocker le post pour le contrôleur
            return next();
        }

        return res.status(403).json({ 
            success: false,
            message: "Accès refusé. Seul le créateur ou un administrateur peut gérer ce post."
        });

    } catch (error) {
        console.error("Erreur lors de la vérification du gestionnaire de post:", error);
        return res.status(500).json({ 
            success: false,
            message: "Erreur serveur lors de la vérification des permissions."
        });
    }
};

module.exports = { checkPostAccess };