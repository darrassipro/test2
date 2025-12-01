const { User } = require('../models/User');
const { EmailVerification } = require('../models/EmailVerification');
const { generateOTP, hashOTP, verifyOTPCode, sendVerificationEmail } = require('../services/emailSender');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const OTP_EXPIRATION_MINUTES = 10;

/**
 * Génère un token JWT avec les informations de l'utilisateur
 */
const generateToken = (user) => {
    const payload = {
        userId: user.id,
        email: user.gmail || user.primaryIdentifier,
        phone: user.phone,
        primaryIdentifier: user.primaryIdentifier,
        isVerified: user.isVerified,
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

/**
 * Formate les données utilisateur pour la réponse (sans mot de passe)
 */
const formatUserResponse = (user) => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.gmail || user.primaryIdentifier,
        phone: user.phone,
        profileImage: user.profileImage,
        banner: user.banner,
        profileDescription: user.profileDescription,
        country: user.country,
        totalFollowers: user.totalFollowers,
        totalCommunities: user.totalCommunities,
        isVerified: user.isVerified,
        isActive: user.isActive,
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

/**
 * Inscription d'un nouvel utilisateur
 * POST /auth/register
 */
const registerUser = async (req, res) => {
    try {
        // Vérification des erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Erreurs de validation',
                code: 'VALIDATION_ERROR',
                details: errors.array(),
            });
        }

        const { firstName, lastName, email, mobileNumber, password } = req.body;

        // Vérifier si l'utilisateur existe déjà (par email ou téléphone)
        const existingUserByEmail = await User.findOne({
            where: { gmail: email },
        });

        if (existingUserByEmail) {
            return res.status(409).json({
                success: false,
                error: 'Un compte existe déjà avec cet email',
                code: 'EMAIL_ALREADY_EXISTS',
            });
        }

        // Vérifier si l'utilisateur est supprimé (soft delete)
        if (existingUserByEmail && existingUserByEmail.isDeleted) {
            return res.status(403).json({
                success: false,
                error: 'Ce compte a été supprimé. Veuillez contacter le support.',
                code: 'ACCOUNT_DELETED',
            });
        }

        // Hash du mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Générer le primaryIdentifier (email normalisé)
        const primaryIdentifier = email.toLowerCase().trim();

        // Créer l'utilisateur
        const newUser = await User.create({
            firstName: firstName,
            lastName: lastName,
            gmail: email.toLowerCase().trim(),
            phone: mobileNumber,
            password: hashedPassword,
            primaryIdentifier: primaryIdentifier,
            isVerified: false,
            isActive: true,
            isDeleted: false,
        });

        // Générer et envoyer l'OTP
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        
        // Supprimer les anciens OTP pour cet email
        await EmailVerification.destroy({
            where: { email: email.toLowerCase().trim() },
        });

        // Créer le nouvel OTP
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRATION_MINUTES);

        await EmailVerification.create({
            email: email.toLowerCase().trim(),
            otp: hashedOtp,
            expiresAt: expiresAt,
        });

        // Envoyer l'email de vérification
        try {
            await sendVerificationEmail(email, otp, `${firstName} ${lastName}`);
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            // Ne pas bloquer l'inscription si l'email échoue, mais logger l'erreur
        }

        // Générer le token JWT
        const token = generateToken(newUser);

        // Retourner la réponse avec le token et les infos utilisateur
        return res.status(201).json({
            success: true,
            message: 'Inscription réussie. Veuillez vérifier votre email.',
            data: {
                token: token,
                user: formatUserResponse(newUser),
            },
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'inscription',
            code: 'REGISTRATION_ERROR',
            message: error.message,
        });
    }
};

/**
 * Connexion d'un utilisateur
 * POST /auth/login
 */
const loginUser = async (req, res) => {
    try {
        // Vérification des erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Erreurs de validation',
                code: 'VALIDATION_ERROR',
                details: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Rechercher l'utilisateur par email (gmail ou primaryIdentifier)
        const user = await User.findOne({
            where: {
                gmail: email.toLowerCase().trim(),
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect',
                code: 'INVALID_CREDENTIALS',
            });
        }

        // Vérifier si le compte est supprimé
        if (user.isDeleted) {
            return res.status(403).json({
                success: false,
                error: 'Ce compte a été supprimé. Veuillez contacter le support.',
                code: 'ACCOUNT_DELETED',
            });
        }

        // Vérifier si le compte est actif
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Ce compte a été désactivé. Veuillez contacter le support.',
                code: 'ACCOUNT_INACTIVE',
            });
        }

        // Vérifier le mot de passe
        if (!user.password) {
            return res.status(401).json({
                success: false,
                error: 'Ce compte utilise une connexion sociale. Veuillez vous connecter avec votre compte social.',
                code: 'SOCIAL_LOGIN_REQUIRED',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Email ou mot de passe incorrect',
                code: 'INVALID_CREDENTIALS',
            });
        }

        // Générer le token JWT
        const token = generateToken(user);

        // Retourner la réponse avec le token et les infos utilisateur
        return res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                token: token,
                user: formatUserResponse(user),
            },
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur lors de la connexion',
            code: 'LOGIN_ERROR',
            message: error.message,
        });
    }
};

/**
 * Envoi d'un code OTP par email
 * POST /auth/sendOTP
 */
const sendOtp = async (req, res) => {
    try {
        // Vérification des erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Erreurs de validation',
                code: 'VALIDATION_ERROR',
                details: errors.array(),
            });
        }

        const { email } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({
            where: { gmail: normalizedEmail },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Aucun compte trouvé avec cet email',
                code: 'USER_NOT_FOUND',
            });
        }

        // Vérifier si le compte est déjà vérifié
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                error: 'Ce compte est déjà vérifié',
                code: 'ALREADY_VERIFIED',
            });
        }

        // Générer un nouvel OTP
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);
        
        // Vérifier que le hash fonctionne (test de vérification)
        const testVerification = await verifyOTPCode(otp, hashedOtp);
        if (!testVerification) {
            console.error('ERREUR dans sendOtp: Le hash OTP ne peut pas être vérifié immédiatement après création!');
        }

        // Supprimer les anciens OTP pour cet email
        await EmailVerification.destroy({
            where: { email: normalizedEmail },
        });

        // Créer le nouvel OTP
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRATION_MINUTES);

        const emailVerificationRecord = await EmailVerification.create({
            email: normalizedEmail,
            otp: hashedOtp,
            expiresAt: expiresAt,
        });


        // Envoyer l'email de vérification
        try {
            await sendVerificationEmail(email, otp, user.username || user.firstName + ' ' + user.lastName || 'Utilisateur');
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'envoi de l\'email',
                code: 'EMAIL_SEND_ERROR',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Code OTP envoyé avec succès',
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'OTP:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi de l\'OTP',
            code: 'OTP_SEND_ERROR',
            message: error.message,
        });
    }
};

/**
 * Vérification du code OTP
 * POST /auth/verifyOTP
 */
const verifyOTP = async (req, res) => {
    try {
        // Vérification des erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Erreurs de validation',
                code: 'VALIDATION_ERROR',
                details: errors.array(),
            });
        }

        const { email, otp } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({
            where: { gmail: normalizedEmail },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Aucun compte trouvé avec cet email',
                code: 'USER_NOT_FOUND',
            });
        }

        // Vérifier si le compte est déjà vérifié
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                error: 'Ce compte est déjà vérifié',
                code: 'ALREADY_VERIFIED',
            });
        }

        // Récupérer TOUS les OTP non expirés pour cet email
        // Tester avec tous les OTP valides (peut-être que l'utilisateur utilise un ancien OTP)
        const allValidEmailVerifications = await EmailVerification.findAll({
            where: {
                email: normalizedEmail,
                expiresAt: {
                    [Op.gte]: new Date(), // Non expiré
                },
            },
            order: [['createdAt', 'DESC']],
        });

        if (!allValidEmailVerifications || allValidEmailVerifications.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Aucun code OTP trouvé. Veuillez demander un nouveau code.',
                code: 'OTP_NOT_FOUND',
            });
        }

        // Essayer de vérifier avec tous les OTP valides (le plus récent en premier)
        let emailVerification = null;
        let isOtpValidInAny = false;

        for (const ev of allValidEmailVerifications) {
            // Vérifier que l'OTP n'a pas expiré
            if (new Date() > new Date(ev.expiresAt)) {
                continue; // Passer à l'OTP suivant
            }
            
            const storedOtp = String(ev.otp || '');
            if (storedOtp && storedOtp.startsWith('$2')) {
                const testValid = await verifyOTPCode(String(otp).trim(), storedOtp);
                if (testValid) {
                    isOtpValidInAny = true;
                    emailVerification = ev;
                    break;
                }
            }
        }

        // Si aucun OTP ne correspond, utiliser le plus récent pour les logs et erreur
        if (!emailVerification) {
            emailVerification = allValidEmailVerifications[0];
        }

        // Vérifier si l'OTP a expiré
        if (new Date() > new Date(emailVerification.expiresAt)) {
            await EmailVerification.destroy({
                where: { id: emailVerification.id },
            });
            return res.status(400).json({
                success: false,
                error: 'Le code OTP a expiré. Veuillez demander un nouveau code.',
                code: 'OTP_EXPIRED',
            });
        }

        // Si l'OTP a déjà été vérifié dans la boucle précédente, utiliser ce résultat
        let isOtpValid = isOtpValidInAny;
        
        // Sinon, vérifier avec l'OTP le plus récent
        if (!isOtpValid) {
            const storedOtp = String(emailVerification.otp || '');
            const isHashed = storedOtp && storedOtp.startsWith('$2');
            const otpString = String(otp).trim();
            
            if (isHashed) {
                try {
                    isOtpValid = await verifyOTPCode(otpString, storedOtp);
                } catch (bcryptError) {
                    console.error('Erreur lors de bcrypt.compare:', bcryptError);
                    isOtpValid = false;
                }
            } else {
                isOtpValid = otpString === storedOtp.trim();
            }
        }
        
        if (!isOtpValid) {
            return res.status(400).json({
                success: false,
                error: 'Code OTP invalide. Veuillez utiliser le code le plus récent reçu par email.',
                code: 'INVALID_OTP',
            });
        }

        // Marquer l'utilisateur comme vérifié
        await user.update({ isVerified: true });

        // Supprimer l'OTP utilisé
        await EmailVerification.destroy({
            where: { id: emailVerification.id },
        });

        // Générer un nouveau token avec le statut vérifié mis à jour
        const token = generateToken(user);

        // Retourner la réponse avec le token et les infos utilisateur
        return res.status(200).json({
            success: true,
            message: 'Email vérifié avec succès',
            data: {
                token: token,
                user: formatUserResponse(user),
            },
        });
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'OTP:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification de l\'OTP',
            code: 'OTP_VERIFY_ERROR',
            message: error.message,
        });
    }
};

/**
 * Renvoi d'un code OTP
 * POST /auth/resendOTP
 */
const resendOTP = async (req, res) => {
    try {
        // Vérification des erreurs de validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Erreurs de validation',
                code: 'VALIDATION_ERROR',
                details: errors.array(),
            });
        }

        const { email } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({
            where: { gmail: normalizedEmail },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Aucun compte trouvé avec cet email',
                code: 'USER_NOT_FOUND',
            });
        }

        // Vérifier si le compte est déjà vérifié
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                error: 'Ce compte est déjà vérifié',
                code: 'ALREADY_VERIFIED',
            });
        }

        // Générer un nouvel OTP
        const otp = generateOTP();
        const hashedOtp = await hashOTP(otp);

        // Supprimer les anciens OTP pour cet email
        await EmailVerification.destroy({
            where: { email: normalizedEmail },
        });

        // Créer le nouvel OTP
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRATION_MINUTES);

        await EmailVerification.create({
            email: normalizedEmail,
            otp: hashedOtp,
            expiresAt: expiresAt,
        });

        // Envoyer l'email de vérification
        try {
            await sendVerificationEmail(email, otp, user.username || 'Utilisateur');
        } catch (emailError) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailError);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'envoi de l\'email',
                code: 'EMAIL_SEND_ERROR',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Code OTP renvoyé avec succès',
        });
    } catch (error) {
        console.error('Erreur lors du renvoi de l\'OTP:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur lors du renvoi de l\'OTP',
            code: 'OTP_RESEND_ERROR',
            message: error.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    sendOtp,
    verifyOTP,
    resendOTP,
};

