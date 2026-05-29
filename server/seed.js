require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const mockUsers = require('./mockUsers.json');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected for seeding...');

  await User.deleteMany({});  // clear existing
  await User.insertMany(mockUsers);

  console.log(`✅ Seeded ${mockUsers.length} users`);
  process.exit();
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});