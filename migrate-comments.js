const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: 'e:/Projects/Story-Website/Backend/.env' });

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Mongoose raw query because we don't have access to the model here easily without path resolutions
    const db = mongoose.connection.db;
    const collection = db.collection('comments');

    const result = await collection.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'approved' } }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} comments.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runMigration();
