const express = require('express');
const { authenticateToken } = require('../middleware/authEnhanced');
const { uploadImage } = require('../config/cloudinary');

const {
  getCurrentUser,
  updateUser,
  getAllUsers,
  getUserById,
  updatePassword,
  deleteUser,
  completeRegistration,
} = require('../controllers/userController.js');

const UserRouter = express.Router();

// Routes protégées (nécessitent une authentification)
UserRouter.get('/me', authenticateToken, getCurrentUser);
UserRouter.get('/', authenticateToken, getAllUsers);
UserRouter.get('/:id', authenticateToken, getUserById);
UserRouter.put('/update', authenticateToken, uploadImage.single('profileImage'), updateUser);
UserRouter.put('/updatePassword', authenticateToken, updatePassword);
UserRouter.post('/complete-registration', authenticateToken, completeRegistration);
UserRouter.delete('/delete', authenticateToken, deleteUser);

module.exports = { userRouter: UserRouter };

