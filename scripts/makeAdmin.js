// Script to make a user admin
// Run this with: node scripts/makeAdmin.js

const mongoose = require('mongoose');

// User schema (simplified for script)
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isAdmin: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function makeUserAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop');
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return;
    }
    
    // Update user to be admin
    user.isAdmin = true;
    user.role = 'admin';
    await user.save();
    
    console.log(`User ${user.name} (${user.email}) is now an admin`);
    
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/makeAdmin.js <email>');
  console.log('Example: node scripts/makeAdmin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email);
