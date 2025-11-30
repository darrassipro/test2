const { Product } = require('../models');
const { getUserRole } = require('./checkAdminRole'); 

const checkProductAccess = async (req, res, next) => {
    const userId = req.user.userId;
    const productId = req.params.productId || req.params.id; // ID du produit
    
    if (!productId) {
        return res.status(400).json({ success: false, message: "ID du produit manquant." });
    }

    try {
        const product = await Product.findByPk(productId, {
            attributes: ['id', 'userId', 'communityId']
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Produit non trouvé." });
        }

        // 1. Vérifier si l'utilisateur est le créateur du produit
        const isCreator = product.userId === userId;

        // 2. Vérifier si l'utilisateur est un Admin/Owner de la communauté
        const userRole = await getUserRole(product.communityId, userId);
        const isAdminOrOwner = userRole && ['owner', 'admin'].includes(userRole);

        // 3. Autoriser si l'utilisateur est le créateur OU un admin/owner
        if (isCreator || isAdminOrOwner) {
            req.product = product; // Stocker le produit pour le contrôleur
            return next();
        }

        return res.status(403).json({ success: false, message: "Accès refusé. Seul le créateur ou un administrateur peut gérer ce produit." });

    } catch (error) {
        console.error("Erreur lors de la vérification du gestionnaire de produit:", error);
        return res.status(500).json({ success: false, message: "Erreur serveur lors de la vérification des permissions." });
    }
};

module.exports = { checkProductAccess };