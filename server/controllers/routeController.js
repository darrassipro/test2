const { Op } = require('sequelize');
const { Community, Route, VisitedTrace, Post, User } = require('../models'); 
const sequelize = Route.sequelize;

/**
 * UTILS INTERNES : Options d'inclusion pour obtenir un trajet complet
 */
const getRouteIncludeOptions = () => ({
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

    try {
        const newRoute = await Route.create({
            communityId,
            creatorUserId,
            isLive: isLive === 'true' || isLive === true, 
            publishDate: publishDate || null 
        });

        return res.status(201).json({
            success: true,
            message: "Trajet créé avec succès. Le tracé est en cours (Live Visibility: " + newRoute.isLive + ").",
            route: newRoute
        });

    } catch (error) {
        console.error("Erreur lors de la création du trajet:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la création du trajet.",
            error: error.message
        });
    }
};

// 2. Obtenir les trajets d’une communauté
exports.getRoutesByCommunity = async (req, res) => {
    const { communityId } = req.params;
    const { isLive, page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { communityId };

    // --- LOGIQUE DE FILTRAGE MISE À JOUR ---
    if (isLive !== undefined) {
        // Filtrer par isLive (visibilité en direct)
        where.isLive = isLive === 'true';
        // Si on demande isLive=false, on pourrait vouloir inclure uniquement ceux qui sont PUBLIÉS 
        // et non pas ceux qui sont en cours et cachés (brouillons)
        if (where.isLive === false) {
             where.publishDate = { [Op.ne]: null }; 
             where.publishDate = { [Op.lte]: new Date() }; 
        }
    } else {
        // Si aucun filtre n'est passé, on n'affiche que ceux qui sont LIVE OU ceux qui sont PUBLIÉS
        where[Op.or] = [
             { isLive: true }, // LIVE
             { publishDate: { [Op.ne]: null, [Op.lte]: new Date() } } // OU PUBLIÉ (même si isLive=false)
        ];
    }

    try {
        const result = await Route.findAndCountAll({
            where,
            attributes: [
                'id', 
                'communityId', 
                'isLive', 
                'publishDate', 
                'createdAt',
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
            delete plainRoute.visitedTraces; // Supprimer l'objet vide si l'association est LEFT JOIN
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
    const { id } = req.params;

    try {
        const route = await Route.findByPk(id, getRouteIncludeOptions());

        if (!route) {
            return res.status(404).json({ 
                success: false,
                message: "Trajet non trouvé." 
            });
        }

        // Simplification de la réponse pour le nombre de points
        const visitedPointsCount = route.visitedTraces ? route.visitedTraces.length : 0;
        const responseRoute = route.get({ plain: true });
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
    // req.route est attaché par le middleware checkRouteAccess('manage')
    const route = req.route; 
    const { isLive, publishDate } = req.body;

    if (!route) {
        return res.status(404).json({ 
            success: false,
            message: "Trajet non trouvé." });
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

    // Validation des coordonnées de base
    if (!longitude || !latitude) {
        return res.status(400).json({ 
            success: false,
            message: "Longitude et Latitude sont requises." 
        });
    }
    
    try {
        const route = await Route.findByPk(routeId, { attributes: ['id', 'isLive'] });

        if (!route) {
            return res.status(404).json({ 
                success: false,
                message: "Trajet non trouvé." 
            });
        }

        // Créer le VisitedTrace
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
    const { id } = req.params;
    
    try {
        const route = await Route.findByPk(id);

        if (!route) {
            return res.status(404).json({ 
                success: false,
                message: "Trajet non trouvé." 
            });
        }

        // Vérification si le trajet n'est pas déjà considéré comme publié/terminé
        // On considère qu'il est terminé s'il a déjà une date de publication.
        if (route.publishDate) {
             return res.status(400).json({ 
                 success: false,
                 message: "Le trajet est déjà terminé et publié." });
        }
        
        const updateFields = {
            isLive: false, // Arrêter la diffusion en direct (même s'il était déjà à false)
        };
        
        // Définir publishDate si non défini
        if (!route.publishDate) {
            updateFields.publishDate = new Date();
        }

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