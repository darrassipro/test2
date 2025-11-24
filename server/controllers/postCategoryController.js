const { PostCategory, Post } = require('../models/index'); 
const { deleteFile } = require('../config/cloudinary'); 

/**
 * @description Créer une nouvelle catégorie de post
 * @route POST /api/categories/posts
 * @access Private (Admin)
 */
exports.createPostCategory = async (req, res) => {
    const { name } = req.body; 
    const uploadedFile = req.file; 
    let imageUrl = null;
    let cloudinaryPublicId = null;

    // 2. Validation basique des données
    if (!name || name.length < 2) {
        // S'il y a un fichier uploadé (Cloudinary l'a déjà) et que la validation échoue, il FAUT le supprimer.
        if (uploadedFile && uploadedFile.filename) {
            await deleteFile(uploadedFile.filename).catch(e => console.error("Erreur de nettoyage Cloudinary:", e));
        }
        return res.status(400).json({ 
            success: false, 
            message: "Le nom de la catégorie est obligatoire et doit contenir au moins 2 caractères." 
        });
    }

    // 3. Récupération des infos Cloudinary si un fichier a été uploadé
    if (uploadedFile) {
        imageUrl = uploadedFile.path; // secure_url
        cloudinaryPublicId = uploadedFile.filename; // public_id
    }

    try {
        // 4. Vérification de l'existence de la catégorie
        const existingCategory = await PostCategory.findOne({ where: { name } });
        if (existingCategory) {
            // Supprimer le fichier Cloudinary s'il existe une catégorie existante
            if (cloudinaryPublicId) {
                await deleteFile(cloudinaryPublicId).catch(e => console.error("Erreur de nettoyage Cloudinary:", e));
            }
            return res.status(409).json({ 
                success: false, 
                message: "Cette catégorie de post existe déjà." 
            });
        }

        // 5. Création de la catégorie dans la base de données
        const newCategory = await PostCategory.create({
            name,
            imageUrl, // Peut être null si aucun fichier n'a été fourni
            cloudinaryPublicId // Peut être null
        });

        // 6. Réponse de succès
        return res.status(201).json({
            success: true,
            message: "Catégorie de post créée avec succès.",
            category: newCategory
        });

    } catch (error) {
        // En cas d'erreur DB ou autre, assurez-vous de supprimer le fichier Cloudinary.
        if (cloudinaryPublicId) {
            await deleteFile(cloudinaryPublicId).catch(e => console.error("Erreur de nettoyage Cloudinary (catch):", e));
        }
        console.error("Erreur lors de la création de la catégorie de post:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la création de la catégorie de post.",
            error: error.message
        });
    }
};

/**
 * @description Récupérer toutes les catégories de post
 * @route GET /api/categories/posts
 * @access Public
 */
exports.getAllPostCategories = async (req, res) => {
    try {
        // 1. Récupération de toutes les catégories, triées par nom
        const categories = await PostCategory.findAll({
            attributes: ['id', 'name', 'imageUrl'], 
            order: [['name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            total: categories.length,
            categories
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des catégories de post:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des catégories de post.",
            error: error.message
        });
    }
};

/**
 * @description Récupérer une catégorie de post par son ID
 * @route GET /api/categories/posts/:id
 * @access Public
 */
exports.getPostCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // 1. Recherche de la catégorie par clé primaire (ID)
        const category = await PostCategory.findByPk(categoryId, {
            attributes: ['id', 'name', 'imageUrl', 'cloudinaryPublicId']
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Catégorie de post non trouvée."
            });
        }

        // 2. Réponse de succès
        return res.status(200).json({
            success: true,
            category
        });

    } catch (error) {
        console.error("Erreur lors de la récupération de la catégorie de post par ID:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération de la catégorie de post.",
            error: error.message
        });
    }
};

/**
 * @description Mettre à jour une catégorie de post existante
 * @route PUT /api/categories/posts/:id
 * @access Private (Admin/Moderator)
 */
exports.updatePostCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { name, deleteExistingImage } = req.body; // deleteExistingImage est un champ optionnel (e.g., 'true')
    // req.file contient les métadonnées du NOUVEAU fichier uploadé
    const uploadedFile = req.file; 
    let newCloudinaryPublicId = uploadedFile ? uploadedFile.filename : null;

    try {
        // 1. Trouver la catégorie existante
        const existingCategory = await PostCategory.findByPk(categoryId);
        if (!existingCategory) {
            // Si la catégorie n'existe pas, supprimer le nouveau fichier uploadé s'il existe
            if (newCloudinaryPublicId) {
                await deleteFile(newCloudinaryPublicId).catch(e => console.error("Erreur de nettoyage Cloudinary:", e));
            }
            return res.status(404).json({ success: false, message: "Catégorie de post non trouvée." });
        }
        
        // Stocker l'ancien ID pour la suppression
        let oldPublicId = existingCategory.cloudinaryPublicId;
        
        let updateData = {};
        let fileToDeleteId = null; 

        // 2. Traitement de la suppression ou du remplacement
        
        // Cas A: Remplacement (Un nouveau fichier est uploadé)
        if (uploadedFile) {
            updateData.imageUrl = uploadedFile.path;
            updateData.cloudinaryPublicId = uploadedFile.filename;
            fileToDeleteId = oldPublicId; // Marquer l'ancien pour suppression
        } 
        // Cas B: Demande de suppression (deleteExistingImage === 'true') et PAS de nouveau fichier
        else if (deleteExistingImage === 'true') {
            updateData.imageUrl = null;
            updateData.cloudinaryPublicId = null;
            fileToDeleteId = oldPublicId; // Marquer l'ancien pour suppression
        }
        // Cas C: Aucun changement de fichier. Ne rien mettre dans updateData pour l'image.

        // 3. Mise à jour des champs texte
        if (name && name.length >= 2) {
            updateData.name = name;
        }

        // 4. Exécution de la suppression de l'ancien fichier sur Cloudinary
        if (fileToDeleteId) {
             await deleteFile(fileToDeleteId).catch(e => console.warn("Avertissement: Échec de la suppression ancien fichier Cloudinary:", e));
        }
        
        // 5. Mise à jour de la catégorie dans la DB (Retourne seulement le nombre de lignes affectées)
        const [rowsAffected] = await PostCategory.update(updateData, {
            where: { id: categoryId }
        });

        if (rowsAffected === 0) {
        // Si la catégorie n'a pas été mise à jour (peut-être déjà à jour ou non trouvée)
        // Nous avons déjà vérifié qu'elle existe, donc ceci est peu probable
        }

       // 6. Récupération du PostCategory mis à jour pour la réponse
       const updatedCategory = await PostCategory.findByPk(categoryId);

       if (!updatedCategory) {
       // Ceci est une vérification de sécurité supplémentaire
       return res.status(500).json({
         success: false, 
         message: "Échec de la récupération de la catégorie après mise à jour." 
        });
       }
       return res.status(200).json({
       success: true,
       message: "Catégorie de post mise à jour avec succès.",
       category: updatedCategory
       });

    } catch (error) {
        // En cas d'erreur, si un NOUVEAU fichier a été uploadé, il faut le nettoyer
        if (newCloudinaryPublicId) {
            await deleteFile(newCloudinaryPublicId).catch(e => console.error("Erreur de nettoyage Cloudinary (catch):", e));
        }
        console.error("Erreur lors de la mise à jour de la catégorie de post:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la mise à jour de la catégorie de post.",
            error: error.message
        });
    }
};


/**
 * @description Supprimer une catégorie de post par son ID
 * @route DELETE /api/categories/posts/:id
 * @access Private (Admin/Moderator)
 */
exports.deletePostCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const postCount = await Post.count({
            where: { postCategory: categoryId } 
            });
        
        if (postCount > 0) {
            return res.status(409).json({ 
                success: false, 
                message: `Impossible de supprimer la catégorie. ${postCount} post(s) dépendent d'elle.` 
            });
        }
        // 2. Trouver la catégorie avant la suppression pour récupérer le publicId
        const categoryToDelete = await PostCategory.findByPk(categoryId);
        
        if (!categoryToDelete) {
             return res.status(404).json({ success: false, message: "Catégorie de post non trouvée." });
        }

        const publicId = categoryToDelete.cloudinaryPublicId;

        // 3. Suppression de la catégorie dans la DB
        const deletedRows = await PostCategory.destroy({
            where: { id: categoryId }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ success: false, message: "Catégorie de post non trouvée après vérification." });
        }
        
        // 4. Suppression de l'icône Cloudinary 
        if (publicId) {
             // Utilisation de deleteFile
             await deleteFile(publicId).catch(e => console.warn("Avertissement: Échec de la suppression de l'icône Cloudinary:", e.message));
        }

        // 5. Réponse de succès
        return res.status(200).json({
            success: true,
            message: "Catégorie de post supprimée avec succès."
        });

    } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie de post:", error);
        // Gérer les Foreign Key constraints
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(409).json({ success: false, message: "Impossible de supprimer la catégorie. Des posts dépendent d'elle." });
        }
        return res.status(500).json({
            success: false,
            message: "Échec de la suppression de la catégorie de post.",
            error: error.message
        });
    }
};
