import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = "mongodb+srv://restaurant:restaurant04@restaurant.2rtedis.mongodb.net/restaurantdb?retryWrites=true&w=majority&appName=restaurant";

mongoose.connect(uri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Connection error:", err.message));
