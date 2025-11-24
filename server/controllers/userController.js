const { User } = require('../models/User');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

/**
 * Détermine si le profil d'un utilisateur est entièrement complété.
 * On considère qu'un profil est complet si les champs clés ne sont pas vides.
 */
const isProfileCompleted = (user) => {
  const stringFields = [
    user.firstName,
    user.lastName,
    user.profileImage,
    user.banner,
    user.profileDescription,
    user.country,
  ];

  const allStringsFilled = stringFields.every((field) => {
    if (typeof field === 'string') {
      return field.trim().length > 0;
    }
    return Boolean(field);
  });

  const hasSocialLinks =
    user.socialMediaLinks &&
    typeof user.socialMediaLinks === 'object' &&
    Object.values(user.socialMediaLinks).some(
      (value) => typeof value === 'string' && value.trim().length > 0
    );

  return allStringsFilled && hasSocialLinks;
};

/**
 * Formate les données utilisateur pour la réponse (sans mot de passe)
 */
const formatUserResponse = (user) => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.gmail || user.primaryIdentifier,
    phone: user.phone,
    profileImage: user.profileImage,
    banner: user.banner,
    profileDescription: user.profileDescription,
    country: user.country,
    socialMediaLinks: user.socialMediaLinks || {},
    totalFollowers: user.totalFollowers,
    totalCommunities: user.totalCommunities,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isProfileCompleted: isProfileCompleted(user),
  };
};

/**
 * Récupère l'utilisateur actuel
 * GET /users/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'utilisateur',
      code: 'GET_USER_ERROR',
      message: error.message,
    });
  }
};

/**
 * Récupère tous les utilisateurs
 * GET /users
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      isDeleted: false,
      isActive: true,
    };

    // Recherche par nom, email ou téléphone si fourni
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { gmail: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: users.map(formatUserResponse),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs',
      code: 'GET_USERS_ERROR',
      message: error.message,
    });
  }
};

/**
 * Récupère un utilisateur par ID
 * GET /users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    // Vérifier si le compte est supprimé ou inactif
    if (user.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'utilisateur',
      code: 'GET_USER_ERROR',
      message: error.message,
    });
  }
};

/**
 * Met à jour le profil utilisateur
 * PUT /users/update
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    // Récupérer l'utilisateur
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    // Si une image de profil est uploadée, elle sera dans req.file (gérée par multer)
    if (req.file && req.file.path) {
      updateData.profileImage = req.file.path;
      if (req.file.public_id) {
        updateData.cloudinaryImagePublicId = req.file.public_id;
      }
    }

    // Ne pas permettre la mise à jour de certains champs sensibles
    delete updateData.password;
    delete updateData.id;
    delete updateData.isDeleted;
    delete updateData.deletedAt;

    // Mettre à jour l'utilisateur
    await user.update(updateData);

    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findByPk(userId);

    return res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: formatUserResponse(updatedUser),
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du profil',
      code: 'UPDATE_USER_ERROR',
      message: error.message,
    });
  }
};

/**
 * Complète l'inscription de l'utilisateur en remplissant les champs obligatoires
 * POST /users/complete-registration
 */
const completeRegistration = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      firstName,
      lastName,
      profileDescription,
      country,
      profileImage,
      banner,
      socialMediaLinks,
    } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    const updateData = {};

    if (typeof firstName !== 'undefined') updateData.firstName = firstName;
    if (typeof lastName !== 'undefined') updateData.lastName = lastName;
    if (typeof profileDescription !== 'undefined')
      updateData.profileDescription = profileDescription;
    if (typeof country !== 'undefined') updateData.country = country;
    if (typeof profileImage !== 'undefined') updateData.profileImage = profileImage;
    if (typeof banner !== 'undefined') updateData.banner = banner;

    if (typeof socialMediaLinks !== 'undefined') {
      let parsedLinks = socialMediaLinks;

      if (typeof socialMediaLinks === 'string') {
        try {
          parsedLinks = JSON.parse(socialMediaLinks);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Format de socialMediaLinks invalide. Utilisez un JSON valide.',
            code: 'INVALID_SOCIAL_LINKS',
          });
        }
      }

      if (parsedLinks && typeof parsedLinks === 'object') {
        updateData.socialMediaLinks = parsedLinks;
      } else {
        return res.status(400).json({
          success: false,
          error: 'socialMediaLinks doit être un objet.',
          code: 'INVALID_SOCIAL_LINKS',
        });
      }
    }

    await user.update(updateData);
    const updatedUser = await User.findByPk(userId);
    const profileCompleted = isProfileCompleted(updatedUser);

    return res.status(200).json({
      success: true,
      message: profileCompleted
        ? 'Profil complété avec succès.'
        : 'Profil mis à jour. Certains champs restent incomplets.',
      data: formatUserResponse(updatedUser),
    });
  } catch (error) {
    console.error('Erreur lors de la complétion du profil:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la complétion du profil',
      code: 'COMPLETE_REGISTRATION_ERROR',
      message: error.message,
    });
  }
};

/**
 * Met à jour le mot de passe
 * PUT /users/updatePassword
 */
const updatePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Erreurs de validation',
        code: 'VALIDATION_ERROR',
        details: errors.array(),
      });
    }

    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Récupérer l'utilisateur
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    // Vérifier le mot de passe actuel
    if (!user.password) {
      return res.status(400).json({
        success: false,
        error: 'Ce compte utilise une connexion sociale. Impossible de changer le mot de passe.',
        code: 'SOCIAL_ACCOUNT',
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Mot de passe actuel incorrect',
        code: 'INVALID_CURRENT_PASSWORD',
      });
    }

    // Hash du nouveau mot de passe
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await user.update({ password: hashedNewPassword });

    return res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du mot de passe',
      code: 'UPDATE_PASSWORD_ERROR',
      message: error.message,
    });
  }
};

/**
 * Supprime un utilisateur (soft delete)
 * DELETE /users/delete
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Récupérer l'utilisateur
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND',
      });
    }

    // Soft delete : marquer comme supprimé
    await user.update({
      isDeleted: true,
      deletedAt: new Date(),
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message: 'Compte supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du compte',
      code: 'DELETE_USER_ERROR',
      message: error.message,
    });
  }
};

module.exports = {
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  completeRegistration,
};

