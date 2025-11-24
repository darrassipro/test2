const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken } = require('../middleware/authEnhanced');
const { checkCommunityMembership } = require('../middleware/checkCommunityMembership');
const { uploadImage } = require('../config/cloudinary'); 

const uploadCommunityFiles = uploadImage.array('files', 5); 

router.route('/')
    .post(
        authenticateToken, 
        uploadCommunityFiles, 
        communityController.createCommunity
    )
    .get(communityController.getAllCommunities); 

router.route('/:id')
    .get(
        authenticateToken, 
        checkCommunityMembership, 
        communityController.getCommunity
    )
    .put(
        authenticateToken, 
        uploadCommunityFiles, 
        communityController.updateCommunity
    )
    .delete(
        authenticateToken, 
        communityController.deleteCommunity
    );

module.exports = router;