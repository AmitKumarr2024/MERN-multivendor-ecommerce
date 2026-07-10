import mongoose from "mongoose";
import logger from "../logs/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`, {
      stack: error.stack,
    });
    process.exit(1);
  }
};

export default connectDB;
