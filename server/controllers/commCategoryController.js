const { CommCategory, RCommCategory } = require('../models/index');
const { deleteFile } = require('../config/cloudinary'); 

/**
 * @description Créer une nouvelle catégorie de communauté (avec upload d'icône via Multer/Cloudinary)
 * @route POST /api/categories/communities
 * @access Private (Admin)
 */
exports.createCommCategory = async (req, res) => {
    const { name } = req.body; 
    const uploadedFile = req.file; 
    let imageUrl = null;
    let cloudinaryPublicId = null;

    if (!name || name.length < 2) {
        // Nettoyage Cloudinary en cas d'échec de validation
        if (uploadedFile && uploadedFile.filename) {
            await deleteFile(uploadedFile.filename).catch(e => console.error("Erreur de nettoyage Cloudinary:", e));
        }
        return res.status(400).json({ 
            success: false, 
            message: "Le nom de la catégorie est obligatoire et doit contenir au moins 2 caractères." 
        });
    }

    // Récupération des infos Cloudinary si un fichier a été uploadé
    if (uploadedFile) {
        imageUrl = uploadedFile.path; 
        cloudinaryPublicId = uploadedFile.filename; 
    }

    try {
        const existingCategory = await CommCategory.findOne({ where: { name } });
        if (existingCategory) {
            // Supprimer le fichier Cloudinary s'il existe déjà
            if (cloudinaryPublicId) {
                await deleteFile(cloudinaryPublicId).catch(e => console.error("Erreur de nettoyage Cloudinary:", e));
            }
            return res.status(409).json({ 
                success: false, 
                message: "Cette catégorie de communauté existe déjà." 
            });
        }

        const newCategory = await CommCategory.create({
            name,
            imageUrl, 
            cloudinaryPublicId
        });

        return res.status(201).json({
            success: true,
            message: "Catégorie de communauté créée avec succès.",
            category: newCategory
        });

    } catch (error) {
        // Nettoyage Cloudinary en cas d'erreur DB
        if (cloudinaryPublicId) {
            await deleteFile(cloudinaryPublicId).catch(e => console.error("Erreur de nettoyage Cloudinary (catch):", e));
        }
        console.error("Erreur lors de la création de la catégorie de communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la création de la catégorie de communauté.",
            error: error.message
        });
    }
};



/**
 * @description Récupérer toutes les catégories de communautés
 * @route GET /api/categories/communities
 * @access Public 
 */
exports.getAllCommCategories = async (req, res) => {
    try {
        const categories = await CommCategory.findAll({
            attributes: ['id', 'name', 'imageUrl'] 
        });

        return res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories de communautés:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des catégories de communautés.",
            error: error.message
        });
    }
};


/**
 * @description Récupérer une catégorie de communauté par son ID
 * @route GET /api/categories/communities/:id
 * @access Public 
 */
exports.getCommCategoryById = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const category = await CommCategory.findByPk(categoryId, {
            attributes: ['id', 'name', 'imageUrl'] 
        });

        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: "Catégorie de communauté non trouvée." 
            });
        }

        return res.status(200).json({
            success: true,
            category: category
        });

    } catch (error) {
        console.error("Erreur lors de la récupération de la catégorie par ID:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération de la catégorie de communauté.",
            error: error.message
        });
    }
};

/**
 * @description Mettre à jour une catégorie de communauté existante
 * @route PUT /api/categories/communities/:id
 * @access Private (Admin)
 */
exports.updateCommCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { name, deleteExistingImage } = req.body; 
    const uploadedFile = req.file; 
    let newCloudinaryPublicId = uploadedFile ? uploadedFile.filename : null;
    let oldPublicId = null; 

    try {
        const existingCategory = await CommCategory.findByPk(categoryId);
        if (!existingCategory) {
            if (newCloudinaryPublicId) {
                await deleteFile(newCloudinaryPublicId).catch(e => console.error("Erreur de nettoyage Cloudinary:", e));
            }
            return res.status(404).json({ success: false, message: "Catégorie de communauté non trouvée." });
        }
        
        oldPublicId = existingCategory.cloudinaryPublicId;
        
        let updateData = {};
        let fileToDeleteId = null; 

        // Traitement de l'image (Remplacement/Suppression)
        if (uploadedFile) {
            updateData.imageUrl = uploadedFile.path;
            updateData.cloudinaryPublicId = uploadedFile.filename;
            fileToDeleteId = oldPublicId; 
        } else if (deleteExistingImage === 'true') {
            updateData.imageUrl = null;
            updateData.cloudinaryPublicId = null;
            fileToDeleteId = oldPublicId; 
        }

        // 3. Mise à jour des champs texte
        if (name && name.length >= 2) {
            updateData.name = name;
        }

        // Vérification et Arrêt si aucune donnée à mettre à jour
        if (Object.keys(updateData).length === 0) {
             return res.status(200).json({
                success: true,
                message: "Aucune modification n'a été effectuée.",
                category: existingCategory
            });
        }
        
        //  Suppression de l'ancien fichier sur Cloudinary (si Remplacement/Suppression demandée)
        if (fileToDeleteId) {
             await deleteFile(fileToDeleteId).catch(e => console.warn("Avertissement: Échec de la suppression ancien fichier Cloudinary:", e));
        }
        
        await CommCategory.update(updateData, {
            where: { id: categoryId }
        });
        
        //Récupération du PostCategory mis à jour pour la réponse (Méthode sécurisée)
        const updatedCategory = await CommCategory.findByPk(categoryId, {
             attributes: ['id', 'name', 'imageUrl', 'cloudinaryPublicId']
        });
        
        return res.status(200).json({
            success: true,
            message: "Catégorie de communauté mise à jour avec succès.",
            category: updatedCategory
        });

    } catch (error) {
        // En cas d'erreur DB, nettoyer le NOUVEAU fichier uploadé si existant
        if (newCloudinaryPublicId) {
            await deleteFile(newCloudinaryPublicId).catch(e => console.error("Erreur de nettoyage Cloudinary (catch):", e));
        }
        console.error("Erreur lors de la mise à jour de la catégorie de communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la mise à jour de la catégorie de communauté.",
            error: error.message
        });
    }
};

/**
 * @description Supprimer une catégorie de communauté par son ID (avec suppression de l'icône Cloudinary)
 * @route DELETE /api/categories/communities/:id
 * @access Private (Admin)
 */
exports.deleteCommCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const relationshipCount = await RCommCategory.count({
            where: { communityCategoryId: categoryId }
        });

        if (relationshipCount > 0) {
            return res.status(409).json({ 
                success: false, 
                message: "Impossible de supprimer la catégorie. Elle est liée à " + relationshipCount + " communauté(s) active(s)." 
            });
        }

        const categoryToDelete = await CommCategory.findByPk(categoryId);
        
        if (!categoryToDelete) {
             return res.status(404).json({ success: false, message: "Catégorie de communauté non trouvée." });
        }

        const publicId = categoryToDelete.cloudinaryPublicId;

        const deletedRows = await CommCategory.destroy({
            where: { id: categoryId }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ success: false, message: "Catégorie de communauté non trouvée après vérification." });
        }
        
        if (publicId) {
             await deleteFile(publicId).catch(e => console.warn("Avertissement: Échec de la suppression de l'icône Cloudinary:", e.message));
        }

        return res.status(200).json({
            success: true,
            message: "Catégorie de communauté supprimée avec succès."
        });

    } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie de communauté:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la suppression de la catégorie de communauté.",
            error: error.message
        });
    }
};

