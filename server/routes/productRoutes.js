const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authEnhanced'); 
const { checkProductAccess } = require('../middleware/checkProductAccess'); 
const productController = require('../controllers/productController');
const { checkAdminRole } = require('../middleware/checkAdminRole'); 
const { 
   uploadProduct
} = require('../config/cloudinary'); 

const uploadProductAssets = uploadProduct.fields([
    { name: 'images', maxCount: 5 }, 
    { name: 'files', maxCount: 5 }   
]);
//  Créer un produit (POST /api/products)
router.post(
   '/',
   authenticateToken,
   uploadProductAssets, 
   productController.createProduct
);
// Mes Produits 
router.get('/myProducts', authenticateToken, productController.getMyProducts);

// Mes Produits par catégorie
router.get('/myProducts/categories/:categoryId', authenticateToken, productController.getMyProductsByCategory);

//  Obtenir les produits d’une communaute (GET /api/products/communities/:communityId)
router.get(
   '/communities/:communityId', 
   authenticateToken,
   productController.getProductsByCommunity
);

//  Rechercher des produits (GET /api/products/search?q=...)
router.get(
   '/search', 
   authenticateToken,
   productController.searchProducts
);

// Obtenir un produit par ID (GET /api/products/:id)
router.get(
   '/:id', 
   authenticateToken,
   productController.getProductById
);

//  Mettre a jour un produit (PATCH /api/products/:id)
router.patch(
   '/:communityId/:id', 
   authenticateToken,
   uploadProductAssets, 
   checkProductAccess, 
   productController.updateProduct
);

//  Supprimer un produit (DELETE /api/products/:id)
router.delete(
   '/:communityId/:id', 
   authenticateToken,
   checkProductAccess, 
   productController.deleteProduct
);

//  Noter un produit (POST /api/products/:id/rating)
router.post(
   '/:id/rating', 
   authenticateToken,
   productController.updateProductRating
);

//  Incrémenter le compteur de commandes (POST /api/products/:id/command)
router.post(
   '/:id/command',
   authenticateToken, 
   productController.incrementProductCommands
);

// PUT /api/:communityId/:productId/approve
router.put(
    '/:communityId/:productId/approve',
    authenticateToken,
    checkAdminRole('admin'), 
    productController.approvePendingProduct
);

// PUT /api/products/:communityId/:productId/reject
router.put(
    '/:communityId/:productId/reject',
    authenticateToken,
    checkAdminRole('admin'), 
    productController.rejectPendingProduct
);


module.exports = router;