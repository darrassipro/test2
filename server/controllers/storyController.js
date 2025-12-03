const { Story } = require('../models/Story');
const { StoryView } = require('../models/StoryView');
const { User } = require('../models/User');
const { Op } = require('sequelize');

/**
 * Generate Cloudinary URL from public ID
 */
const getCloudinaryUrl = (publicId) => {
  if (!publicId) return null;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};

/**
 * Récupère la dernière story de chaque utilisateur (une seule story par utilisateur)
 * GET /stories
 */
const getAllStories = async (req, res) => {
  try {
    const now = new Date();

    // Récupérer toutes les stories actives et non expirées
    const allStories = await Story.findAll({
      where: {
        isActive: true,
        expiresAt: {
          [Op.gt]: now, // expiresAt > now (pas encore expirées)
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: StoryView,
          as: 'views',
          attributes: ['id', 'viewerId', 'createdAt'],
          include: [
            {
              model: User,
              as: 'viewer',
              attributes: ['id', 'firstName', 'lastName', 'profileImage'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']], // Plus récentes en premier
    });

    // Grouper par userId et prendre la plus récente de chaque utilisateur
    const storiesByUser = new Map();
    allStories.forEach((story) => {
      const userId = story.userId;
      if (!storiesByUser.has(userId)) {
        storiesByUser.set(userId, story);
      }
    });

    // Convertir la Map en tableau
    const latestStories = Array.from(storiesByUser.values());

    // Structurer les données de réponse
    const formattedStories = latestStories.map((story) => {
      // Extraire les viewers avec seulement les champs demandés
      const viewers = story.views.map((view) => ({
        id: view.viewer.id,
        firstName: view.viewer.firstName,
        lastName: view.viewer.lastName,
        profileImage: view.viewer.profileImage,
      }));

      return {
        id: story.id,
        userId: story.userId,
        mediaUrl: story.mediaUrl,
        cloudinaryPublicId: story.cloudinaryPublicId,
        caption: story.caption,
        expiresAt: story.expiresAt,
        isActive: story.isActive,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        // Informations de l'auteur
        author: {
          id: story.user.id,
          firstName: story.user.firstName,
          lastName: story.user.lastName,
          profileImage: story.user.profileImage,
        },
        // Liste des viewers
        viewers: viewers,
        // Nombre de vues
        storyViewCount: story.views.length,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        stories: formattedStories,
        storyCount: formattedStories.length,
      },
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des stories',
      code: 'FETCH_STORIES_ERROR',
      message: error.message,
    });
  }
};

/**
 * Récupère une story par son ID avec ses vues et les utilisateurs qui l'ont vue
 * GET /stories/:id
 */
const getStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date();

    // Récupérer la story par ID
    const story = await Story.findOne({
      where: {
        id: id,
        isActive: true,
        expiresAt: {
          [Op.gt]: now, // expiresAt > now (pas encore expirée)
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'cloudinaryImagePublicId'],
        },
        {
          model: StoryView,
          as: 'views',
          attributes: ['id', 'viewerId', 'createdAt'],
          include: [
            {
              model: User,
              as: 'viewer',
              attributes: ['id', 'firstName', 'lastName', 'cloudinaryImagePublicId'],
            },
          ],
        },
      ],
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story non trouvée ou expirée',
        code: 'STORY_NOT_FOUND',
      });
    }

    // Extraire les viewers avec seulement les champs demandés
    const viewers = story.views.map((view) => ({
      id: view.viewer.id,
      firstName: view.viewer.firstName,
      lastName: view.viewer.lastName,
      profileImage: view.viewer.profileImage,
    }));

    // Structurer les données de réponse
    const formattedStory = {
      id: story.id,
      userId: story.userId,
      mediaUrl: story.mediaUrl,
      cloudinaryPublicId: story.cloudinaryPublicId,
      caption: story.caption,
      expiresAt: story.expiresAt,
      isActive: story.isActive,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
      // Informations de l'auteur
      author: {
        id: story.user.id,
        firstName: story.user.firstName,
        lastName: story.user.lastName,
        profileImage: story.user.profileImage,
      },
      // Liste des viewers
      viewers: viewers,
      // Nombre de vues
      storyViewCount: story.views.length,
    };

    return res.status(200).json({
      success: true,
      data: formattedStory,
    });
  } catch (error) {
    console.error('Error fetching story by id:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la story',
      code: 'FETCH_STORY_ERROR',
      message: error.message,
    });
  }
};

/**
 * Récupère toutes les stories d'un utilisateur spécifique
 * GET /stories/user/:userId
 */
const getStoriesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    
    // Récupérer toutes les stories de l'utilisateur actives et non expirées
    const stories = await Story.findAll({
      where: {
        userId: userId,
        isActive: true,
        expiresAt: {
          [Op.gt]: now, // expiresAt > now (pas encore expirées)
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        },
        {
          model: StoryView,
          as: 'views',
          attributes: ['id', 'viewerId', 'createdAt'],
          include: [
            {
              model: User,
              as: 'viewer',
              attributes: ['id', 'firstName', 'lastName', 'profileImage'],
            },
          ],
        },
      ],
      order: [['createdAt', 'ASC']], // Plus anciennes en premier (pour parcourir dans l'ordre)
    });

    if (stories.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Aucune story trouvée pour cet utilisateur',
        code: 'NO_STORIES_FOUND',
      });
    }

    // Structurer les données de réponse
    const formattedStories = stories.map((story) => {
      // Extraire les viewers avec seulement les champs demandés
      const viewers = story.views.map((view) => ({
        id: view.viewer.id,
        firstName: view.viewer.firstName,
        lastName: view.viewer.lastName,
        profileImage: view.viewer.profileImage,
      }));

      return {
        id: story.id,
        userId: story.userId,
        mediaUrl: story.mediaUrl,
        cloudinaryPublicId: story.cloudinaryPublicId,
        caption: story.caption,
        expiresAt: story.expiresAt,
        isActive: story.isActive,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
        // Informations de l'auteur
        author: {
          id: story.user.id,
          firstName: story.user.firstName,
          lastName: story.user.lastName,
          profileImage: story.user.profileImage,
        },
        // Liste des viewers
        viewers: viewers,
        // Nombre de vues
        storyViewCount: story.views.length,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        stories: formattedStories,
        storyCount: formattedStories.length,
        author: formattedStories[0]?.author || null,
      },
    });
  } catch (error) {
    console.error('Error fetching stories by user:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des stories de l\'utilisateur',
      code: 'FETCH_USER_STORIES_ERROR',
      message: error.message,
    });
  }
};

module.exports = {
  getAllStories,
  getStoryById,
  getStoriesByUser,
};

