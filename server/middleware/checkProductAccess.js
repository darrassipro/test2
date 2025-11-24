const { Product } = require('../models/index');
const { getUserRole } = require('./checkAdminRole'); // Réutilisation de l'utilitaire de rôle

/**
 * @description Middleware pour vérifier les permissions d'accès (CRUD) aux produits.
 * Ce middleware est utilisé pour POST (Création) ou PATCH/DELETE (Modification/Suppression).
 * @param {string} mode 'create' ou 'manage'
 * @access Utilisateur Authentifié
 */
const checkProductAccess = (mode) => {
    return async (req, res, next) => {
        const userId = req.user.userId;
        const communityId = req.params.communityId || req.body.communityId; // Pour la création
        const productId = req.params.id; // Pour la modification/suppression

        if (!communityId) {
            return res.status(400).json({ success: false, message: "ID de la communauté manquant." });
        }

        try {
            // 1. Récupérer le rôle de l'utilisateur dans cette communauté
            const userRole = await getUserRole(communityId, userId);
            const isAdmin = userRole && (userRole === 'owner' || userRole === 'admin' || userRole === 'moderator');
            req.userRole = userRole; // Stocker le rôle pour le contrôleur

            // --- Logique pour la Création (POST /api/products) ---
            if (mode === 'create') {
                if (!isAdmin) {
                    return res.status(403).json({ success: false, message: "Accès refusé. Seuls les administrateurs de la communauté peuvent créer des produits." });
                }
                // Si l'utilisateur est admin, on continue
                return next();
            }

            // --- Logique pour la Gestion (PATCH/DELETE /api/products/:id) ---
            if (mode === 'manage' && productId) {
                const product = await Product.findByPk(productId, {
                    attributes: ['id', 'userId', 'communityId']
                });

                if (!product || product.communityId !== communityId) {
                    return res.status(404).json({ success: false, message: "Produit non trouvé dans cette communauté." });
                }

                // 2. Vérifier si l'utilisateur est le créateur du produit
                const isCreator = product.userId === userId;

                // 3. Vérifier les permissions
                if (isCreator || isAdmin) {
                    req.product = product; // Stocker le produit pour le contrôleur
                    return next();
                }

                return res.status(403).json({ success: false, message: "Accès refusé. Seul le créateur du produit ou un administrateur peut gérer ce produit." });
            }
            
            return res.status(400).json({ success: false, message: "Requête de gestion de produit mal formée." });


        } catch (error) {
            console.error(`Erreur lors de la vérification des permissions de produit (${mode}):`, error);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur lors de la vérification des permissions de produit.",
                error: error.message
            });
        }
    };
};

module.exports = { checkProductAccess };