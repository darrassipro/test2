const { Op } = require('sequelize');
const { Community, Product, ProductImage, ProductFile, ProductCategory, User , Rating} = require('../models');
const sequelize = Product.sequelize; 
const { deleteMultipleFiles } = require('../config/cloudinary'); 

/**
 * UTILS INTERNES : Options d'inclusion pour récupérer le produit complet
 */
const getProductIncludeOptions = () => ({
    include: [
        { 
            model: ProductImage, 
            as: 'productImages', 
            attributes: ['id', 'url', 'cloudinaryId', 'isPrincipal'] 
        },
        { 
            model: ProductFile, 
            as: 'productFiles', 
            attributes: ['id', 'url', 'cloudinaryId', 'title', 'isVideo', 'time'] 
        },
        { 
            model: Community, 
            as: 'community', 
            attributes: ['id', 'name', 'totalProducts'] 
        },
        { 
            model: ProductCategory, 
            as: 'category', 
            attributes: ['id', 'name'] 
        },
        { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'firstName', 'lastName'] 
        },
    ]
});
 
exports.createProduct = async (req, res) => {
    // communityId vient du paramètre ou du body, déjà vérifié par le middleware
    const communityId = req.params.communityId || req.body.communityId; 
    const { title, description, price, categoryId, type, isFree } = req.body;
    const userId = req.user.userId; 

    if (!title || !price || !communityId || !type) {
        return res.status(400).json({ 
            success: false,
            message: "Les champs requis (titre, prix, type) sont manquants." 
        });
    }

    const t = await sequelize.transaction();
    let uploadedPublicIds = [];

    try {
        const newProduct = await Product.create({
            communityId,
            userId,
            title,
            description,
            price: parseFloat(price),
            categoryId,
            type, 
            isFree: isFree === 'true' || isFree === true
        }, { transaction: t });
        
        const productId = newProduct.id;

        // Gestion des Images (req.files.images)
        if (req.files && req.files.images) {
            const imageRecords = req.files.images.map(file => {
                uploadedPublicIds.push(file.filename);
                return {
                    productId,
                    url: file.path,
                    cloudinaryId: file.filename,
                    isPrincipal: false, 
                    type: file.mimetype
                };
            });
            await ProductImage.bulkCreate(imageRecords, { transaction: t });
        }

        // Gestion des Fichiers/Vidéos (req.files.files)
        if (req.files && req.files.files) {
            const fileRecords = req.files.files.map(file => {
                uploadedPublicIds.push(file.filename);
                return {
                    productId,
                    url: file.path,
                    cloudinaryId: file.filename,
                    title: file.originalname, 
                    isVideo: file.mimetype.startsWith('video'),
                    type: file.mimetype
                };
            });
            await ProductFile.bulkCreate(fileRecords, { transaction: t });
        }

        // Incrémenter totalProducts de la Communauté
        await Community.increment('totalProducts', { 
            where: { id: communityId },
            transaction: t 
        });

        await t.commit();

        const productWithRelations = await Product.findByPk(productId, getProductIncludeOptions());

        return res.status(201).json({
            success: true,
            message: "Produit créé avec succès.",
            product: productWithRelations
        });

    } catch (error) {
        // VÉRIFICATION : Testez si la transaction n'est pas déjà terminée (null, commit, ou rollback)
        if (t.finished !== 'commit' && t.finished !== 'rollback') {
            await t.rollback(); // Seulement si la transaction est encore "pending"
        }
        console.error("Erreur lors de la création du produit:", error);
        // Nettoyer les fichiers Cloudinary en cas d'échec de la DB
        if (uploadedPublicIds.length > 0) {
             await deleteMultipleFiles(uploadedPublicIds).catch(err => console.error("Échec du nettoyage Cloudinary:", err));
        }
        
        return res.status(500).json({
            success: false,
            message: "Échec de la création du produit.",
            error: error.message
        });
    }
};


exports.getProductsByCommunity = async (req, res) => {
    const { communityId } = req.params;
    const { category, minPrice, maxPrice, type, isFree, sortBy, page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { communityId };
    let order = [['createdAt', 'DESC']]; 

    // Filtrage
    if (category) where.categoryId = category;
    if (type) where.type = type; // physique ou digital
    if (isFree !== undefined) where.isFree = isFree === 'true';
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Tri
    switch (sortBy) {
        case 'price_asc': order = [['price', 'ASC']]; break;
        case 'price_desc': order = [['price', 'DESC']]; break;
        case 'rating': order = [['rating', 'DESC']]; break;
        case 'commands': order = [['totalCommands', 'DESC']]; break;
        // date_desc par défaut
    }

    try {
        const result = await Product.findAndCountAll({
            where,
            ...getProductIncludeOptions(),
            limit: parseInt(limit),
            offset,
            order
        });

        return res.status(200).json({
            success: true,
            products: result.rows,
            paginationInfos: {
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
                currentPage: parseInt(page),
                pageSize: parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des produits de la communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des produits.",
            error: error.message
        });
    }
};


exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id, getProductIncludeOptions());

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: "Produit non trouvé." });
        }

        return res.status(200).json({
            success: true,
            product: product
        });

    } catch (error) {
        console.error("Erreur lors de la récupération du produit par ID:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération du produit.",
            error: error.message
        });
    }
};


 exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { title, description, price, categoryId, type, isFree, imagesToDelete, filesToDelete } = req.body;
    
    const t = await sequelize.transaction();
    let publicIdsToDelete = []; // IDs Cloudinary des fichiers à supprimer
    let newPublicIds = []; // IDs Cloudinary des nouveaux fichiers à nettoyer en cas d'erreur DB

    try {
        let product = req.product || await Product.findByPk(id, { transaction: t });

        if (!product) {
            await t.rollback();
            return res.status(404).json({ 
                success: false,
                message: "Produit non trouvé." });
        }

        // 1. Gestion de la Suppression des Anciens Fichiers/Images
        const imagesIdToDeleteArray = imagesToDelete ? imagesToDelete.split(',') : []; // IDs locaux
        const filesIdToDeleteArray = filesToDelete ? filesToDelete.split(',') : []; // IDs locaux

        if (imagesIdToDeleteArray.length > 0) {
            const images = await ProductImage.findAll({ where: { id: imagesIdToDeleteArray }, attributes: ['cloudinaryId'] });
            publicIdsToDelete = [...publicIdsToDelete, ...images.map(img => img.cloudinaryId)];
            await ProductImage.destroy({ where: { id: imagesIdToDeleteArray }, transaction: t });
        }
        
        if (filesIdToDeleteArray.length > 0) {
            const files = await ProductFile.findAll({ where: { id: filesIdToDeleteArray }, attributes: ['cloudinaryId'] });
            publicIdsToDelete = [...publicIdsToDelete, ...files.map(file => file.cloudinaryId)];
            await ProductFile.destroy({ where: { id: filesIdToDeleteArray }, transaction: t });
        }

        // 2. Mise à jour des champs du Produit
        const updateFields = {
            title, description, price, categoryId, type, isFree: isFree === 'true' || isFree === true
        };
        await product.update(updateFields, { transaction: t });


        // 3. Gestion des Nouveaux Images (req.files.images)
        if (req.files && req.files.images) {
            const newImageRecords = req.files.images.map(file => {
                newPublicIds.push(file.filename);
                return {
                    productId: id,
                    url: file.path,
                    cloudinaryId: file.filename,
                    type: file.mimetype
                };
            });
            await ProductImage.bulkCreate(newImageRecords, { transaction: t });
        }

        // 4. Gestion des Nouveaux Fichiers (req.files.files)
        if (req.files && req.files.files) {
            const newFileRecords = req.files.files.map(file => {
                newPublicIds.push(file.filename);
                return {
                    productId: id,
                    url: file.path,
                    cloudinaryId: file.filename,
                    title: file.originalname,
                    isVideo: file.mimetype.startsWith('video'),
                    type: file.mimetype
                };
            });
            await ProductFile.bulkCreate(newFileRecords, { transaction: t });
        }
        
        await t.commit();

        // 5. Suppression des fichiers Cloudinary (après succès de la DB)
        if (publicIdsToDelete.length > 0) {
            await deleteMultipleFiles(publicIdsToDelete)
            .catch(err => 
                console.error("Échec du nettoyage Cloudinary:"
                    , err
                ));
        }

        const productWithRelations = await Product.findByPk(id, getProductIncludeOptions());

        return res.status(200).json({
            success: true,
            message: "Produit mis à jour avec succès.",
            product: productWithRelations
        });

    } catch (error) {
        await t.rollback();
        console.error("Erreur lors de la mise à jour du produit:", error);
        
        // Nettoyer les NOUVEAUX fichiers Cloudinary si la transaction DB échoue
        if (newPublicIds.length > 0) {
             await deleteMultipleFiles(newPublicIds).catch(err => console.error("Échec du nettoyage Cloudinary:", err));
        }

        return res.status(500).json({
            success: false,
            message: "Échec de la mise à jour du produit.",
            error: error.message
        });
    }
};


exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        const product = await Product.findByPk(id, { 
            include: [
                { model: ProductImage, as: 'productImages', attributes: ['cloudinaryId'] },
                { model: ProductFile, as: 'productFiles', attributes: ['cloudinaryId'] }
            ],
            transaction: t 
        });

        if (!product) {
            await t.rollback();
            return res.status(404).json({
                 success: false,
                 message: "Produit non trouvé."
                });
        }
        
        const communityId = product.communityId;
        
        // 1. Récupérer tous les Public IDs pour Cloudinary
        const publicIds = [
            // Si product.images est undefined, utilise []
            ...(product.images || []).map(img => img.cloudinaryId),
            // Si product.files est undefined, utilise []
            ...(product.files || []).map(file => file.cloudinaryId)
        ];

        // 2. Supprimer le produit (ON DELETE CASCADE s'occupe des images/fichiers)
        await product.destroy({ transaction: t });

        // 3. Décrémenter totalProducts
        await Community.decrement('totalProducts', { 
            where: { id: communityId },
            transaction: t 
        });

        await t.commit();
        
        // 4. Supprimer les fichiers Cloudinary (hors transaction DB)
        if (publicIds.length > 0) {
            await deleteMultipleFiles(publicIds).catch(err => console.error("Échec de la suppression Cloudinary:", err));
        }

        return res.status(200).json({
            success: true,
            message: "Produit supprimé avec succès."
        });

    } catch (error) {
        await t.rollback();
        console.error("Erreur lors de la suppression du produit:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la suppression du produit.",
            error: error.message
        });
    }
};


exports.updateProductRating = async (req, res) => {
    const { id } = req.params;
    const { score } = req.body;
    const userId = req.user.userId;

    if (!score || score < 1 || score > 5) {
        return res.status(400).json({ success: false, message: "Le score doit être un nombre entier entre 1 et 5." });
    }

    const t = await sequelize.transaction();
    
    try {
        // 1. Enregistrer/Mettre à jour la note individuelle
        const [ratingRecord, created] = await Rating.findOrCreate({
            where: { productId: id, userId },
            defaults: { score },
            transaction: t
        });

        if (!created) {
            await ratingRecord.update({ score }, { transaction: t });
        }

        // 2. Calculer la nouvelle moyenne et le total
        const result = await Rating.findAll({ 
            attributes: [
                [sequelize.fn('AVG', sequelize.col('score')), 'averageRating'],
                [sequelize.fn('COUNT', sequelize.col('score')), 'totalRatings']
            ],
            where: { productId: id },
            raw: true,
            transaction: t
        });
        
        const { averageRating, totalRatings } = result[0];

        // 3. Mettre à jour le produit
        await Product.update({
            rating: parseFloat(averageRating).toFixed(2), 
            }, { where: { id }, transaction: t });

        await t.commit();

        return res.status(200).json({
            success: true,
            message: "Note du produit mise à jour.",
            newAverageRating: parseFloat(averageRating).toFixed(2),
            totalRatings: parseInt(totalRatings),
            newScore: score
        });

    } catch (error) {
        await t.rollback();
        console.error("Erreur lors de la mise à jour de la note:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la mise à jour de la note.",
            error: error.message
        });
    }
};


exports.incrementProductCommands = async (req, res) => {
    const { id } = req.params;

    try {
        const [affectedRows] = await Product.increment('totalCommands', { where: { id } });

        if (affectedRows === 0) {
             return res.status(404).json({ success: false, message: "Produit non trouvé ou non mis à jour." });
        }

        return res.status(200).json({
            success: true,
            message: "Compteur de commandes incrémenté avec succès."
        });

    } catch (error) {
        console.error("Erreur lors de l'incrémentation des commandes:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de l'incrémentation des commandes.",
            error: error.message
        });
    }
};

 
exports.searchProducts = async (req, res) => {
    const { q, categoryId, minPrice, maxPrice, type, isFree, page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (q) {
        const lowerQ = q.toLowerCase();
        where[Op.or] = [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('Product.title')), { [Op.like]: `%${lowerQ}%` }),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('Product.description')), { [Op.like]: `%${lowerQ}%` })
        ];
    }
    
    // Filtres Multiples
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (isFree !== undefined) where.isFree = isFree === 'true';
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
        if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    try {
        const result = await Product.findAndCountAll({
            where,
            ...getProductIncludeOptions(),
            limit: parseInt(limit),
            offset,
            order: [['totalCommands', 'DESC']] // Tri par popularité par défaut
        });

        return res.status(200).json({
            success: true,
            query: q || '',
            products: result.rows,
            paginationInfos: {
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
                currentPage: parseInt(page),
                pageSize: parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Erreur lors de la recherche des produits:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la recherche des produits.",
            error: error.message
        });
    }
};