const { Community, Admin, User, CommunityMembership } = require('../models/index');
const { getUserRole } = require('../middleware/checkAdminRole'); 

/**
 * @description Ajouter un administrateur à une communauté.
 * @access Private (Nécessite le rôle 'owner' ou 'admin')
 * @middleware checkAdminRole('admin')
 */
exports.addAdmin = async (req, res) => {
    const communityId = req.params.communityId;
    const { userId, role } = req.body;
    const callerId = req.user.userId;
    const callerRole = req.userRole; // Rôle de l'appelant, fourni par checkAdminRole

    // Vérification du rôle à attribuer
    const validRoles = ['admin', 'moderator'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: "Rôle invalide. Les rôles possibles sont 'admin' ou 'moderator'." });
    }

    // Un 'admin' ne peut pas ajouter un autre 'owner' (seul l'owner initial le peut, ou si nous ajoutions 'owner' à la liste validRoles)
    if (callerRole !== 'owner' && role === 'owner') {
         return res.status(403).json({ success: false, message: "Accès refusé. Seul le propriétaire (owner) peut attribuer le rôle 'owner'." });
    }

    try {
        // 1. Vérifier que l'utilisateur cible est membre de la communauté
        const isMember = await CommunityMembership.findOne({
            where: { communityId, userId }
        });

        if (!isMember) {
            return res.status(400).json({ success: false, message: "L'utilisateur cible n'est pas membre de la communauté." });
        }
        
        // 2. Vérifier si l'utilisateur est déjà un admin
        const existingAdmin = await Admin.findOne({ where: { communityId, userId } });
        if (existingAdmin) {
            return res.status(409).json({ success: false, message: `L'utilisateur est déjà un administrateur avec le rôle : ${existingAdmin.role}. Utilisez PATCH pour mettre à jour son rôle.` });
        }

        // 3. Créer l'entrée Admin
        const newAdmin = await Admin.create({
            communityId,
            userId,
            role
        });

        return res.status(201).json({
            success: true,
            message: `Utilisateur ${userId} ajouté comme ${role} de la communauté.`,
            admin: newAdmin
        });

    } catch (error) {
        console.error("Erreur lors de l'ajout de l'administrateur:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de l'ajout de l'administrateur.",
            error: error.message
        });
    }
};

/**
 * @description Retirer un administrateur d'une communauté.
 * @access Private (Nécessite le rôle 'owner' ou 'admin' supérieur)
 * @middleware checkAdminRole('admin')
 */
exports.removeAdmin = async (req, res) => {
    const communityId = req.params.communityId;
    const userIdToRemove = req.params.userId;
    const callerId = req.user.userId;
    const callerRole = req.userRole;

    if (userIdToRemove === callerId) {
        return res.status(400).json({ success: false, message: "Vous ne pouvez pas vous retirer vous-même. Utilisez une autre méthode si cela est autorisé." });
    }

    try {
        const adminToRemove = await Admin.findOne({ where: { communityId, userId: userIdToRemove } });

        if (!adminToRemove) {
            return res.status(404).json({ success: false, message: "L'administrateur spécifié n'a pas été trouvé." });
        }

        // 1. Vérifier qu'on ne retire pas le dernier 'owner'
        if (adminToRemove.role === 'owner') {
            const ownerCount = await Admin.count({ where: { communityId, role: 'owner' } });
            if (ownerCount <= 1) {
                 return res.status(403).json({ success: false, message: "Accès refusé. Vous ne pouvez pas retirer le seul propriétaire (owner) restant de la communauté." });
            }
        }

        // 2. Vérification de la hiérarchie pour le retrait
        // Un 'admin' ne peut pas retirer un 'owner'.
        if (callerRole === 'admin' && adminToRemove.role === 'owner') {
             return res.status(403).json({ success: false, message: "Accès refusé. Un administrateur ne peut pas retirer un propriétaire (owner)." });
        }

        // 3. Supprimer l'entrée Admin
        await adminToRemove.destroy();

        return res.status(200).json({
            success: true,
            message: `Administrateur ${userIdToRemove} retiré de la communauté.`
        });

    } catch (error) {
        console.error("Erreur lors du retrait de l'administrateur:", error);
        return res.status(500).json({
            success: false,
            message: "Échec du retrait de l'administrateur.",
            error: error.message
        });
    }
};

/**
 * @description Modifier le rôle d'un administrateur.
 * @access Private (Nécessite le rôle 'owner' ou 'admin' supérieur)
 * @middleware checkAdminRole('admin')
 */
exports.updateAdminRole = async (req, res) => {
    const communityId = req.params.communityId;
    const userIdToUpdate = req.params.userId;
    const { newRole } = req.body;
    const callerRole = req.userRole;

    const validRoles = ['owner', 'admin', 'moderator'];
    if (!validRoles.includes(newRole)) {
        return res.status(400).json({ success: false, message: "Rôle invalide." });
    }

    try {
        const adminToUpdate = await Admin.findOne({ where: { communityId, userId: userIdToUpdate } });

        if (!adminToUpdate) {
            return res.status(404).json({ success: false, message: "L'utilisateur spécifié n'est pas un administrateur." });
        }

        // 1. Vérification de la hiérarchie pour la modification
        // Un 'admin' ne peut pas modifier un 'owner', ni attribuer le rôle 'owner'.
        if (callerRole === 'admin' && (adminToUpdate.role === 'owner' || newRole === 'owner')) {
             return res.status(403).json({ success: false, message: "Accès refusé. Un administrateur ne peut pas modifier un propriétaire, ni attribuer ce rôle." });
        }
        
        // 2. Vérification pour la rétrogradation du seul owner restant
         if (adminToUpdate.role === 'owner' && newRole !== 'owner') {
            const ownerCount = await Admin.count({ where: { communityId, role: 'owner' } });
            if (ownerCount <= 1) {
                 return res.status(403).json({ success: false, message: "Accès refusé. Vous ne pouvez pas rétrograder le seul propriétaire (owner) restant." });
            }
        }

        // 3. Mettre à jour le rôle
        await adminToUpdate.update({ role: newRole });

        return res.status(200).json({
            success: true,
            message: `Rôle de l'administrateur ${userIdToUpdate} mis à jour vers '${newRole}'.`,
            admin: adminToUpdate
        });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du rôle:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la mise à jour du rôle de l'administrateur.",
            error: error.message
        });
    }
};

/**
 * @description Obtenir la liste des administrateurs d'une communauté (avec pagination).
 */
exports.getCommunityAdmins = async (req, res) => {
    const communityId = req.params.communityId;

    try {
        const admins = await Admin.findAll({
            where: { communityId },
            include: [
                {
                    model: User,
                    as: 'user', 
                    attributes: ['id', 'firstName', 'lastName', 'profileImage']
                }
            ],
            // Trier par rôle pour afficher les 'owner' en premier
            order: [
                [Admin.sequelize.literal("CASE role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 WHEN 'moderator' THEN 3 ELSE 4 END")],
                ['createdAt', 'ASC'] 
            ]
        });

        return res.status(200).json({
            success: true,
            admins: admins
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des administrateurs:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la récupération des administrateurs.",
            error: error.message
        });
    }
};

/**
 * @description Vérifier si un utilisateur est administrateur dans une communauté et quel est son rôle.
 * @access Private (Lecture simple)
 */
exports.checkAdminStatus = async (req, res) => {
    const communityId = req.params.communityId;
    const userId = req.params.userId;
    
    try {
        const userRole = await getUserRole(communityId, userId); // Utilisation de la fonction utilitaire

        if (userRole) {
            return res.status(200).json({
                success: true,
                isAdmin: true,
                role: userRole,
                message: `L'utilisateur ${userId} est administrateur avec le rôle : ${userRole}.`
            });
        } else {
            return res.status(200).json({
                success: true,
                isAdmin: false,
                role: null,
                message: `L'utilisateur ${userId} n'est pas administrateur de cette communauté.`
            });
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du statut admin:", error);
        return res.status(500).json({
            success: false,
            message: "Échec de la vérification du statut administrateur.",
            error: error.message
        });
    }
};