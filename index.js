import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import tableRouter from './routes/tableRoute.js'
import reserveRouter from "./routes/reservetableRoute.js"
import categoryRoute from './routes/TableCategoryRoute.js'
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
connectDB();

const corOptions = {
  origin: process.env.CLIENT_URL || ["http://localhost:5173"],
  credentials : true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};
app.use(cors(corOptions));

app.use("/api/v1", userRouter);
app.use('/api/v1', tableRouter)
app.use("/api/v1", reserveRouter)
app.use("/api/v1", categoryRoute)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
