const database = require("../config/db");
const sequelize = database.getSequelize();
const { Post, PostFile, PostLike, User, Comment, CommentLike, PostShare, Community, CommunityMembership, PostCategory ,VisitedTrace, Route, FavoritePost, CommunityFile, Admin} = require("../models");
const { Op } = require("sequelize");
const { deleteMultipleFiles } = require("../config/cloudinary");
const { getUserRole } = require("../middleware/checkAdminRole");

// 1. Create Post (MODIFIÉ)
exports.createPost = async (req, res) => {
    const t = await sequelize.transaction(); // Utilisation d'une transaction pour la sécurité

    try {
        const { 
            contentType, 
            title, 
            description, 
            isVr, 
            vrUrl, 
            isVisibleOutsideCommunity, 
            communityId, 
            postCategory, 
            hotelNuiteeId, 
            isBoosted,
            visitedTraceId // <-- NOUVEAU
        } = req.body;
        const { images, videos, audios, virtualTours } = req.files;
        const uploadedFiles = [];
        if (images && images.length > 0) {
    uploadedFiles.push(...images);
}

if (videos && videos.length > 0) {
    uploadedFiles.push(...videos);
}

if (audios && audios.length > 0) {
    uploadedFiles.push(...audios);
} 
if (virtualTours && virtualTours.length > 0) {
    uploadedFiles.push(...virtualTours);
}
if (uploadedFiles.length > 0) {
    console.log("Uploaded File Example Properties:", uploadedFiles[0]);
}
        const userId = req.user.userId;
        // 1. Vérifications de la Communauté
        if (!communityId) {
            await t.rollback();
            return res.status(400).json({ 
                success: false,
                message: "communityId is required" 
            });
        }

        const community = await Community.findOne({
            where: { id: communityId, isDeleted: false },
            transaction: t
        });

        if (!community) {
            await t.rollback();
            return res.status(404).json({ 
                success: false,
                message: "Community not found" 
            });
        }

        const isCreator = community.creatorUserId === userId;
        const isMemberRecord = await CommunityMembership.findOne({
            where: { communityId: communityId, userId: userId },
            transaction: t
        });

        const isMember = !!isMemberRecord; 
        const userRole = await getUserRole(communityId, userId); 
        const isAdminOrMod = userRole && ['owner', 'admin'].includes(userRole); 

        if (!isCreator && !isMember && !isAdminOrMod) {
            await t.rollback();
            return res.status(403).json({
                success: false,
                message: "il faut etre membre ou créateur ou administrateur de la communauté pour créer un post"
            });
        }

        let postStatus = 'pending'; 
        let publicationDate = null; 

        if (isCreator || isAdminOrMod) {
            postStatus = 'approved';
            publicationDate = new Date(); 
        } else {
             postStatus = 'pending';
        }

        // 2. Vérification du visitedTraceId 
        if (visitedTraceId) {
            const visitedTrace = await VisitedTrace.findOne({
                where: { id: visitedTraceId },
                include: [{ 
                    model: Route, 
                    as: 'route', 
                    attributes: ['communityId'] 
                }],
                transaction: t
            });

            // Vérifier que le VisitedTrace existe
            if (!visitedTrace) {
                await t.rollback();
                return res.status(404).json({ 
                    success: false,
                    message: "VisitedTrace not found" 
                });
            }

            // Vérifier que le VisitedTrace appartient à un trajet de la même communauté
            if (visitedTrace.route.communityId !== communityId) {
                await t.rollback();
                return res.status(403).json({ 
                    success: false,
                    message: "VisitedTrace must belong to a route in the same community" 
                });
            }
        }

        // 3. Vérification de la catégorie de post
        let categoryId = postCategory || null;
        if (categoryId) {
            const category = await PostCategory.findByPk(categoryId, { transaction: t });
            if (!category) {
                await t.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Post category not found"
                });
            }

            if (category.name && category.name.toLowerCase() === 'hotel' && !hotelNuiteeId) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: "il faut selectionner un hotel"
                });
            }
        }


        // 4. Création du Post
        const newPost = await Post.create({
            userId,
            communityId,
            contentType,
            title,
            description,
            isVr: isVr || false,
            vrUrl,
            isVisibleOutsideCommunity: isVisibleOutsideCommunity === 'true' || isVisibleOutsideCommunity === true,
            isBoosted: isBoosted || false,
            postCategory: categoryId,
            hotelNuiteeId: hotelNuiteeId || null,
            visitedTraceId: visitedTraceId || null,
            status: postStatus,
            publicationDate: publicationDate || new Date(), 
        }, { transaction: t });


        // 5. Gestion des fichiers
        if (uploadedFiles && uploadedFiles.length > 0) {
            const filesToCreate = uploadedFiles.map((file, index) => ({
                postId: newPost.id,
                url: file.path || file.secure_url,
                cloudinaryId: file.filename || file.public_id,
                type: file.mimetype,
                //isPrincipale: index === 0 
            }));
            await PostFile.bulkCreate(filesToCreate, { transaction: t });
        }

        // 6. Finalisation
        await t.commit();

        const postWithFiles = await Post.findByPk(newPost.id, {
            include: [
                { model: PostFile, as: 'postFiles' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] },
                { model: Community, as: 'community', attributes: ['id', 'name'] },
                { model: PostCategory, as: 'category', attributes: ['id', 'name', 'imageUrl'] },
                { 
                    model: VisitedTrace, 
                    as: 'visitedTrace', 
                    attributes: ['id', 'latitude', 'longitude', 'createdAt'],
                    include: [{ model: Route, as: 'route', attributes: ['id', 'isLive', 'publishDate'] }]
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: "Post created successfully! Status: " + postStatus,
            post: postWithFiles
        });

    } catch (error) {
        if (t && t.finished !== 'commit') { 
            await t.rollback();
        }
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: "Failed to create post", error: error.message });
    }
};

exports.getUnifiedPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const currentUserId = req.user ? req.user.userId : null;

        const { type, communityId, isMember } = req.context;

        let whereCondition = { 
            isDeleted: false,
            status: 'approved'
         };
        let communityInformations = null;
        let userRole = null;

        // LOGIC 1: HOME PAGE
        if (type === 'HOME') {
            whereCondition.isVisibleOutsideCommunity = true;
        }

        // LOGIC 2: COMMUNITY PAGE
        else if (type === 'COMMUNITY') {
            whereCondition.communityId = communityId;
            communityInformations = await Community.findByPk(communityId, {
                attributes: [
                    'id', 'name', 'description', 'isVerified', 'totalMembers', 
                    'totalPosts', 'totalProducts', 'isPremium', 'price', 'createdAt'
                ],
                include: [
                    { 
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'firstName', 'lastName', 'profileImage']
                    },
                    { 
                        model: CommunityFile,
                        as: 'communityFiles',
                        attributes: ['url', 'type', 'isPrincipale']
                    }
                ]
            });

            if (currentUserId && communityId) {
                userRole = await getUserRole(communityId, currentUserId);
            }

            if (isMember && ['owner', 'admin', 'moderator'].includes(userRole)) {
                 delete whereCondition.status; 
            }
            else if (!isMember) {
                whereCondition.isVisibleOutsideCommunity = true;
            }
        }

        // FETCH DATA (avec OPTIMISATION SQL)
        const { count, rows: posts } = await Post.findAndCountAll({
            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: PostFile, as: 'postFiles' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] },
                { model: Community, as: 'community', attributes: ['id', 'name'] }, 
                { model: PostCategory, as: 'category', attributes: ['id', 'name', 'imageUrl'], required: false }
            ],
            attributes: {
                include: [
                    // Counts Optimisés
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = Post.id)`), 'likesCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM comments WHERE comments.post_id = Post.id)`), 'commentsCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id = Post.id)`), 'sharesCount'],
                    
                    // User Specific (Likes & Save) 
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_likes AS IsLiked WHERE IsLiked.post_id = Post.id AND IsLiked.user_id = '${currentUserId || 0}')`), 'isLikedCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM favorite_posts AS FavoritePost WHERE FavoritePost.post_id = Post.id AND FavoritePost.user_id = '${currentUserId || 0}')`), 'isSavedCount']
                ]
            },
        });

       
        const formattedPosts = await Promise.all(posts.map(async (post) => {
            const rawPost = post.get({ plain: true });
            
            // Check if user is a member of this post's community (for HOME feed)
            let postIsMember = false;
            if (type === 'HOME' && currentUserId && rawPost.communityId) {
                const membershipCheck = await CommunityMembership.findOne({
                    where: {
                        communityId: rawPost.communityId,
                        userId: currentUserId
                    }
                });
                postIsMember = !!membershipCheck;
            } else if (type === 'COMMUNITY') {
                // For community feed, use the context isMember
                postIsMember = !!isMember;
            }
            
            return {
                ...rawPost,
                isLiked: rawPost.isLikedCount > 0, 
                isSaved: rawPost.isSavedCount > 0,
                isMember: postIsMember,
                isLikedCount: undefined,
                isSavedCount: undefined
            };
        }));

        res.status(200).json({
            success: true,
            context: type, // On informe le frontend si l’on est sur Home ou Community
            isMember: !!isMember,
            communityInformations: communityInformations, 
            totalPosts: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            posts: formattedPosts
        });

    } catch (error) {
        console.error('Error fetching unified posts:', error);
        res.status(500).json({ success: false, message: "Failed to fetch posts", error: error.message });
    }
};

exports.approvePendingPost = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { postId } = req.params;
        const post = await Post.findOne({
            where: { id: postId, isDeleted: false, status: 'pending' },
            transaction: t
        });

        if (!post) {
            await t.rollback();
            return res.status(404).json({ 
                success: false, 
                message: "Pending post not found or already approved/rejected" 
            });
        }
        
        await post.update({ 
            status: 'approved',
            publicationDate: new Date(), 
        }, { transaction: t });
        
        await t.commit();

        const updatedPost = await Post.findByPk(postId, {
            include: [
                { model: PostFile, as: 'postFiles' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] },
                { model: Community, as: 'community', attributes: ['id', 'name'] },
                { model: PostCategory, as: 'category', attributes: ['id', 'name', 'imageUrl'], required: false }
            ]
        });

        res.status(200).json({
            success: true,
            message: "Post approved and published successfully!",
            post: updatedPost
        });

    } catch (error) {
        if (t && t.finished !== 'commit') { 
            await t.rollback();
        }
        console.error('Error approving pending post:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to approve and publish post", 
            error: error.message 
        });
    }
};

exports.rejectPendingPost = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { postId } = req.params;
        
        const [updatedRows] = await Post.update(
            { status: 'rejected' }, 
            { 
                where: { id: postId, isDeleted: false, status: 'pending' },
                transaction: t
            }
        );

        if (updatedRows === 0) {
            await t.rollback();
            return res.status(404).json({ 
                success: false, 
                message: "Pending post not found or already approved/rejected" 
            });
        }
        
        await t.commit();

        res.status(200).json({
            success: true,
            message: "Post rejected successfully. It will no longer be visible.",
        });

    } catch (error) {
        if (t && t.finished !== 'commit') { 
            await t.rollback();
        }
        console.error('Error rejecting pending post:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to reject post", 
            error: error.message 
        });
    }
};

// 6.Toggle Like Post
exports.togglePostLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const existingLike = await PostLike.findOne({
            where: { postId: postId, userId: userId }
        });

        if (existingLike) {
            await existingLike.destroy();
            res.status(200).json({
                message: "Post unliked successfully",
                isLiked: false
            });
        } else {
            await PostLike.create({ postId: postId, userId: userId });
            res.status(200).json({
                success: true,
                message: "Post liked successfully",
                isLiked: true
            });
        }

    } catch (error) {
        console.error('Error toggling post like:', error);
        res.status(500).json({ success: false, message: "Failed to toggle post like", error: error.message });
    }
};


// 3. Get Post by ID
exports.getPostById = async (req, res) => {
    try {
        const { postId } = req.params;
        const currentUserId = req.user ? req.user.userId : null;

        const totalCommentsCount = await Comment.count({
            where: { postId: postId, replyId: { [Op.is]: null }, isDeleted: false }
        });

        const post = await Post.findOne({
            where: { id: postId, isDeleted: false },
            include: [
                { model: PostFile, as: 'postFiles' },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified']
                },
                {
                    model: Community,
                    as: 'community',
                    attributes: ['id', 'name', 'creatorUserId']
                },
                {
                    model: PostCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'imageUrl'],
                    required: false
                },
                {
                    model: Comment,
                    as: 'comments',
                    where: { replyId: { [Op.is]: null }, isDeleted: false },
                    required: false,
                    include: [
                        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] },
                        { model: CommentLike, as: 'likes', attributes: ['id', 'userId'] },
                        // Include direct replies to this comment
                        {
                            model: Comment,
                            as: 'replies',
                            where: { isDeleted: false },
                            required: false,
                            include: [
                                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] },
                                { model: CommentLike, as: 'likes', attributes: ['id', 'userId'] },
                            ]
                        }
                    ],
                    order: [
                        [sequelize.literal('(SELECT COUNT(*) FROM `comment_likes` WHERE `comment_likes`.`comment_id` = `Comment`.`id`)'), 'DESC'],

                        ['createdAt', 'DESC']
                    ],
                    limit: 5,
                    attributes: {
                        include: [
                            [
                                sequelize.literal(`(
                                    SELECT COUNT(*)
                                    FROM comments AS Reply
                                    WHERE
                                        Reply.reply_id = Comment.id
                                        AND Reply.is_deleted = FALSE
                                )`),
                                'repliesCount'
                            ],
                        ]
                    }
                },
                { model: PostLike, as: 'likedBy', attributes: ['id', 'userId'] },
                { model: PostShare, as: 'shares', attributes: ['id'] }
            ]
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found or deleted" });
        }

        // Vérifier l'accès au post selon isVisibleOutsideCommunity
        if (!post.isVisibleOutsideCommunity && currentUserId) {
            // Vérifier si l'utilisateur est membre ou créateur de la communauté
            const isCreator = post.community.creatorUserId === currentUserId;
            const isMember = await CommunityMembership.findOne({
                where: { communityId: post.communityId, userId: currentUserId }
            });

            if (!isCreator && !isMember) {
                return res.status(403).json({
                    success: false,
                    message: "You must be a member of this community to view this post"
                });
            }
        } else if (!post.isVisibleOutsideCommunity && !currentUserId) {
            return res.status(403).json({
                success: false,
                message: "You must be logged in and a member of this community to view this post"
            });
        }

        const rawPost = post.get({ plain: true });

        const commentsWithAggregates = rawPost.comments.map((comment) => {
            const replies = (comment.replies || []).map((r) => ({
                ...r,
                likesCount: r.likes ? r.likes.length : 0,
                isLiked: currentUserId ? (r.likes || []).some(like => like.userId === currentUserId) : false,
                content: r.commentText,
                likes: undefined,
            }));

            return {
                ...comment,
                likesCount: comment.likes ? comment.likes.length : 0,
                isLiked: currentUserId ? (comment.likes || []).some(like => like.userId === currentUserId) : false,
                content: comment.commentText,
                repliesCount: comment.repliesCount || (replies.length),
                replies: replies,
                likes: undefined,
            };
        });

        // Vérifier si l'utilisateur a sauvegardé le post
        const isSaved = currentUserId ? await FavoritePost.findOne({ 
            where: { postId: postId, userId: currentUserId } 
        }) : null;

        // Check if user is a member of this post's community
        let isMember = false;
        if (currentUserId && post.communityId) {
            const membershipCheck = await CommunityMembership.findOne({
                where: {
                    communityId: post.communityId,
                    userId: currentUserId
                }
            });
            isMember = !!membershipCheck;
        }

        const formattedPost = {
            ...rawPost,
            likesCount: rawPost.likedBy.length,
            sharesCount: rawPost.shares.length,
            totalCommentsCount: totalCommentsCount,
            isLiked: currentUserId ? rawPost.likedBy.some(like => like.userId === currentUserId) : false,
            isMember: isMember,
            likedBy: undefined,
            shares: undefined,
            comments: commentsWithAggregates,
            isSaved: !!isSaved, // Ajout du boolean true/false
        };

        res.status(200).json({
            success: true,
            post: formattedPost
        });

    } catch (error) {
        console.error('Error fetching post by ID:', error);
        res.status(500).json({ success: false, message: "Failed to fetch post", error: error.message });
    }
};


// 4. Update Post
exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        // Déstructurez les champs du corps de la requête (maintenant parsés par Multer)
        const { title, description, isVisibleOutsideCommunity, vrUrl, filesToDelete, postCategory, hotelNuiteeId } = req.body;
        const userId = req.user.userId;
        const uploadedFiles = req.files || []; // Les nouveaux fichiers

        const post = await Post.findOne({
            where: { id: postId, isDeleted: false, userId: userId },
            include: [
                { model: Community, as: 'community', attributes: ['id', 'creatorUserId'] }
            ]
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found or you are not the author" });
        }

        // Vérifier que l'utilisateur est toujours membre ou créateur de la communauté
        const isCreator = post.community.creatorUserId === userId;
        const isMember = await CommunityMembership.findOne({
            where: { communityId: post.communityId, userId: userId }
        });

        if (!isCreator && !isMember) {
            return res.status(403).json({
                message: "You must be a member of the community to update this post"
            });
        }

        // Vérifier que la catégorie de post existe si elle est fournie
        if (postCategory !== undefined) {
            if (postCategory) {
                const category = await PostCategory.findByPk(postCategory);
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: "Post category not found"
                    });
                }

                // Si la catégorie est "hotel", vérifier que hotelNuiteeId est fourni
                if (category.name && category.name.toLowerCase() === 'hotel' && !hotelNuiteeId) {
                    return res.status(400).json({
                        success: false,
                        message: "hotelNuiteeId is required when post category is 'hotel'"
                    });
                }
            }
        }

        // 1. Mise à jour des champs textuels du Post
        // Si un champ est undefined, Sequelize l'ignorera (comportement par défaut)
        const updateData = {
            title,
            description,
            isVisibleOutsideCommunity,
            vrUrl
        };

        // Ajouter postCategory et hotelNuiteeId seulement s'ils sont définis
        if (postCategory !== undefined) {
            updateData.postCategory = postCategory || null;
        }
        if (hotelNuiteeId !== undefined) {
            updateData.hotelNuiteeId = hotelNuiteeId || null;
        }

        await post.update(updateData);

        // 2. Traitement de la suppression des fichiers existants
        if (filesToDelete) {
            // Gère les cas où filesToDelete est une chaîne (simple ID) ou un tableau d'IDs
            let fileIdsToDelete = Array.isArray(filesToDelete) ? filesToDelete : [filesToDelete];

            // Assurez-vous que les IDs sont valides (par exemple, ce ne sont pas des chaînes vides si form-data a envoyé [])
            fileIdsToDelete = fileIdsToDelete.filter(id => id && id !== 'undefined');

            if (fileIdsToDelete.length > 0) {
                // A. Trouver les ID Cloudinary des fichiers à supprimer
                const filesToDestroy = await PostFile.findAll({
                    where: { postId: postId, id: { [Op.in]: fileIdsToDelete } }
                });

                const cloudinaryPublicIds = filesToDestroy.map(file => file.cloudinaryPublicId).filter(Boolean);

                // B. Exécuter la suppression de Cloudinary (si des IDs existent)
                if (cloudinaryPublicIds.length > 0) {
                    // Utilisation de la fonction deleteMultipleFiles que vous avez définie
                    await deleteMultipleFiles(cloudinaryPublicIds);
                }

                // C. Supprimer les enregistrements de la base de données
                await PostFile.destroy({
                    where: { postId: postId, id: { [Op.in]: fileIdsToDelete } }
                });
            }
        }

        // 3. Ajout de nouveaux fichiers
        if (uploadedFiles.length > 0) {
            const newPostFiles = uploadedFiles.map(file => {
                const url = file.path;
                const cloudinaryPublicId = file.filename;
                const fileType = file.mimetype.startsWith('video') ? 'video' : 'image';

                return {
                    postId: post.id,
                    url: url,
                    cloudinaryPublicId: cloudinaryPublicId,
                    type: fileType
                };
            });

            await PostFile.bulkCreate(newPostFiles);
        }

        // 4. Récupération du Post mis à jour
        const updatedPost = await Post.findByPk(postId, {
            include: [
                { model: PostFile, as: 'postFiles' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage'] },
                { model: Community, as: 'community', attributes: ['id', 'name'] },
                { model: PostCategory, as: 'category', attributes: ['id', 'name', 'imageUrl'], required: false }
            ]
        });

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            post: updatedPost
        });

    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ success: false, message: "Failed to update post", error: error.message });
    }
};

// 5.Soft Delete Post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        const [updatedRows] = await Post.update(
            { isDeleted: true },
            { where: { id: postId, userId: userId, isDeleted: false } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ message: "Post not found or you are not the author" });
        }

        res.status(200).json({ message: "Post deleted successfully (soft delete)" });

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: "Failed to delete post", error: error.message });
    }
};

// 7. Create Comment
exports.createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { commentText, replyId } = req.body;
        const userId = req.user.userId;

        if (!commentText) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const post = await Post.findByPk(postId, { attributes: ['id'] });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (replyId) {
            const parentComment = await Comment.findByPk(replyId, { attributes: ['id'] });
            if (!parentComment) {
                return res.status(404).json({ message: "Parent comment not found for reply" });
            }
        }

        const newComment = await Comment.create({
            postId: postId,
            userId: userId,
            replyId: replyId || null,
            commentText: commentText
        });

        const commentWithUser = await Comment.findByPk(newComment.id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] }
            ]
        });

        res.status(201).json({ message: "Comment created successfully", comment: commentWithUser });

    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: "Failed to create comment", error: error.message });
    }
};

// 8. Get Post Comments (Main Comments with Pagination)
exports.getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const currentUserId = req.user ? req.user.userId : null;

        const { count, rows: comments } = await Comment.findAndCountAll({
            where: { postId: postId, replyId: null, isDeleted: false },
            limit,
            offset,
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] },
                { model: CommentLike, as: 'likes', attributes: ['userId'] }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM comments AS Reply
                            WHERE
                                Reply.reply_id = Comment.id
                                AND Reply.is_deleted = FALSE
                        )`),
                        'repliesCount'
                    ],
                ]
            },
            order: [
                [sequelize.literal('(SELECT COUNT(*) FROM comment_likes WHERE comment_likes.comment_id = Comment.id)'), 'DESC'],
                ['createdAt', 'DESC']
            ]
        });

        const formattedComments = comments.map((comment) => {
            return {
                ...comment.get({ plain: true }),
                likesCount: comment.likes.length,
                isLiked: currentUserId ? comment.likes.some(like => like.userId === currentUserId) : false,
                likes: undefined
            };
        });

        res.status(200).json({
            totalComments: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            comments: formattedComments
        });

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: "Failed to fetch comments", error: error.message });
    }
};

// 9. Get Comment Replies (Replies Pagination)
exports.getCommentReplies = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        const currentUserId = req.user ? req.user.userId : null;

        const { count, rows: replies } = await Comment.findAndCountAll({
            where: { post_id: postId, reply_id: commentId, isDeleted: false },
            limit,
            offset,
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] },
                { model: CommentLike, as: 'likes', attributes: ['userId'] }
            ],
            order: [['created_at', 'ASC']]
        });

        const formattedReplies = replies.map(reply => ({
            ...reply.get({ plain: true }),
            likesCount: reply.likes.length,
            isLiked: currentUserId ? reply.likes.some(like => like.userId === currentUserId) : false,
            likes: undefined
        }));

        res.status(200).json({
            totalReplies: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            replies: formattedReplies
        });

    } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({ message: "Failed to fetch replies", error: error.message });
    }
};

exports.toggleCommentLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.userId;

        const existingLike = await CommentLike.findOne({
            where: { commentId, userId }
        });

        if (existingLike) {
            await existingLike.destroy();
            return res.status(200).json({
                message: "Comment unliked successfully",
                isLiked: false
            });
        }

        await CommentLike.create({ commentId, userId });
        return res.status(200).json({
            message: "Comment liked successfully",
            isLiked: true
        });

    } catch (error) {
        console.error('Error toggling comment like:', error);
        return res.status(500).json({ message: "Failed to toggle comment like", error: error.message });
    }
};

//  Update Comment (or Reply)
exports.updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { commentText } = req.body;
        const userId = req.user.userId;

        if (!commentText) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const comment = await Comment.findOne({
            where: { id: commentId, isDeleted: false }
        });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Vérifier que l'utilisateur est l'auteur du commentaire
        if (comment.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this comment" });
        }

        comment.commentText = commentText;
        await comment.save();

        res.status(200).json({ 
            message: "Comment updated successfully", 
            comment: comment 
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: "Failed to update comment", error: error.message });
    }
};

//  Delete Comment (or Reply) - Soft Delete
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.userId;

        const comment = await Comment.findOne({
            where: { id: commentId, isDeleted: false }
        });

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        let isAuthorized = false;

        // Cas 1 : L'utilisateur est l'auteur du commentaire
        if (comment.userId === userId) {
            isAuthorized = true;
        } else {
            // Si ce n'est pas l'auteur, on doit vérifier le rôle ou le créateur du post
            // On récupère les infos de l'utilisateur connecté (Rôle)
            const currentUser = await User.findByPk(userId, { attributes: ['role'] });
            
            // Cas 2 : L'utilisateur est Super-Admin
            if (currentUser && currentUser.role === 'super-admin') {
                isAuthorized = true;
            } 
            else {
                // Cas 3 : L'utilisateur est le créateur du Post
                const post = await Post.findByPk(comment.postId);
                if (post && post.userId === userId) {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ 
                message: "You are not authorized to delete this comment" 
            });
        }

        // Soft delete
        comment.isDeleted = true;
        await comment.save();

        res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: "Failed to delete comment", error: error.message });
    }
};

exports.recordShare = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;
        const { shareText } = req.body;

        const post = await Post.findByPk(postId, { attributes: ['id'] });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        await PostShare.create({
            postId: postId,
            userId: userId,
            shareText: shareText || null
        });

        res.status(200).json({ message: "Post share recorded successfully" });
    } catch (error) {
        console.error('Error recording post share:', error);
        res.status(500).json({ message: "Failed to record post share", error: error.message });
    }
};

// 12. Toggle Save Post (Favorites)
exports.toggleSavePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.userId;

        // Vérifier si le post existe
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Vérifier si déjà sauvegardé
        const existingSave = await FavoritePost.findOne({
            where: { postId: postId, userId: userId }
        });

        if (existingSave) {
            // Si existe, on le supprime (Unsave)
            await existingSave.destroy();
            return res.status(200).json({ 
                success: true, 
                message: "Post removed from favorites", 
                isSaved: false 
            });
        } else {
            // Sinon, on le crée (Save)
            await FavoritePost.create({ postId: postId, userId: userId });
            return res.status(200).json({ 
                success: true, 
                message: "Post added to favorites", 
                isSaved: true 
            });
        }

    } catch (error) {
        console.error('Error toggling save post:', error);
        res.status(500).json({ success: false, message: "Failed to toggle save post", error: error.message });
    }
};

// Get Posts By Visited Trace 
exports.getPostsByVisitedTrace = async (req, res) => {
    try {
        const { traceId } = req.params;
        const currentUserId = req.user ? req.user.userId : null;
        
        // 1. Vérifier que le VisitedTrace existe
        const visitedTrace = await VisitedTrace.findByPk(traceId, {
            include: [{ 
                model: Route,
                as: 'route',
                attributes: ['id', 'communityId'] 
            }]
        });

        if (!visitedTrace) {
            return res.status(404).json({ 
                success: false,
                message: "VisitedTrace not found" 
            });
        }

        // 2. Récupérer les posts associés à ce VisitedTraceId
        const posts = await Post.findAll({
            where: { 
                visitedTraceId: traceId,
                isDeleted: false 
            },
            order: [['createdAt', 'DESC']],
            include: [
                { model: PostFile, as: 'postFiles' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] },
                { model: Community, as: 'community', attributes: ['id', 'name'] },
                { model: PostCategory, as: 'category', attributes: ['id', 'name', 'imageUrl'], required: false }
            ],
            attributes: {
                include: [
                    // Inclure les agrégats de comptage (Likes, Comments, Shares)
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = Post.id)`), 'likesCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM comments WHERE comments.post_id = Post.id)`), 'commentsCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id = Post.id)`), 'sharesCount'],
                    // L'utilisateur a-t-il liké/sauvegardé ?
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_likes AS IsLiked WHERE IsLiked.post_id = Post.id AND IsLiked.user_id = '${currentUserId || 0}')`), 'isLikedCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM favorite_posts AS FavoritePost WHERE FavoritePost.post_id = Post.id AND FavoritePost.user_id = '${currentUserId || 0}')`), 'isSavedCount']
                ]
            }
        });

        const formattedPosts = posts.map(post => {
            const rawPost = post.get({ plain: true });
            return {
                ...rawPost,
                isLiked: rawPost.isLikedCount > 0,
                isSaved: rawPost.isSavedCount > 0,
                isLikedCount: undefined,
                isSavedCount: undefined
            };
        });

        res.status(200).json({
            success: true,
            visitedTrace: {
                id: visitedTrace.id,
                routeId: visitedTrace.routeId,
                communityId: visitedTrace.route.communityId
            },
            posts: formattedPosts
        });

    } catch (error) {
        console.error('Error fetching posts by visited trace:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch posts by visited trace",
            error: error.message 
        });
    }
};
// Get Posts By Route 
exports.getPostsByRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        const currentUserId = req.user ? req.user.userId : null;

        // 1. Récupérer le trajet et ses VisitedTraces (avec les Posts associés)
        const routeWithTracesAndPosts = await Route.findByPk(routeId, {
            include: [
                {
                    model: VisitedTrace,
                    as: 'visitedTraces',
                    attributes: ['id', 'longitude', 'latitude', 'createdAt'],
                    include: [{
                        model: Post,
                        as: 'posts', 
                        where: { isDeleted: false },
                        required: false, // Inclure les traces même sans post
                        include: [
                            { model: PostFile, as: 'postFiles' },
                            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] },
                            { model: Community, as: 'community', attributes: ['id', 'name'] },
                            { model: PostCategory, as: 'category', attributes: ['id', 'name', 'imageUrl'], required: false }
                        ],
                        attributes: {
                     include: [
                        [sequelize.literal(`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = \`visitedTraces->posts\`.\`id\`)`), 'likesCount'],
                        [sequelize.literal(`(SELECT COUNT(*) FROM comments WHERE comments.post_id = \`visitedTraces->posts\`.\`id\`)`), 'commentsCount'],
                        [sequelize.literal(`(SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id = \`visitedTraces->posts\`.\`id\`)`), 'sharesCount'],
                        [sequelize.literal(`(SELECT COUNT(*) FROM post_likes AS IsLiked WHERE IsLiked.post_id = \`visitedTraces->posts\`.\`id\` AND IsLiked.user_id = '${currentUserId || 0}')`), 'isLikedCount'],
                        [sequelize.literal(`(SELECT COUNT(*) FROM favorite_posts AS FavoritePost WHERE FavoritePost.post_id = \`visitedTraces->posts\`.\`id\` AND FavoritePost.user_id = '${currentUserId || 0}')`), 'isSavedCount']
                     ]
                        }
                    }],
                    order: [['createdAt', 'ASC']]
                },
                { model: Community, as: 'community', attributes: ['id', 'name'] }
            ]
        });

        if (!routeWithTracesAndPosts) {
            return res.status(404).json({ success: false, message: "Route not found" });
        }

        // 2. Formatter les données pour grouper les posts par VisitedTrace
        const formattedTraces = routeWithTracesAndPosts.visitedTraces.map(trace => {
            const rawTrace = trace.get({ plain: true });
            
            const formattedPosts = rawTrace.posts.map(post => {
                return {
                    ...post,
                    isLiked: post.isLikedCount > 0,
                    isSaved: post.isSavedCount > 0,
                    isLikedCount: undefined,
                    isSavedCount: undefined
                };
            });
            
            return {
                ...rawTrace,
                posts: formattedPosts
            };
        });
        
        // 3. Réponse finale
        res.status(200).json({
            success: true,
            route: {
                id: routeWithTracesAndPosts.id,
                community: routeWithTracesAndPosts.community,
                isLive: routeWithTracesAndPosts.isLive,
            },
            tracesWithPosts: formattedTraces
        });

    } catch (error) {
        console.error('Error fetching posts by route:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch posts by route",
            error: error.message 
        });
    }
};

exports.getUserPostsGroupedByCommunity = async (req, res) => {
    const targetUserId = req.user.userId; 
    const whereCondition = {
        userId: targetUserId,
        isDeleted: false,
        status: { [Op.in]: ['approved', 'pending'] } 
    };
    
    try {
        // 1. Récupérer TOUS les posts de l'utilisateur avec leurs relations
        const posts = await Post.findAll({
            where: whereCondition,
            order: [['createdAt', 'DESC']],
            include: [
                { model: PostFile, as: 'postFiles' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] },
                { model: Community, as: 'community', attributes: ['id', 'name'] }, 
                { model: PostCategory, as: 'category', attributes: ['id', 'name', 'imageUrl'], required: false }
            ],
            attributes: {
                include: [
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = Post.id)`), 'likesCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM comments WHERE comments.post_id = Post.id)`), 'commentsCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id = Post.id)`), 'sharesCount'],
                ]
            }
        });

        // 2. Formatage et regroupement par communauté
        const groupedPosts = {};

        posts.forEach(post => {
            const rawPost = post.get({ plain: true });
            
            // Le post DOIT avoir une communauté pour être groupé
            if (rawPost.community && rawPost.community.id) {
                const communityId = rawPost.community.id;
                
                // Initialisation de l'objet de communauté si c'est la première fois
                if (!groupedPosts[communityId]) {
                    groupedPosts[communityId] = {
                        community: rawPost.community,
                        posts: [],
                        count: 0
                    };
                }
                
                delete rawPost.community; // On enlève la communauté de l'objet post pour éviter la redondance
                
                groupedPosts[communityId].posts.push(rawPost);
                groupedPosts[communityId].count++;
            }
        });
        
        const formattedCommunities = Object.values(groupedPosts);

        res.status(200).json({
            success: true,
            totalPosts: posts.length,
            communities: formattedCommunities 
        });

    } catch (error) {
        console.error('Error fetching user posts grouped by community:', error);
        res.status(500).json({ 
            success: false, 
            message: "Échec de la récupération des publications de l'utilisateur groupées.", 
            error: error.message 
        });
    }
};


