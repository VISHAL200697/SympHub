import mongoose from 'mongoose';

const connectDB = async () => {
  let mongoUri = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/symposium_db').trim();

  // Strip accidental quotes or prefix from copy-pasting
  mongoUri = mongoUri.replace(/^['"]|['"]$/g, '').trim();
  if (mongoUri.startsWith('MONGO_URI=')) {
    mongoUri = mongoUri.replace('MONGO_URI=', '').trim();
  }

  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    console.error(`⚠️ Invalid MONGO_URI format: Expected connection string starting with "mongodb://" or "mongodb+srv://".`);
    console.error(`⚠️ Received value starting with: "${mongoUri.substring(0, 20)}..."`);
    return null;
  }

  // Detect unescaped '@' in password
  const authority = mongoUri.split('://')[1]?.split('/')[0] || '';
  if ((authority.match(/@/g) || []).length > 1) {
    console.error('⚠️ Multiple "@" characters detected in MONGO_URI.');
    console.error('👉 If your MongoDB password has an "@" symbol, replace it with "%40" (URL encoded).');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.error(`⚠️ Please check that MONGO_URI is set correctly in environment variables and that your MongoDB Atlas cluster has 0.0.0.0/0 allowed under Network Access.`);
    return null;
  }
};

export default connectDB;
