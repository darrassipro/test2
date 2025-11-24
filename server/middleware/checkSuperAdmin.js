const { User } = require('../models/index'); 

/**
 * @description Middleware qui vérifie si l'utilisateur authentifié a le rôle global 'super-admin'.
 */
exports.checkSuperAdmin = async (req, res, next) => {
    // Le userId est récupéré après le middleware d'authentification (req.user)
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ 
            success: false, 
            message: "Non autorisé. Jeton manquant ou invalide." 
        });
    }

    const userId = req.user.userId;

    try {
        const user = await User.findByPk(userId, {
            // Récupérer le champ 'role' que vous venez d'ajouter
            attributes: ['role'] 
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Utilisateur non trouvé." 
            });
        }
        
        // Vérification du statut Super-Admin : le rôle doit être 'super-admin'
        if (user.role === 'super-admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Accès refusé. Cette opération requiert le statut de Super-Administrateur."
            });
        }

    } catch (error) {
        console.error("Erreur dans le middleware checkSuperAdmin:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la vérification des permissions."
        });
    }
};