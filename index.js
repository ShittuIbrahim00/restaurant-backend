import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import InventoryRouter from "./routes/inventoryRoutes.js";
import StockRouter from "./routes/stockRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import LocationRouter from "./routes/locationRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.CLIENT_URLS?.split(",") || [
  "http://localhost:5173",
  "http://localhost:5175",
  "https://restaurant-dashboard-three.vercel.app",
  "https://restaurant-project-ivory.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};

app.use(cors(corsOptions));

// Routes
app.use("/api/v1", userRouter);
app.use("/api/v1", InventoryRouter);
app.use("/api/v1", StockRouter);
app.use("/api/v1", restaurantRouter);
app.use("/api/v1", LocationRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
