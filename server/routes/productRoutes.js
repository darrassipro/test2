const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authEnhanced'); 
const { checkProductAccess } = require('../middleware/checkProductAccess'); 
const productController = require('../controllers/productController'); 
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
   checkProductAccess('create'), 
   productController.createProduct
);

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
   checkProductAccess('manage'), 
   productController.updateProduct
);

//  Supprimer un produit (DELETE /api/products/:id)
router.delete(
   '/:communityId/:id', 
   authenticateToken,
   checkProductAccess('manage'), 
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


module.exports = router;