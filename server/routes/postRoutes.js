const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middleware/authEnhanced');
const { checkPostAccess } = require('../middleware/smartPostAccess');
const { uploadImage } = require('../config/cloudinary');
const { checkAdminRole } = require('../middleware/checkAdminRole');

const uploadPostFiles = uploadImage.array('files', 5); 


// Create Post
router.post('/', authenticateToken, uploadPostFiles, postController.createPost);

// Get Posts
router.get('/', authenticateToken, checkPostAccess, postController.getUnifiedPosts);

// Get Post by ID
router.get('/:postId',authenticateToken, postController.getPostById); 

// Update Post
router.put('/:postId', authenticateToken,uploadPostFiles, postController.updatePost);

// Delete Post (Soft Delete)
router.delete('/:postId', authenticateToken, postController.deletePost);

// Toggle Like on Post
router.post('/:postId/like', authenticateToken, postController.togglePostLike);

// Record Share
router.post('/:postId/share', authenticateToken, postController.recordShare);

// --- ROUTES DE COMMENTAIRES ---

// Create Comment (Main or Reply)
router.post('/:postId/comments', authenticateToken, postController.createComment);

// Get Post Comments (Main Comments with Pagination)
router.get("/:postId/comments", authenticateToken, postController.getPostComments); 

// Get Replies of a Specific Comment (Replies Pagination)
router.get("/:postId/comments/:commentId/replies", authenticateToken, postController.getCommentReplies);

// Toggle Like on Comment
router.post("/:postId/comments/:commentId/like", authenticateToken, postController.toggleCommentLike);

router.put('/comment/:commentId', authenticateToken, postController.updateComment);
router.delete('/comment/:commentId', authenticateToken, postController.deleteComment);

// Favoris
router.post('/:postId/toggle-save', authenticateToken, postController.toggleSavePost);

// Get Posts By Visited Trace
router.get('/traces/:traceId', authenticateToken, postController.getPostsByVisitedTrace);

// Get Posts By Route
router.get('/routes/:routeId', authenticateToken, postController.getPostsByRoute);

// PUT /api/:communityId/:postId/approve
router.put(
    '/:communityId/:postId/approve',
    authenticateToken,
    checkAdminRole('moderator'), 
    postController.approvePendingPost
);

// PUT /api/posts/:communityId/:postId/reject
router.put(
    '/:communityId/:postId/reject',
    authenticateToken,
    checkAdminRole('moderator'), 
    postController.rejectPendingPost
);

module.exports = router;