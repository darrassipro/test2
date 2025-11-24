const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { Settings } = require('../models/Settings');
require('dotenv').config();

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET;

// ========================================
// MIDDLEWARE D'AUTHENTIFICATION
// ========================================


/**
 * ✅ Middleware pour les utilisateurs vérifiés uniquement
 */
const requireVerified = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentification requise',
                code: 'AUTH_REQUIRED'
            });
        }

        // Récupération des informations complètes de l'utilisateur
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non trouvé',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if email verification is enabled in settings
        const emailVerificationSetting = await Settings.findOne({
            where: { key: 'email_verification_enabled' }
        });

        const isEmailVerificationEnabled = emailVerificationSetting
            ? emailVerificationSetting.value === 'true'
            : true; // Default to true if setting doesn't exist

        // Only block unverified users if email verification is enabled
        if (isEmailVerificationEnabled && !user.isVerified) {
            return res.status(403).json({
                success: false,
                error: 'Compte non vérifié',
                code: 'ACCOUNT_NOT_VERIFIED',
                message: 'Veuillez vérifier votre email pour accéder à cette fonctionnalité'
            });
        }

        next();
    } catch (error) {
        console.log('Erreur de vérification du statut:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur de vérification du statut',
            code: 'VERIFICATION_ERROR'
        });
    }
};

/**
 * 🛡️ Middleware de rate limiting par utilisateur
 * Limite le nombre de requêtes par utilisateur
 * le nombre des requêtes est de 1000 par minute
 */
const rateLimitByUser = (maxRequests = 1000, windowMs = 1 * 60 * 1000) => {
    const userRequests = new Map();

    return (req, res, next) => {
        if (!req.user) {
            return next(); // Pas de rate limiting pour les utilisateurs non connectés
        }

        const userId = req.user.userId;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Nettoyer les anciennes entrées
        if (userRequests.has(userId)) {
            const requests = userRequests.get(userId).filter(time => time > windowStart);
            userRequests.set(userId, requests);
        } else {
            userRequests.set(userId, []);
        }

        const userRequestCount = userRequests.get(userId).length;

        if (userRequestCount >= maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Trop de requêtes',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }

        // Ajouter la requête actuelle
        userRequests.get(userId).push(now);

        next();
    };
};

module.exports = {
    requireVerified,
    rateLimitByUser
};