const { ProductCategory, Product } = require('../models/index');
const { Op } = require('sequelize');
const sequelize = ProductCategory.sequelize;

/**
 * @description Crée une nouvelle catégorie de produit.
 * @access Private (Super-Admin seulement)
 */
exports.createCategory = async (req, res) => {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: "Le nom de la catégorie est requis." });
    }

    try {
        // Validation du nom (unique, insensible à la casse)
        const existingCategory = await ProductCategory.findOne({
            where: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), {
                [Op.eq]: name.trim().toLowerCase()
            })
        });

        if (existingCategory) {
            return res.status(409).json({ success: false, message: "Cette catégorie existe déjà." });
        }

        const newCategory = await ProductCategory.create({ name: name.trim() });

        return res.status(201).json({
            success: true,
            message: "Catégorie de produit créée avec succès.",
            category: newCategory
        });

    } catch (error) {
        console.error("Erreur lors de la création de la catégorie:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la création de la catégorie.",
            error: error.message
        });
    }
};

/**
 * @description Obtient toutes les catégories de produits (avec tri et pagination optionnelle).
 * @access Public
 */
exports.getAllCategories = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    // Permet de désactiver la pagination si limit est omis
    const limit = req.query.limit ? parseInt(req.query.limit) : null; 
    const offset = limit ? (page - 1) * limit : 0;

    try {
        const queryOptions = {
            // Tri alphabétique par nom
            order: [['name', 'ASC']], 
            attributes: ['id', 'name']
        };

        if (limit) {
            queryOptions.limit = limit;
            queryOptions.offset = offset;
        }

        const result = await ProductCategory.findAndCountAll(queryOptions);

        const response = {
            success: true,
            categories: result.rows,
        };

        // Ajout des infos de pagination si la limite est définie
        if (limit) {
             response.paginationInfos = {
                totalItems: result.count,
                totalPages: Math.ceil(result.count / limit),
                currentPage: page,
                pageSize: limit
            };
        } else {
             response.totalItems = result.count;
        }

        return res.status(200).json(response);

    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des catégories.",
            error: error.message
        });
    }
};

/**
 * @description Obtient une catégorie par ID.
 * @access Public
 */
exports.getCategoryById = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const category = await ProductCategory.findByPk(categoryId, {
            attributes: ['id', 'name']
        });

        if (!category) {
            return res.status(404).json({ success: false, message: "Catégorie de produit non trouvée." });
        }

        return res.status(200).json({
            success: true,
            category: category
        });

    } catch (error) {
        console.error("Erreur lors de la récupération de la catégorie:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération de la catégorie.",
            error: error.message
        });
    }
};

// exports.getCategoriesByType = async (req, res) => {
//     const { type } = req.query; 

//     if (!type || (type !== 'digital' && type !== 'physical')) {
//         return res.status(400).json({ message: "Veuillez préciser le type de produit (digital ou physique)." });
//     }

//     try {
//         const categories = await ProductCategory.findAll({
//             where: { type: type } 
//         });

//         res.status(200).json(categories);
//     } catch (error) {
//         // ...
//     }
// };

/**
 * @description Met à jour le nom d'une catégorie.
 * @access Private (Super-Admin seulement)
 */
exports.updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: "Le nouveau nom de la catégorie est requis." });
    }

    try {
        const category = await ProductCategory.findByPk(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: "Catégorie de produit non trouvée." });
        }

        const existingCategory = await ProductCategory.findOne({
            where: { 
                // Utilisation de sequelize.where pour la recherche insensible à la casse (MariaDB/MySQL)
                [Op.and]: [
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), {
                        [Op.eq]: name.trim().toLowerCase()
                    }),
                    {
                        // Exclure la catégorie actuelle par son ID
                        id: { [Op.ne]: categoryId } 
                    }
                ]
            }
        });

        if (existingCategory) {
            return res.status(409).json({ success: false, message: "Une autre catégorie porte déjà ce nom." });
        }

        await category.update({ name: name.trim() });

        return res.status(200).json({
            success: true,
            message: "Catégorie de produit mise à jour avec succès.",
            category: category
        });

    } catch (error) {
        console.error("Erreur lors de la mise à jour de la catégorie:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la mise à jour de la catégorie.",
            error: error.message
        });
    }
};

/**
 * @description Supprime une catégorie de produit.
 * @access Private (Super-Admin seulement)
*/
exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.id;
    
    try {
        const category = await ProductCategory.findByPk(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: "Catégorie de produit non trouvée." });
        }

        // Vérifier qu'aucun produit n'utilise cette catégorie
        const productCount = await Product.count({
            where: { categoryId: categoryId }
        });

        if (productCount > 0) {
            return res.status(409).json({ 
                success: false, 
                message: `Impossible de supprimer cette catégorie. ${productCount} produit(s) y sont encore associés.`
            });
        }

        await category.destroy();

        return res.status(200).json({
            success: true,
            message: "Catégorie de produit supprimée avec succès."
        });

    } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la suppression de la catégorie.",
            error: error.message
        });
    }
};
