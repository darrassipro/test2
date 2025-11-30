const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken } = require('../middleware/authEnhanced');
const multer = require('multer');
const { checkCommunityMembership } = require('../middleware/checkCommunityMembership');
const { communityFileStorage} = require('../config/cloudinary'); 
const { checkPostAccess } = require('../middleware/smartPostAccess'); 
const uploadCommunityFields = multer({ storage: communityFileStorage }).fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 },
    { name: 'audios', maxCount: 5 },
    { name: 'virtualTours', maxCount: 2 } 
]);

router.get('/not-joined', authenticateToken, communityController.getCommunitiesNotJoined);

router.get('/user-joined', authenticateToken, communityController.getUserCommunities);
router.route('/:id/posts/public')
    .get(
        authenticateToken,
        checkPostAccess,    
        communityController.getPublicPostByCommunity
    );

router.route('/')
    .post(
        authenticateToken, 
        uploadCommunityFields, 
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
        uploadCommunityFields, 
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