const { User } = require('../models/index');

/**
 * Middleware to check if the user has platform-level admin privileges
 * Checks if user's role is 'admin' or 'super_admin'
 */
const checkPlatformAdmin = async (req, res, next) => {
    const userId = req.user.userId;

    try {
        // Get user from database
        const user = await User.findByPk(userId, {
            attributes: ['id', 'role']
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found." 
            });
        }

        // Check if user has admin or super_admin role
        if (user.role !== 'admin' && user.role !== 'super_admin') {
            return res.status(403).json({ 
                success: false, 
                message: "Access denied. Platform admin privileges required." 
            });
        }

        // Store user role for the controller
        req.userRole = user.role;
        next();

    } catch (error) {
        console.error("Error checking platform admin role:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while checking admin privileges.",
            error: error.message
        });
    }
};

module.exports = { checkPlatformAdmin };
