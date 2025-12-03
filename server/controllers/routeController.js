const { Op } = require('sequelize');
const { Community, Route, VisitedTrace, Post, User, CommunityMembership } = require('../models'); 
const sequelize = Route.sequelize;
const { getUserRole } = require("../middleware/checkAdminRole"); 


/**
 * UTILS INTERNES : Options d'inclusion pour obtenir un trajet complet
 */
const getRouteIncludeOptions = (currentUserId) => ({
    include: [
        {
            model: VisitedTrace,
            as: 'visitedTraces',
            attributes: ['id', 'longitude', 'latitude', 'createdAt'],
            include: [{
                model: Post,
                as: 'posts',
                attributes: ['id', 'contentType', 'title', 'description', 'createdAt']
            }]
        },
        {
            model: Community,
            as: 'community',
            attributes: ['id', 'name'],
            include: [{
                model: User,
                as: 'creator', 
                attributes: ['id', 'firstName', 'lastName', 'profileImage']
            }]
        }
    ]
});

// 1. Créer un nouveau trajet
exports.createRoute = async (req, res) => {

    const creatorUserId = req.user.userId;
    const communityId = req.params.communityId || req.body.communityId; 
    const { isLive, publishDate } = req.body;

    if (!communityId) {
        return res.status(400).json({ 
            success: false,
            message: "ID de la communauté manquant." 
        });
    }

    const t = await sequelize.transaction();

    try {
        const community = await Community.findByPk(communityId, { attributes: ['creatorUserId'] });
        if (!community) {
            await t.rollback();
            return res.status(404).json({ success: false, message: "Communauté non trouvée." });
        }

        const isCreator = community.creatorUserId === creatorUserId; 
        const isMemberRecord = await CommunityMembership.findOne({
            where: { communityId: communityId, userId: creatorUserId }, 
            transaction: t
        });
        
        const isMember = !!isMemberRecord; 
        const userRole = await getUserRole(communityId, creatorUserId); 
        const isAdminOrMod = userRole && ['owner', 'admin'].includes(userRole); 
        if (!isCreator && !isMember && !isAdminOrMod) {
            await t.rollback();
            return res.status(403).json({
                success: false,
                message: "Il faut être membre ou créateur ou administrateur de la communauté pour créer un route."
            });
        }
        
        let routeStatus = 'pending'; 
        let publicationDate = null; 
        
        if (isCreator || isAdminOrMod) {
            routeStatus = 'approved';
            publicationDate = publishDate || new Date(); 
        } else {
            routeStatus = 'pending';
        }

        const newRoute = await Route.create({
            communityId,
            creatorUserId,
            isLive: isLive === 'true' || isLive === true,
            status: routeStatus,
            publishDate: publicationDate, 
        }, { transaction: t }); 

        await t.commit();
        return res.status(201).json({
            success: true,
            message: `Trajet créé avec succès. Statut initial: ${newRoute.status}.`,
            route: newRoute
        });

    } catch (error) {
        if (t && t.finished !== 'commit' && t.finished !== 'rollback') {
            await t.rollback(); 
        }
        console.error("Erreur lors de la création du trajet:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la création du trajet.",
            error: error.message
        });
    }
};
exports.approvePendingRoute = async (req, res) => {
    const t = await sequelize.transaction();
    const currentUserId = req.user.userId;
    try {
        const { routeId, communityId } = req.params;
        const route = await Route.findOne({
            where: { id: routeId,communityId: communityId, status: 'pending' },
            transaction: t
        });

        if (!route) {
            await t.rollback();
            return res.status(404).json({ 
                success: false, 
                message: "Pending route not found or already approved/rejected" 
            });
        }
        
        await route.update({ 
            status: 'approved',
            publicationDate: new Date(), 
        }, { transaction: t });
        
        await t.commit();

        const updatedRoute = await Route.findByPk(routeId, getRouteIncludeOptions(currentUserId))

        res.status(200).json({
            success: true,
            message: "Route approved and published successfully!",
            product: updatedRoute
        });

    } catch (error) {
        if (t && t.finished !== 'commit') { 
            await t.rollback();
        }
        console.error('Error approving pending route:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to approve and publish route", 
            error: error.message 
        });
    }
};

exports.rejectPendingRoute = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { routeId, communityId } = req.params;
        
        const [updatedRows] = await Route.update(
            { status: 'rejected' }, 
            { 
                where: { id: routeId,communityId: communityId, status: 'pending' },
                transaction: t
            }
        );

        if (updatedRows === 0) {
            await t.rollback();
            return res.status(404).json({ 
                success: false, 
                message: "Pending route not found or already approved/rejected" 
            });
        }
        
        await t.commit();

        res.status(200).json({
            success: true,
            message: "Route rejected successfully. It will no longer be visible.",
        });

    } catch (error) {
        if (t && t.finished !== 'commit') { 
            await t.rollback();
        }
        console.error('Error rejecting pending route:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to reject route", 
            error: error.message 
        });
    }
};

// 2. Obtenir les trajets d’une communauté
exports.getRoutesByCommunity = async (req, res) => {
    const { communityId } = req.params;
    const { isLive, page = 1, limit = 10 } = req.query;
    const creatorUserId = req.user.userId; 

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { communityId };

    try {
        // 1. Déterminer le rôle de l'utilisateur
        const community = await Community.findByPk(
            communityId, 
            { attributes: ['creatorUserId'] }
        );
        if (!community) {
             return res.status(404).json({ 
                success: false,
                message: "Communauté non trouvée."
            });
        }
        const isCommunityOwner = community.creatorUserId === creatorUserId;
        const userRole = await getUserRole(communityId, creatorUserId);
        const isAdminOrMod = userRole && ['owner', 'admin'].includes(userRole);
        
        // 2. Logique de statut : Les utilisateurs normaux voient uniquement les trajets 'approved'
        if (!isCommunityOwner && !isAdminOrMod) {
            where.status = 'approved'; 
        }
        
        // --- LOGIQUE DE FILTRAGE MISE À JOUR (isLive) ---
        // S'applique aux APPROVED routes ou aux routes vues par les admins/créateurs
        if (isLive !== undefined) {
            where.isLive = isLive === 'true';
            
            if (where.isLive === false) {
                 // Si on demande isLive=false, on inclut ceux qui sont PUBLIÉS
                 where.publishDate = { [Op.ne]: null, [Op.lte]: new Date() }; 
            }
        } else {
            // Si aucun filtre n'est passé, on n'affiche que ceux qui sont LIVE OU ceux qui sont PUBLIÉS
            where[Op.or] = [
                 { isLive: true }, // LIVE
                 { publishDate: { [Op.ne]: null, [Op.lte]: new Date() } } // OU PUBLIÉ (même si isLive=false)
            ];
        }

        const result = await Route.findAndCountAll({
            where,
            attributes: [
                'id', 
                'communityId', 
                'isLive', 
                'publishDate', 
                'createdAt',
                'status', // Ajout du status
                [sequelize.fn('COUNT', sequelize.col('visitedTraces.id')), 'visitedPointsCount']
            ],
            include: [{
                model: VisitedTrace,
                as: 'visitedTraces',
                attributes: [], 
                duplicating: false,
                required: false 
            }],
            group: ['Route.id'], 
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']] 
        });

        const totalItems = result.count.length; 
        const routes = result.rows.map(route => {
            const visitedPointsCount = route.dataValues.visitedPointsCount || 0;
            const plainRoute = route.get({ plain: true });
            delete plainRoute.visitedTraces; 
            return {
                ...plainRoute,
                visitedPointsCount: parseInt(visitedPointsCount)
            };
        });

        return res.status(200).json({
            success: true,
            routes,
            paginationInfos: {
                totalItems: totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page),
                pageSize: parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des trajets de la communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des trajets.",
            error: error.message
        });
    }
};

// 3. Obtenir un trajet par ID
exports.getRouteById = async (req, res) => {
    const currentUserId = req.user.userId;
    const { id } = req.params;

    try {
        const minimalRoute = await Route.findByPk(id, {
            attributes: ['id', 'creatorUserId', 'communityId', 'status'], 
            include: [{
                model: Community,
                as: 'community',
                attributes: ['creatorUserId'] 
            }]
        });

        if (!minimalRoute) {
            return res.status(404).json({ 
                success: false,
                message: "Trajet non trouvé." 
            });
        }
        const isRouteCreator = minimalRoute.creatorUserId === currentUserId;
        const communityId = minimalRoute.communityId;
        const userRole = await getUserRole(communityId, currentUserId);
        const isAdminOrOwner = userRole && ['owner', 'admin'].includes(userRole);

        let whereCondition = { id };

        const canViewDrafts = isRouteCreator || isAdminOrOwner;

        if (!canViewDrafts) {
            // Si l'utilisateur n'est NI créateur, NI Admin/Owner, la route DOIT être approuvée
            whereCondition.status = 'approved'; 
        }
        
       const fullRoute = await Route.findOne({
            where: whereCondition,
            ...getRouteIncludeOptions(currentUserId) 
        });
        if (!fullRoute) {
            return res.status(404).json({
                success: false,
                message: "Trajet non trouvé ou vous n'avez pas l'autorisation de le voir."
            });
        }
       
        const visitedPointsCount = fullRoute.visitedTraces ? fullRoute.visitedTraces.length : 0;
        const responseRoute = fullRoute.get({ plain: true });
        responseRoute.visitedPointsCount = visitedPointsCount;
        
        return res.status(200).json({
            success: true,
            route: responseRoute
        });

        } catch (error) {
        console.error("Erreur lors de la récupération du trajet par ID:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération du trajet.",
            error: error.message
        });
    }
};

// 4. Mettre à jour un trajet (Patch)
exports.updateRoute = async (req, res) => {
    const route = req.route; 
    const { isLive, publishDate } = req.body;

    if (!route) {
        return res.status(404).json({ 
            success: false,
            message: "Trajet non trouvé." });
    }
    if (route.status === 'rejected') {
        return res.status(403).json({ 
            success: false,
            message: "Impossible de mettre à jour un trajet qui a été rejeté." 
        });
    }

    try {
        const updatedRoute = await route.update({
            isLive: isLive !== undefined ? (isLive === 'true' || isLive === true) : route.isLive,
            publishDate: publishDate !== undefined ? (publishDate || null) : route.publishDate
        });

        return res.status(200).json({
            success: true,
            message: "Trajet mis à jour avec succès.",
            route: updatedRoute
        });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du trajet:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la mise à jour du trajet.",
            error: error.message
        });
    }
};

// 5. Supprimer un trajet
exports.deleteRoute = async (req, res) => {
    const route = req.route; 
    const t = await sequelize.transaction();

    if (!route) {
        await t.rollback();
        return res.status(404).json({ 
            success: false,
            message: "Trajet non trouvé." 
        });
    }
    
    try {
        const routeId = route.id;
        await Post.update(
            { visitedTraceId: null },
            { 
                where: { visitedTraceId: { [Op.in]: sequelize.literal(`(SELECT id FROM visited_traces WHERE route_id = '${routeId}')`) } },
                transaction: t
            }
        );

        await route.destroy({ transaction: t });

        await t.commit();

        return res.status(200).json({
            success: true,
            message: "Trajet supprimé avec succès."
        });

    } catch (error) {
        await t.rollback();
        console.error("Erreur lors de la suppression du trajet:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la suppression du trajet.",
            error: error.message
        });
    }
};

// 6. Ajouter un point visité (Tracé)
exports.addVisitedTrace = async (req, res) => {
    const { id: routeId } = req.params;
    const { longitude, latitude } = req.body;
    const currentUserId = req.user.userId; 

    if (!longitude || !latitude) {
        return res.status(400).json({ 
            success: false,
            message: "Longitude et Latitude sont requises." 
        });
    }
    
    try {
        const route = await Route.findByPk(
            routeId,
            { attributes: 
                [
                    'id', 'isLive', 'status', 'creatorUserId', 'communityId'
                ]
            });

        if (!route) {
            return res.status(404).json({ 
                success: false,
                message: "Trajet non trouvé." 
            });
        }
        // 1. Vérification des permissions
        const isRouteCreator = route.creatorUserId === currentUserId;
        const userRole = await getUserRole(route.communityId, currentUserId);
        const isAdminOrOwner = userRole && ['owner', 'admin'].includes(userRole);

        // 2. Logique de statut : Seuls les APPROVED et les routes éditables peuvent recevoir des traces
        if (route.status === 'rejected') {
             return res.status(403).json({
                success: false,
                message: "Impossible d'ajouter des traces à un trajet rejeté."
            });
        }
        
        // Si la route est 'pending' et que l'utilisateur n'est PAS créateur/admin/owner, refuser.
        // Les admins/créateurs peuvent ajouter des traces en 'pending' (pour l'édition).
        if (route.status === 'pending' && !isRouteCreator && !isAdminOrOwner) {
            return res.status(403).json({ 
                success: false,
                message: "Le trajet est en attente d'approbation et n'est pas modifiable par cet utilisateur."
            });
        }

        const newTrace = await VisitedTrace.create({
            routeId,
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude)
        });

        return res.status(201).json({
            success: true,
            message: "Point de tracé ajouté avec succès.",
            trace: newTrace
        });

    } catch (error) {
        console.error("Erreur lors de l'ajout du point de tracé:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de l'ajout du point de tracé.",
            error: error.message
        });
    }
};

// 7. Obtenir tous les points d’un trajet (Format Carte)
exports.getRouteTrace = async (req, res) => {
    const { id: routeId } = req.params;

    try {
        const traces = await VisitedTrace.findAll({
            where: { routeId },
            attributes: ['longitude', 'latitude', 'createdAt'],
            order: [['createdAt', 'ASC']] 
        });
        // Format adapté pour l'affichage sur carte 
        const coordinates = traces.map(trace => ({
            longitude: parseFloat(trace.longitude),
            latitude: parseFloat(trace.latitude)
        }));

        return res.status(200).json({
            success: true,
            routeId,
            coordinates,
            totalPoints: coordinates.length
        });

    } catch (error) {
        console.error("Erreur lors de la récupération du tracé:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération du tracé.",
            error: error.message
        });
    }
};

// 8. Terminer un trajet
exports.endRoute = async (req, res) => {
    const route = req.route;

        if (!route) {
            return res.status(404).json({ 
                success: false,
                message: "Trajet non trouvé." 
            });
        }

    try {
        if (route.status === 'rejected') {
            return res.status(403).json({
                success: false,
                message: "Impossible de terminer un trajet rejeté."
            });
        }
        // Vérification si le trajet n'est pas déjà considéré comme publié/terminé
        // On considère qu'il est terminé s'il a déjà une date de publication.
        if (route.publishDate) {
             return res.status(400).json({ 
                 success: false,
                 message: "Le trajet est déjà terminé et publié." });
        }
        if (route.status === 'pending') {
            return res.status(403).json({
                success: false,
                message: "Le trajet est en attente d'approbation et ne peut pas être terminé avant d'être approuvé."
            });
        }
        
        const updateFields = {
            isLive: false, // Arrêter la diffusion en direct (même s'il était déjà à false)
            publishDate: new Date(),
        };

        const updatedRoute = await route.update(updateFields);

        return res.status(200).json({
            success: true,
            message: "Trajet terminé et publié (isLive: false).",
            route: updatedRoute
        });

    } catch (error) {
        console.error("Erreur lors de la terminaison du trajet:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la terminaison du trajet.",
            error: error.message
        });
    }
};