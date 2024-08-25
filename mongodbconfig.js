import mongoose from 'mongoose';

export const mongoosedatabse = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
  } catch (error) {
    console.error(error);
  }
};