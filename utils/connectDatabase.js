const mongoose = require('mongoose');

const databaseConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database is successfully connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = databaseConnect;