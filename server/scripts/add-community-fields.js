const { Community } = require('../models/Community');
const db = require('../config/db');

async function addCommunityFields() {
  try {
    const sequelize = db.getSequelize();
    
    // Check if columns exist and add them if they don't
    const queryInterface = sequelize.getQueryInterface();
    
    try {
      await queryInterface.addColumn('communities', 'country', {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      });
      console.log('Added country column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Country column already exists');
      } else {
        console.error('Error adding country column:', error.message);
      }
    }

    try {
      await queryInterface.addColumn('communities', 'facebook_link', {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      });
      console.log('Added facebook_link column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Facebook_link column already exists');
      } else {
        console.error('Error adding facebook_link column:', error.message);
      }
    }

    try {
      await queryInterface.addColumn('communities', 'instagram_link', {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      });
      console.log('Added instagram_link column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Instagram_link column already exists');
      } else {
        console.error('Error adding instagram_link column:', error.message);
      }
    }

    try {
      await queryInterface.addColumn('communities', 'whatsapp_link', {
        type: sequelize.Sequelize.STRING,
        allowNull: true,
      });
      console.log('Added whatsapp_link column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Whatsapp_link column already exists');
      } else {
        console.error('Error adding whatsapp_link column:', error.message);
      }
    }

    console.log('Database schema update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database schema:', error);
    process.exit(1);
  }
}

addCommunityFields();