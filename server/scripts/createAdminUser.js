const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { gmail: 'admin@ajiw.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@ajiw.com');
      console.log('Password: Admin123!');
      console.log('Role:', existingAdmin.role);
      
      // Update role to admin if needed
      if (existingAdmin.role !== 'admin') {
        await existingAdmin.update({ role: 'admin', isVerified: true, isActive: true });
        console.log('Updated user role to admin');
      }
      
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      gmail: 'admin@ajiw.com',
      phone: '+1234567890',
      password: hashedPassword,
      primaryIdentifier: 'admin@ajiw.com',
      role: 'admin',
      isVerified: true,
      isActive: true,
      isDeleted: false
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@ajiw.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role: admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('You can now login with these credentials');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

createAdminUser();
