import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/symposium_db';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.error(`⚠️ Please check that MONGO_URI is set correctly in environment variables and that your MongoDB Atlas cluster has 0.0.0.0/0 allowed under Network Access.`);
    // Do not rethrow here to prevent unhandled rejection crashing the Express web process
  }
};

export default connectDB;
