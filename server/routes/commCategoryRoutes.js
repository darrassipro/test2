const express = require('express');
const router = express.Router();
const commCategoryController = require('../controllers/commCategoryController');
const { authenticateToken } = require('../middleware/authEnhanced');
const { uploadImage } = require('../config/cloudinary');
const { checkSuperAdmin } = require('../middleware/checkSuperAdmin'); 

const uploadCategoryIcon = uploadImage.single('icon'); 


router.route('/communities')
    .post(
        authenticateToken,
        checkSuperAdmin, 
        uploadCategoryIcon, 
        commCategoryController.createCommCategory 
    ) 
    .get(commCategoryController.getAllCommCategories); 

router.route('/communities/:id')
    .get(commCategoryController.getCommCategoryById) 
    .put(
        authenticateToken,
        checkSuperAdmin, 
        uploadCategoryIcon, 
        commCategoryController.updateCommCategory 
    )
    .delete(
        authenticateToken,
        checkSuperAdmin, 
        commCategoryController.deleteCommCategory 
    ); 

module.exports = router;