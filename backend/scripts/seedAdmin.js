require('dotenv').config();
const authService = require('../src/services/authService');
const userRepository = require('../src/repositories/userRepository');
const { hashPassword } = require('../src/utils/authUtils');

const ADMIN_EMAIL = 'admin@rarenest.co';
const ADMIN_PASSWORD = 'password@123';

async function seedAdmin() {
  try {
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    const existing = await authService.findUserByEmail(ADMIN_EMAIL);

    if (existing) {
      await authService.updatePassword(existing.id, passwordHash);
      await userRepository.updateRole(existing.id, 'Admin');
      console.log(`Updated admin user: ${ADMIN_EMAIL}`);
    } else {
      await authService.createUser({
        email: ADMIN_EMAIL,
        password_hash: passwordHash,
        first_name: 'Rare',
        last_name: 'Nest',
        phone: null,
        address: null,
        role: 'Admin',
      });
      console.log(`Created admin user: ${ADMIN_EMAIL}`);
    }

    console.log('Admin seed complete. Login with the configured email and password.');
    process.exit(0);
  } catch (err) {
    console.error('Admin seed failed:', err.message);
    process.exit(1);
  }
}

seedAdmin();
