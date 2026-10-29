import mongoose from 'mongoose';

let lastDbError = null;

const connectDB = async () => {
  let rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!rawUri) {
    console.warn('⚠️ No MONGO_URI, MONGODB_URI, or MONGO_URL found in environment variables! Falling back to 127.0.0.1.');
  }
  let mongoUri = (rawUri || 'mongodb://127.0.0.1:27017/symposium_db').trim();

  // Strip accidental quotes or prefix from copy-pasting
  mongoUri = mongoUri.replace(/^['"]|['"]$/g, '').trim();
  if (mongoUri.startsWith('MONGO_URI=')) {
    mongoUri = mongoUri.replace('MONGO_URI=', '').trim();
  }

  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    lastDbError = `Invalid scheme: starts with "${mongoUri.substring(0, 15)}...". Expected "mongodb://" or "mongodb+srv://".`;
    console.error(`⚠️ ${lastDbError}`);
    return null;
  }

  // Detect unescaped '@' in password
  const authority = mongoUri.split('://')[1]?.split('/')[0] || '';
  if ((authority.match(/@/g) || []).length > 1) {
    lastDbError = 'Multiple "@" symbols detected in MONGO_URI. Encode any "@" in your password as "%40".';
    console.error(`⚠️ ${lastDbError}`);
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    lastDbError = null;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    lastDbError = error.message;
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.error(`⚠️ Please check that MONGO_URI is set correctly in environment variables and that your MongoDB Atlas cluster has 0.0.0.0/0 allowed under Network Access.`);
    return null;
  }
};

export const getDbError = () => lastDbError;
export default connectDB;
