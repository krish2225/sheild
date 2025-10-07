import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sheild_iot';
  const mongooseOpts = {
    autoIndex: true,
  };

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, mongooseOpts);
};


