const { Community, CommunityFile, CommunityMembership , User, Post, PostCategory, RCommCategory, CommCategory , Admin, PostFile, Product} = require('../models/index');
const { getUserRole } = require('../middleware/checkAdminRole');
const { deleteFile } = require('../config/cloudinary');
const sequelize = require('sequelize'); 
const { Op, literal } = require('sequelize');
/**
 * @description Créer une nouvelle communauté (Community) et associer les catégories et les fichiers.
 * @route POST /api/communities
 * @access Private (Utilisateur Authentifié)
 */
exports.createCommunity = async (req, res) => {
    const { name, description, isPremium, price, categoryIds } = req.body;
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
    const creatorUserId = req.user.userId; 
    if (!name || name.length < 3) {
        if (uploadedFiles && uploadedFiles.length > 0) {
            uploadedFiles.forEach(async (file) => {
                await deleteFile(file.filename).catch(e => console.error("Erreur de nettoyage Cloudinary:", e));
            });
        }
        return res.status(400).json({ 
            success: false, 
            message: "Le nom de la communauté est obligatoire et doit contenir au moins 3 caractères." 
        });
    }
    
    let finalIsPremium = (isPremium === 'true'); 
    let finalPrice = finalIsPremium ? (parseFloat(price) || 0) : 0;
    
    if (!finalIsPremium) {
        finalPrice = 0;
    }
    const communityData = {
        creatorUserId,
        name,
        description,
        isPremium: finalIsPremium,
        price: finalPrice,
    };
    let createdCommunity = null;
    let categoriesArray = [];
    
    if (categoryIds) {
        try {
            categoriesArray = JSON.parse(categoryIds);
            if (!Array.isArray(categoriesArray)) {
                throw new Error("Category IDs must be an array (JSON string).");
            }
        } catch (e) {
            categoriesArray = categoryIds.split(',').map(id => id.trim()).filter(id => id);
        }
    }
    try {
        createdCommunity = await Community.create(communityData);
        if (uploadedFiles && uploadedFiles.length > 0) {
            // Map roles sent in the form-data (multiple 'roles' fields) to uploaded files by index
            let rolesArray = [];
            if (req.body && req.body.roles) {
                if (Array.isArray(req.body.roles)) rolesArray = req.body.roles;
                else rolesArray = [req.body.roles];
            }
            const filesToCreate = uploadedFiles.map((file, index) => {
                const roleFromBody = rolesArray[index];
                const role = roleFromBody || file.role || 'gallery';
                return {
                    communityId: createdCommunity.id,
                    url: file.path || file.secure_url,
                    cloudinaryId: file.filename || file.public_id,
                    type: file.mimetype,
                    role: role,
                    isPrincipale: role === 'banner'
                };
            });
            await CommunityFile.bulkCreate(filesToCreate);
        }
        
        if (categoriesArray.length > 0) {
            const communityCategoriesData = categoriesArray.map(categoryId => ({
                communityId: createdCommunity.id,
                communityCategoryId: categoryId 
            }));
            await RCommCategory.bulkCreate(communityCategoriesData); 
        }
        await CommunityMembership.create({
            communityId: createdCommunity.id,
            userId: creatorUserId,
            isCreator: true 
        });
        // 4. Création de l'entrée Admin (Owner)
        await Admin.create({
            communityId: createdCommunity.id,
            userId: creatorUserId,
            role: 'owner' // L'utilisateur créateur est défini comme l'Owner
        });
        
        await createdCommunity.increment('totalMembers', { by: 1 });
        const communityWithFiles = await Community.findByPk(createdCommunity.id, {
            include: [
                {
                    model: CommunityFile,
                    as: 'communityFiles',
                    attributes: ['url', 'type', 'isPrincipale', 'role']
                },
                {
                    model: CommCategory,
                    as: 'categories', 
                    attributes: ['id', 'name','imageUrl']
                }
            ]
        });
        return res.status(201).json({
            success: true,
            message: "Communauté créée avec succès.",
            community: communityWithFiles
        });
    } catch (error) {
        if (uploadedFiles && uploadedFiles.length > 0) {
            uploadedFiles.forEach(async (file) => {
                await deleteFile(file.filename).catch(e => console.error("Erreur de nettoyage Cloudinary:", e));
            });
        }
        if (createdCommunity) {
            await Community.destroy({ where: { id: createdCommunity.id }, force: true }).catch(e => console.error("Erreur de nettoyage de la communauté DB:", e));
        }
        console.error("Erreur lors de la création de la communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la création de la communauté.",
            error: error.message
        });
    }
};
/**
 * @description Récupère la liste des membres d'une communauté
 * @route GET /api/communities/:id/members
 * @access Private (Utilisateur Authentifié)
 */
exports.getCommunityMembers = async (req, res) => {
    const communityId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    try {
        const { CommunityMembership, User } = require('../models/index');
        const { count, rows: memberships } = await CommunityMembership.findAndCountAll({
            where: { communityId },
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'profileImage']
                }
            ]
        });
        const members = memberships.map(m => {
            const u = m.user || {};
            return {
                id: u.id || null,
                firstName: u.firstName || null,
                lastName: u.lastName || null,
                profileImage: u.profileImage || null,
                joinedAt: m.createdAt
            };
        });
        const pagination = {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            pageSize: limit
        };
        return res.status(200).json({ success: true, members, pagination });
    } catch (error) {
        console.error('Erreur lors de la récupération des membres de la communauté:', error);
        return res.status(500).json({ success: false, message: 'Échec de la récupération des membres.', error: error.message });
    }
};
/**
 * @description Récupérer toutes les communautés actives avec pagination
 * @route GET /api/communities
 * @access Public (ou Private si nécessaire)
 */
exports.getAllCommunities = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const { count, rows: communities } = await Community.findAndCountAll({
            where: {
                isDeleted: false 
            },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']], 
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName', 'profileImage']
                },
                { 
                    model: CommunityFile,
                    as: 'communityFiles',
                    attributes: ['url', 'isPrincipale', 'role'],
                    limit: 10 // allow up to 10 files to get all roles
                }
            ],
            attributes: [
                'id', 'name', 'description', 'country', 'facebookLink', 'instagramLink', 'whatsappLink',
                'isVerified', 'totalMembers', 'totalPosts', 'totalProducts', 'isPremium', 'price'
            ]
        });
        const paginationInfos = {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            pageSize: limit
        };
        return res.status(200).json({
            success: true,
            communities: communities,
            paginationInfos: paginationInfos
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de toutes les communautés:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération de toutes les communautés.",
            error: error.message
        });
    }
};
/**
 * @description Récupérer les détails d'une communauté par ID (avec gestion de l'adhésion)
 * @route GET /api/communities/:id
 * @access Private (Utilisateur Authentifié)
 */
exports.getCommunity = async (req, res) => {
    const community = req.community; 
    const isUserMemberShip = req.isUserMemberShip;
    const communityId = community?.id;
    const userId = req.user?.userId;
    console.log('GET /api/communities/:id called', {
        paramsId: req.params.id,
        resolvedCommunityId: communityId,
        user: req.user ? { id: req.user.userId } : null,
        isUserMemberShip
    });
    try {
        const totalPostsCount = await Post.count({
            where: { communityId: communityId }
        });
        
          const totalProductsCount = await Product.count({ 
              where: { communityId: communityId } 
          });
        const communityInformations = await Community.findByPk(communityId, {
            attributes: [
                                'id', 'name', 'description', 'country', 'facebookLink', 'instagramLink', 'whatsappLink',
                'isVerified', 'totalMembers', 'totalPosts', 'totalProducts', 'isPremium', 'price', 'createdAt'
            ],
            include: [
                { 
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName','lastName', 'profileImage']
                },
                { 
                    model: CommunityFile,
                    as: 'communityFiles',
                    attributes: ['url', 'type', 'isPrincipale', 'role']
                }
            ]
        });
        const communityData = communityInformations.get({ plain: true });
        communityData.totalPosts = totalPostsCount;
        communityData.totalProducts = totalProductsCount;
         await Community.update(
             { totalPosts: totalPostsCount },
             { where: { id: communityId } }
         );
         await Community.update(
    { totalProducts: totalProductsCount },
    { where: { id: communityId } }
);

        if (!isUserMemberShip) {
            // For non-members, show only public posts
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const { PostLike } = require('../models/index');
            const { count, rows: publicPosts } = await Post.findAndCountAll({
                where: { 
                    communityId: communityId,
                    status: 'approved',
                    isVisibleOutsideCommunity: true,
                    isDeleted: false
                },
                limit: limit,
                offset: offset,
                order: [['createdAt', 'DESC']],
                include: [ 
                    { model: User, as: 'user', attributes: ['id', 'firstName','lastName', 'profileImage'] },
                    { model: PostCategory, as: 'category', attributes: ['id', 'name'] },
                    { model: require('../models/index').PostFile, as: 'postFiles', attributes: ['url', 'type'] },
                    { model: PostLike, as: 'likedBy', attributes: ['userId'] },
                ]
            });

            const files = communityInformations.communityFiles.map(file => ({
                url: file.url,
                type: file.type,
                isPrincipale: file.isPrincipale
            }));
            // Get current userId from request (null for non-members)
            const currentUserId = req.user ? req.user.userId : null;

            // Map posts to add like count and isLiked
            const postsWithLikes = publicPosts.map(post => {
                const plain = post.get({ plain: true });
                const likes = plain.likedBy ? plain.likedBy.length : 0;
                const isLiked = currentUserId ? plain.likedBy.some(like => like.userId === currentUserId) : false;
                return {
                    ...plain,
                    likes,
                    isLiked
                };
            });

            const paginationInfos = {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            };

            return res.status(200).json({
                success: true,
                communityInformations: communityData,
                communityPosts: postsWithLikes,
                paginationInfos: paginationInfos,
                isUserMemberShip: false,
                userRole: null
            });
        } else {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const offset = (page - 1) * limit;
                // Determine user role in this community to decide which posts to include
                let userRole = null;
                try {
                    userRole = await getUserRole(communityId, userId);
                } catch (e) {
                    console.warn('Could not determine user role for community posts filtering', e);
                }
                // If user is owner/admin/moderator, include all statuses; otherwise only approved
                const postWhere = { communityId: communityId };
                if (!userRole || !['owner', 'admin', 'moderator'].includes(userRole)) {
                    postWhere.status = 'approved';
                }
                const { PostLike } = require('../models/index');
                const { count, rows: communityPosts } = await Post.findAndCountAll({
                    where: postWhere,
                    limit: limit,
                    offset: offset,
                    order: [['createdAt', 'DESC']],
                    include: [ 
                        { model: User, as: 'user', attributes: ['id', 'firstName','lastName', 'profileImage'] },
                        { model: PostCategory, as: 'category', attributes: ['id', 'name'] },
                        { model: require('../models/index').PostFile, as: 'postFiles', attributes: ['url', 'type'] },
                        { model: PostLike, as: 'likedBy', attributes: ['userId'] },
                    ]
                });
                // Get current userId from request
                const currentUserId = req.user ? req.user.userId : null;
                // Map posts to add like count and isLiked
                const postsWithLikes = communityPosts.map(post => {
                    const plain = post.get({ plain: true });
                    const likes = plain.likedBy ? plain.likedBy.length : 0;
                    const isLiked = currentUserId ? plain.likedBy.some(like => like.userId === currentUserId) : false;
                    return {
                        ...plain,
                        likes,
                        isLiked
                    };
                });
            const paginationInfos = {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            };
            
            //delete infoWithoutFiles.communityFiles; 
            console.log('Returning community with posts', { communityId, postsCount: communityPosts.length });
            return res.status(200).json({
                success: true,
                communityInformations: communityData,
                communityPosts: postsWithLikes,
                paginationInfos: paginationInfos,
                isUserMemberShip: true,
                userRole: userRole || null
            });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de la communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des détails de la communauté.",
            error: error.message
        });
    }
};
/**
 * @description Mettre à jour une communauté existante
 * @route PUT /api/communities/:id
 * @access Private (Seul le créateur peut mettre à jour)
 */
exports.updateCommunity = async (req, res) => {
    const communityId = req.params.id;
const { name, description, country, facebookLink, instagramLink, whatsappLink, isPremium, price, filesToDelete, principalFileId } = req.body;    const { images, videos, audios, virtualTours } = req.files || {};
    const userId = req.user.userId;
    const allUploadedFiles = [];
if (images) allUploadedFiles.push(...images);
if (videos) allUploadedFiles.push(...videos);
if (audios) allUploadedFiles.push(...audios);
if (virtualTours) allUploadedFiles.push(...virtualTours);
    let newPublicIds = allUploadedFiles.map(f => f.filename);
    try {
        const community = await Community.findOne({
            where: { 
                id: communityId, 
                isDeleted: false 
            }
        });
        if (!community) {
            return res.status(404).json({ success: false, message: "Communauté non trouvée." });
        }
        
        if (community.creatorUserId !== userId) {
            return res.status(403).json({ success: false, message: "Accès refusé. Seul le créateur peut modifier la communauté." });
        }
        let updateData = {};
        if (name && name.length >= 3) updateData.name = name;
        if (description !== undefined) updateData.description = description;
                if (country !== undefined) updateData.country = country;
        if (facebookLink !== undefined) updateData.facebookLink = facebookLink;
        if (instagramLink !== undefined) updateData.instagramLink = instagramLink;
        if (whatsappLink !== undefined) updateData.whatsappLink = whatsappLink;
        if (isPremium !== undefined) {
            const finalIsPremium = (isPremium === 'true');
            let finalPrice = finalIsPremium ? (parseFloat(price) || 0) : 0;
            
            updateData.isPremium = finalIsPremium;
            updateData.price = finalPrice;
        }
        if (Object.keys(updateData).length > 0) {
            await community.update(updateData);
        }
        let filesToDeleteArray = [];
        if (filesToDelete) {
            try {
                filesToDeleteArray = JSON.parse(filesToDelete);
            } catch (e) {
                filesToDeleteArray = filesToDelete.split(',').map(id => id.trim());
            }
        }
        if (filesToDeleteArray.length > 0) {
            const deletedFiles = await CommunityFile.findAll({
                where: {
                    communityId: communityId,
                    id: { [Op.in]: filesToDeleteArray }
                }
            });
            for (const file of deletedFiles) {
                await deleteFile(file.cloudinaryId).catch(e => console.warn(`Avertissement: Échec de la suppression Cloudinary ID ${file.cloudinaryId}`, e));
                await file.destroy();
            }
        }
        
        if (allUploadedFiles && allUploadedFiles.length > 0) {
            // Map optional roles sent alongside uploads when updating
            let rolesArray = [];
            if (req.body && req.body.roles) {
                if (Array.isArray(req.body.roles)) rolesArray = req.body.roles;
                else rolesArray = [req.body.roles];
            }
            const filesToCreate = allUploadedFiles.map((file, index) => ({
                communityId: communityId,
                url: file.path,
                cloudinaryId: file.filename,
                type: file.mimetype,
                role: rolesArray[index] || 'gallery',
                isPrincipale: (rolesArray[index] === 'banner') || false
            }));
            await CommunityFile.bulkCreate(filesToCreate);
        }
        if (principalFileId) {
            await CommunityFile.update({ isPrincipale: false }, {
                where: { communityId: communityId }
            });
            await CommunityFile.update({ isPrincipale: true }, {
                where: { id: principalFileId, communityId: communityId }
            });
        }
        const updatedCommunity = await Community.findByPk(communityId, {
             include: [
                { model: CommunityFile, as: 'communityFiles', attributes: ['url', 'type', 'isPrincipale', 'id', 'role'] },
                { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'profileImage'] }
            ]
        });
        return res.status(200).json({
            success: true,
            message: "Communauté mise à jour avec succès.",
            community: updatedCommunity
        });
    } catch (error) {
        if (newPublicIds && newPublicIds.length > 0) {
        newPublicIds.forEach(async (publicId) => {
            await deleteFile(publicId).catch(e => console.error("Erreur de nettoyage Cloudinary:", e));
        });
    }
        console.error("Erreur lors de la mise à jour de la communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la mise à jour de la communauté.",
            error: error.message
        });
    }
};
exports.deleteCommunity = async (req, res) => {
    const communityId = req.params.id;
    const userId = req.user.userId;
    try {
        const community = await Community.findOne({
            where: { id: communityId, isDeleted: false } 
        });
        
        if (!community) {
            return res.status(404).json({ success: false, message: "Communauté non trouvée ou déjà supprimée." });
        }
        
        if (community.creatorUserId !== userId) {
            return res.status(403).json({ success: false, message: "Accès refusé. Seul le créateur peut supprimer la communauté." });
        }
        const filesToDelete = await CommunityFile.findAll({
            where: { communityId: communityId }
        });
        
        for (const file of filesToDelete) {
       
             await deleteFile(file.cloudinaryId).catch(e => console.warn(`Avertissement: Échec suppression Cloudinary ID ${file.cloudinaryId}`, e));
             await file.destroy({ force: true });
        }
        
        await CommunityMembership.destroy({ 
            where: { communityId: communityId },
            force: true 
        });
        
        const [updatedRows] = await Community.update(
            { isDeleted: true },
            { where: { id: communityId } }
        );
        if (updatedRows === 0) {
            return res.status(404).json({ success: false, message: "Échec de la suppression de la communauté dans la DB." });
        }
        return res.status(200).json({
            success: true,
            message: "Communauté masquée (isDeleted: true) avec succès. Fichiers et adhésions supprimés définitivement."
        });
    } catch (error) {
        console.error("Erreur lors de la suppression (soft) de la communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la suppression de la communauté.",
            error: error.message
        });
    }
};
/**
 * @description Récupère les communautés auxquelles l'utilisateur n'est pas encore membre.
 * @route GET /api/communities/not-joined
 * @access Private (Utilisateur Authentifié)
 */
exports.getCommunitiesNotJoined = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const userId = req.user.userId; 
    try {
        const userJoinedCommunityIds = await CommunityMembership.findAll({
            where: { userId: userId },
            attributes: ['communityId'],
            raw: true, 
        }).then(memberships => memberships.map(m => m.communityId));
        const whereCondition = {
            isDeleted: false,
            id: { [Op.notIn]: userJoinedCommunityIds }
        };
        const { count, rows: communities } = await Community.findAndCountAll({
            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [['totalMembers', 'DESC']], 
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'firstName', 'lastName', 'profileImage']
                },
                { 
                    model: CommunityFile,
                    as: 'communityFiles',
                    attributes: ['url', 'role'], // Fetch all files, not just principal
                    required: false 
                }
            ],
            attributes: [
                                'id', 'name', 'description', 'country', 'facebookLink', 'instagramLink', 'whatsappLink',
                'isVerified', 'totalMembers', 'totalPosts', 'totalProducts', 'isPremium', 'price'
            ]
        });
        const paginationInfos = {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            pageSize: limit
        };
        return res.status(200).json({
            success: true,
            communities: communities,
            paginationInfos: paginationInfos
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des communautés non-jointes:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des communautés non-jointes.",
            error: error.message
        });
    }
};
/**
 * @description Joindre une communauté
 * @route POST /api/communities/:id/join
 * @access Private
 */
exports.joinCommunity = async (req, res) => {
    // Support UUID or numeric IDs — keep the raw param and use it directly
    const communityId = req.params.id;
    const userId = req.user.userId;
    try {
        console.log(`Join request: userId=${userId}, communityId=${communityId}`);
        // Check community exists
        const community = await Community.findOne({ where: { id: communityId, isDeleted: false } });
        console.log('DB lookup for community returned:', !!community, community && { id: community.id, name: community.name });
        if (!community) {
            return res.status(404).json({ success: false, message: 'Communauté introuvable.' });
        }
        // Check if already member
        const existing = await CommunityMembership.findOne({ where: { communityId: communityId, userId: userId } });
        if (existing) {
            return res.status(200).json({ success: true, message: 'Vous êtes déjà membre de cette communauté.' });
        }
        // Create membership
        await CommunityMembership.create({ communityId: communityId, userId: userId, isCreator: false });
        await community.increment('totalMembers', { by: 1 });
        return res.status(201).json({ success: true, message: 'Adhésion réussie.' });
    } catch (error) {
        console.error('Erreur lors de l\'adhésion à la communauté:', error);
        return res.status(500).json({ success: false, message: 'Échec de l\'adhésion.', error: error.message });
    }
};
/**
 * @description Récupère les communautés dont l'utilisateur authentifié est membre.
 * @route GET /api/communities/user-joined
 * @access Private (Utilisateur Authentifié)
 */
exports.getUserCommunities = async (req, res) => {
    const userId = req.user.userId; 
    
    try {
        // 1. Trouver toutes les adhésions de l'utilisateur
        const memberships = await CommunityMembership.findAll({
            where: { userId: userId },
            attributes: ['communityId'],
            raw: true
        });
        const communityIds = memberships.map(m => m.communityId);
        if (communityIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "L'utilisateur n'est membre d'aucune communauté.",
                communities: []
            });
        }
        // 2. Récupérer les informations minimales des communautés
        const communities = await Community.findAll({
            where: {
                id: { [Op.in]: communityIds },
                isDeleted: false 
            },
            order: [['totalMembers', 'DESC']], 
            include: [
                {
                    model: CommunityFile,
                    as: 'communityFiles',
                    attributes: ['url', 'role'],
                    required: false
                }
            ],
            attributes: [
                'id', 
                'name', 
                'totalMembers' 
            ]
        });
        // 3. Formater la réponse pour correspondre au besoin de l'UI (Nom + Profil + Membres)
        const formattedCommunities = communities.map(community => {
            const file = community.communityFiles && community.communityFiles.length > 0
                ? community.communityFiles[0]
                : { url: null };
            const profileImage = community.communityFiles.find(f => f.role === 'avatar') || file;
            const bannerImage = community.communityFiles.find(f => f.role === 'banner');
            return {
                id: community.id,
                name: community.name,
                totalMembers: community.totalMembers,
                profileImage: profileImage.url, // Utilisation de l'URL du fichier principal
                bannerImage: bannerImage ? bannerImage.url : null
            };
        });
        return res.status(200).json({
            success: true,
            communities: formattedCommunities
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des communautés membres:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des communautés dont l'utilisateur est membre.",
            error: error.message
        });
    }
};
/**
 * @description Récupérer toutes les publications publiques d'une communauté donnée.
 * @route GET /api/communities/:id/posts/public?page=1&limit=10
 * @access Public/Private (Requiert checkPostAccess pour vérifier l'existence de la communauté)
 */
exports.getPublicPostByCommunity = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const currentUserId = req.user ? req.user.userId : null;
        
        const communityId = req.params.id; 
        let whereCondition = { 
            communityId: communityId,
            isDeleted: false,
            status: 'approved', 
            isVisibleOutsideCommunity: true 
        };
        const { count, rows: posts } = await Post.findAndCountAll({
            where: whereCondition,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']], 
            
            include: [
                { model: PostFile, as: 'postFiles', attributes: ['url', 'type'] },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'profileImage', 'isVerified'] },
                { model: Community, as: 'community', attributes: ['id', 'name'] }, 
                { model: PostCategory, as: 'category', attributes: ['id', 'name', 'imageUrl'], required: false }
            ],
            
            attributes: {
                include: [
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = Post.id)`), 'likesCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM comments WHERE comments.post_id = Post.id)`), 'commentsCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_shares WHERE post_shares.post_id = Post.id)`), 'sharesCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM post_likes AS IsLiked WHERE IsLiked.post_id = Post.id AND IsLiked.user_id = '${currentUserId || 0}')`), 'isLikedCount'],
                    [sequelize.literal(`(SELECT COUNT(*) FROM favorite_posts AS FavoritePost WHERE FavoritePost.post_id = Post.id AND FavoritePost.user_id = '${currentUserId || 0}')`), 'isSavedCount']
                ]
            },
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
            communityId: communityId,
            totalPosts: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            posts: formattedPosts
        });
    } catch (error) {
        console.error('Error fetching public community posts:', error);
        res.status(500).json({ success: false, message: "Échec de la récupération des publications publiques.", error: error.message });
    }
};