import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recoverai', {
      serverSelectionTimeoutMS: 4000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database] MongoDB Connection Notice: ${error.message}`);
    console.warn('[Database] Note: Ensure MongoDB Atlas URI or local mongod is active. Server will operate with graceful persistence fallback.');
    return false;
  }
};
