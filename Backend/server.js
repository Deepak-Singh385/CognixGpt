import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173", // Vite local
  "https://cognix-frontend.onrender.com",
];

app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected with DB");
  } catch (err) {
    console.log("DB Connection Failed", err);
    process.exit(1); // Important in production
  }
};

connectDb();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
