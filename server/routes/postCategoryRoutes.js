const express = require('express');
const router = express.Router();
const postCategoryController = require('../controllers/postCategoryController');
const { authenticateToken } = require('../middleware/authEnhanced');
const { uploadImage } = require('../config/cloudinary');
const { checkSuperAdmin } = require('../middleware/checkSuperAdmin');

const uploadCategoryIcon = uploadImage.single('icon');
// Route pour créer une nouvelle catégorie de post et récupérer toutes les catégories
router.route('/posts')
    .post(authenticateToken, checkSuperAdmin, uploadCategoryIcon, postCategoryController.createPostCategory) // Créer 
    .get(authenticateToken, postCategoryController.getAllPostCategories); // Lire toutes 

// Routes pour gérer une catégorie spécifique par son ID
router.route('/posts/:id')
    .get(authenticateToken, postCategoryController.getPostCategoryById) // Lire par ID
    .put(authenticateToken, uploadCategoryIcon, checkSuperAdmin, postCategoryController.updatePostCategory) // Mettre à jour 
    .delete(authenticateToken, uploadCategoryIcon, checkSuperAdmin, postCategoryController.deletePostCategory); // Supprimer 

module.exports = router;