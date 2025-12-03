const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/authEnhanced');
const { uploadUserProfile } = require('../config/cloudinary');

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
// Validation rules pour la mise à jour du mot de passe
const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .notEmpty()
    .withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
];
// Routes protégées (nécessitent une authentification)
UserRouter.get('/me', authenticateToken, getCurrentUser);
UserRouter.get('/', authenticateToken, getAllUsers);
UserRouter.get('/:id', authenticateToken, getUserById);
UserRouter.put('/update', authenticateToken, uploadUserProfile.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), updateUser);
UserRouter.put('/updatePassword', authenticateToken, updatePasswordValidation, updatePassword);
UserRouter.post('/complete-registration', authenticateToken, uploadUserProfile.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), completeRegistration);
UserRouter.delete('/delete', authenticateToken, deleteUser);

module.exports = { userRouter: UserRouter };

