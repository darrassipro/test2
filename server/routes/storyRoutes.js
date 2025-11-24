const express = require('express');
const { authenticateToken } = require('../middleware/authEnhanced');
const { getAllStories, getStoryById, getStoriesByUser } = require('../controllers/storyController');

const StoryRouter = express.Router();

// Route pour récupérer toutes les stories (dernière story de chaque utilisateur)
StoryRouter.get('/', authenticateToken, getAllStories);

// Route pour récupérer toutes les stories d'un utilisateur spécifique
StoryRouter.get('/user/:userId', authenticateToken, getStoriesByUser);

// Route pour récupérer une story par son ID
StoryRouter.get('/:id', authenticateToken, getStoryById);

module.exports = { storyRouter: StoryRouter };

