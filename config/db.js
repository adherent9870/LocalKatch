import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "LocalLoop",
    });
    console.log(`✅MongoDB Connection: ${conn.connection.host}`);
    mongoose.connection.once("open", () => {
      console.log("Database:", mongoose.connection.name);
    });
  } catch (error) {
    console.error("✖️DB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
