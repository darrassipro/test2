const express = require('express');
const router = express.Router();
const productCategoryController = require('../controllers/productCategoryController'); 
const { authenticateToken } = require('../middleware/authEnhanced'); 
const { checkSuperAdmin } = require('../middleware/checkSuperAdmin'); 


// POST /api/product-categories
// Crée une nouvelle catégorie de produit (Super-Admin seulement)
router.post(
    '/', 
    authenticateToken, 
    checkSuperAdmin, 
    productCategoryController.createCategory
);

// PATCH /api/product-categories/:id
// Met à jour le nom d'une catégorie (Super-Admin seulement)
router.patch(
    '/:id', 
    authenticateToken, 
    checkSuperAdmin, 
    productCategoryController.updateCategory
);

// DELETE /api/product-categories/:id
// Supprime une catégorie (Super-Admin seulement)
router.delete(
    '/:id', 
    authenticateToken, 
    checkSuperAdmin, 
    productCategoryController.deleteCategory
);

// --- Opérations de Lecture (Accès Public) ---

// GET /api/product-categories
// Obtient toutes les catégories (avec pagination optionnelle)
router.get(
    '/', 
    productCategoryController.getAllCategories
);

// GET /api/product-categories/:id
// Obtient une catégorie par ID
router.get(
    '/:id', 
    productCategoryController.getCategoryById
);


module.exports = router;