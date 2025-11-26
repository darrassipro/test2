const express = require('express');
const router = express.Router();
const communityController = require('../controllers/CommunityController');
const { authenticateToken } = require('../middleware/authEnhanced');
const { checkCommunityMembership } = require('../middleware/checkCommunityMembership');
const { uploadImage } = require('../config/cloudinary'); 

const uploadCommunityFiles = uploadImage.array('files', 5); 

router.get('/not-joined', authenticateToken, communityController.getCommunitiesNotJoined);

router.get('/user-joined', authenticateToken, communityController.getUserCommunities);

router.route('/')
    .post(
        authenticateToken, 
        uploadCommunityFiles, 
        communityController.createCommunity
    )
    .get(authenticateToken, communityController.getAllCommunities); 

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

// Join a community
router.post('/:id/join', authenticateToken, communityController.joinCommunity);

// Members list
router.get('/:id/members', authenticateToken, checkCommunityMembership, communityController.getCommunityMembers);


module.exports = router;