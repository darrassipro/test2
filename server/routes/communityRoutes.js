const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken } = require('../middleware/authEnhanced');
const multer = require('multer');
const { checkCommunityMembership } = require('../middleware/checkCommunityMembership');
const { communityFileStorage} = require('../config/cloudinary'); 
const { smartPostAccess } = require('../middleware/smartPostAccess'); 

const uploadCommunityFields = multer({ 
    storage: communityFileStorage,
    limits: { 
        fileSize: 100 * 1024 * 1024, // 100MB
        files: 22 // Total: 10 images + 5 videos + 5 audios + 2 virtualTours
    }
}).fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 5 },
    { name: 'audios', maxCount: 5 },
    { name: 'virtualTours', maxCount: 2 } 
]);

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('❌ Multer error:', err.message, err.code);
        return res.status(400).json({
            success: false,
            message: `File upload error: ${err.message}`,
            code: err.code
        });
    } else if (err) {
        console.error('❌ Upload error:', err);
        return res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: err.message
        });
    }
    next();
};

router.get('/not-joined', authenticateToken, communityController.getCommunitiesNotJoined);

router.get('/user-joined', authenticateToken, communityController.getUserCommunities);
router.route('/:id/posts/public')
    .get(
        authenticateToken,
        smartPostAccess,    
        communityController.getPublicPostByCommunity
    );

router.route('/')
    .post(
        authenticateToken, 
        uploadCommunityFields,
        handleMulterError,
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
        (req, res, next) => {
            console.log('🔵 PUT /communities/:id - Request received', {
                id: req.params.id,
                contentType: req.headers['content-type'],
                hasBody: !!req.body,
                bodyKeys: req.body ? Object.keys(req.body).slice(0, 5) : []
            });
            next();
        },
        uploadCommunityFields,
        handleMulterError,
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