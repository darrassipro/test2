const { DataTypes } = require('sequelize');
const db = require('../config/db');

const sequelize = db.getSequelize();

const EmailVerification = sequelize.define('EmailVerification', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'email_verifications',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

module.exports = { EmailVerification };

