import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import menuRouter from "./routes/menuRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
connectDB();

const corOptions = {
  origin:[process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"],
  credentials : true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
app.use(cors(corOptions));

app.use("/api/v1", userRouter);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", menuRouter);
app.use("/api/v1", orderRouter);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
