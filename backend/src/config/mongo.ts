// backend/src/config/mongo.ts
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/fulbo_chat";

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🟢 MongoDB (Chat) Conectado Exitosamente");
  } catch (error) {
    console.error("🔴 Error conectando a MongoDB:", error);
    process.exit(1);
  }
};