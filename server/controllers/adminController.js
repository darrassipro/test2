const { Community, Admin, User, CommunityMembership, Post } = require('../models/index');
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

/**
 * @description Get platform dashboard statistics
 * @access Private (Admin only)
 */
exports.getDashboard = async (req, res) => {
    try {
        // Get total users
        const totalUsers = await User.count({ where: { isDeleted: false } });
        const activeUsers = await User.count({ where: { isActive: true, isDeleted: false } });
        
        // Get users from last month for growth calculation
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const usersLastMonth = await User.count({ 
            where: { 
                isDeleted: false,
                createdAt: { [require('sequelize').Op.lt]: lastMonth }
            } 
        });
        const userGrowth = usersLastMonth > 0 ? (((totalUsers - usersLastMonth) / usersLastMonth) * 100).toFixed(1) : 0;

        // Get communities
        const totalCommunities = await Community.count();
        const activeCommunities = await Community.count({ where: { isVerified: true } });
        const communitiesLastMonth = await Community.count({ 
            where: { 
                createdAt: { [require('sequelize').Op.lt]: lastMonth }
            } 
        });
        const communityGrowth = communitiesLastMonth > 0 ? (((totalCommunities - communitiesLastMonth) / communitiesLastMonth) * 100).toFixed(1) : 0;

        // Get posts
        const { Post } = require('../models/index');
        const totalPosts = await Post.count();
        const postsLastMonth = await Post.count({ 
            where: { 
                createdAt: { [require('sequelize').Op.lt]: lastMonth }
            } 
        });
        const postGrowth = postsLastMonth > 0 ? (((totalPosts - postsLastMonth) / postsLastMonth) * 100).toFixed(1) : 0;

        // Get recent users
        const recentUsers = await User.findAll({
            where: { isDeleted: false },
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['id', 'firstName', 'lastName', 'gmail', 'createdAt']
        });

        // Get recent posts
        const recentPosts = await Post.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstName', 'lastName']
                },
                {
                    model: Community,
                    as: 'community',
                    attributes: ['name']
                }
            ]
        });

        // Get recent activity
        const recentActivity = [];
        
        // Add recent user registrations
        const recentRegistrations = await User.findAll({
            where: { isDeleted: false },
            order: [['createdAt', 'DESC']],
            limit: 3,
            attributes: ['id', 'firstName', 'lastName', 'createdAt']
        });
        
        recentRegistrations.forEach(user => {
            recentActivity.push({
                id: `user-${user.id}`,
                type: 'user_registration',
                description: 'New user registered',
                user: `${user.firstName} ${user.lastName}`,
                timestamp: user.createdAt
            });
        });

        // Add recent communities
        const recentCommunities = await Community.findAll({
            order: [['createdAt', 'DESC']],
            limit: 2,
            attributes: ['id', 'name', 'createdAt'],
            include: [{
                model: User,
                as: 'creator',
                attributes: ['firstName', 'lastName']
            }]
        });

        recentCommunities.forEach(community => {
            recentActivity.push({
                id: `community-${community.id}`,
                type: 'community_created',
                description: `Created community "${community.name}"`,
                user: community.creator ? `${community.creator.firstName} ${community.creator.lastName}` : 'Unknown',
                timestamp: community.createdAt
            });
        });

        // Sort by timestamp
        recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    activeUsers,
                    userGrowth: parseFloat(userGrowth),
                    activeCommunities,
                    totalCommunities,
                    communityGrowth: parseFloat(communityGrowth),
                    totalPosts,
                    postGrowth: parseFloat(postGrowth)
                },
                recentUsers: recentUsers.map(u => ({
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                    email: u.gmail,
                    createdAt: u.createdAt
                })),
                recentPosts: recentPosts.map(p => ({
                    id: p.id,
                    title: p.title,
                    author: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'Unknown',
                    community: p.community ? p.community.name : 'Unknown'
                })),
                recentActivity: recentActivity.slice(0, 10)
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
};

/**
 * @description Get platform analytics data
 * @access Private (Admin only)
 */
exports.getAnalytics = async (req, res) => {
    try {
        const { timeRange = '30d' } = req.query;
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }

        const { Op } = require('sequelize');
        
        // Get metrics for the time range
        const users = await User.count({
            where: {
                isDeleted: false,
                createdAt: { [Op.between]: [startDate, endDate] }
            }
        });

        const communities = await Community.count({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] }
            }
        });

        const posts = await Post.count({
            where: {
                createdAt: { [Op.between]: [startDate, endDate] }
            }
        });

        // Simple overview data
        const overview = [
            { title: 'New Users', value: users.toString(), trend: 'up', change: `+${users} in period` },
            { title: 'New Communities', value: communities.toString(), trend: 'up', change: `+${communities} in period` },
            { title: 'New Posts', value: posts.toString(), trend: 'up', change: `+${posts} in period` },
            { title: 'Total Active', value: (users + communities).toString(), trend: 'up', change: 'Period activity' }
        ];

        return res.status(200).json({
            success: true,
            data: {
                timeRange,
                overview,
                metrics: {
                    users: { total: users, new: users, active: users, growth: 0 },
                    communities: { total: communities, new: communities, active: communities, growth: 0 },
                    posts: { total: posts, new: posts, growth: 0 }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics data',
            error: error.message
        });
    }
};

/**
 * @description Get content reports
 * @access Private (Admin only)
 */
exports.getReports = async (req, res) => {
    try {
        // Return empty reports for now - needs Report model to be created
        return res.status(200).json({
            success: true,
            data: {
                reports: [],
                stats: {
                    total: 0,
                    pending: 0,
                    resolved: 0,
                    critical: 0,
                    underReview: 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch reports',
            error: error.message
        });
    }
};

/**
 * @description Approve a report
 * @access Private (Admin only)
 */
exports.approveReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        
        return res.status(200).json({
            success: true,
            message: 'Report approved successfully',
            data: { reportId }
        });
    } catch (error) {
        console.error('Error approving report:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to approve report',
            error: error.message
        });
    }
};

/**
 * @description Reject a report
 * @access Private (Admin only)
 */
exports.rejectReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        
        return res.status(200).json({
            success: true,
            message: 'Report rejected successfully',
            data: { reportId }
        });
    } catch (error) {
        console.error('Error rejecting report:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reject report',
            error: error.message
        });
    }
};

/**
 * @description Dismiss a report
 * @access Private (Admin only)
 */
exports.dismissReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        
        return res.status(200).json({
            success: true,
            message: 'Report dismissed successfully',
            data: { reportId }
        });
    } catch (error) {
        console.error('Error dismissing report:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to dismiss report',
            error: error.message
        });
    }
};

/**
 * @description Get platform settings
 * @access Private (Admin only)
 */
exports.getSettings = async (req, res) => {
    try {
        // Return default settings - can be stored in database later
        const settings = {
            general: {
                siteName: 'Ajiw Platform',
                siteDescription: 'Community platform',
                maintenanceMode: false
            },
            security: {
                passwordMinLength: 8,
                requireEmailVerification: true,
                maxLoginAttempts: 5
            },
            features: {
                enableCommunities: true,
                enablePosts: true,
                enableProducts: true,
                enableRoutes: true
            },
            notifications: {
                emailNotifications: true,
                pushNotifications: false,
                smsNotifications: false
            }
        };

        return res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch settings',
            error: error.message
        });
    }
};

/**
 * @description Update platform settings
 * @access Private (Admin only)
 */
exports.updateSettings = async (req, res) => {
    try {
        const { section, settings } = req.body;
        
        // In a real implementation, save to database
        return res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: { section, settings }
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update settings',
            error: error.message
        });
    }
};

/**
 * @description Get all creators/users with pagination and filters
 * @access Private (Admin only)
 */
exports.getCreators = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status = 'all',
            search = '',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { Op } = require('sequelize');

        // Build where clause
        const where = { isDeleted: false };

        // Filter by status
        if (status === 'active') {
            where.isActive = true;
        } else if (status === 'suspended') {
            where.isActive = false;
        }

        // Search by name or email
        if (search) {
            where[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { gmail: { [Op.like]: `%${search}%` } }
            ];
        }

        // Get users with community count
        const { count, rows: users } = await User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            attributes: [
                'id', 
                'firstName', 
                'lastName', 
                'gmail', 
                'profileImage',
                'country',
                'totalFollowers',
                'totalCommunities',
                'isActive',
                'isVerified',
                'createdAt'
            ]
        });

        // Format response
        const creators = users.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.gmail,
            avatar: user.profileImage,
            dateJoined: user.createdAt,
            communities: user.totalCommunities || 0,
            followers: user.totalFollowers?.toLocaleString() || '0',
            city: user.country || 'N/A',
            status: user.isActive ? 'active' : 'suspended',
            isVerified: user.isVerified
        }));

        return res.status(200).json({
            success: true,
            data: {
                creators,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Error fetching creators:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch creators',
            error: error.message
        });
    }
};

/**
 * @description Update user status (activate/suspend)
 * @access Private (Admin only)
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // 'active' or 'suspended'

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = status === 'active';
        await user.save();

        return res.status(200).json({
            success: true,
            message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`,
            data: {
                id: user.id,
                status: user.isActive ? 'active' : 'suspended'
            }
        });

    } catch (error) {
        console.error('Error updating user status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
};