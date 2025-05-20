import express from "express";
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import "./utils/releaseTable.js";
import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import menuRouter from "./routes/menuRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import InventoryRouter from "./routes/inventoryRoutes.js";
import StockRouter from "./routes/stockRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import LocationRouter from "./routes/locationRoutes.js";

import tableRouter from './routes/tableRoute.js'
import reserveRouter from "./routes/reservetableRoute.js"
import categoryRoute from './routes/TableCategoryRoute.js'
import webhookRouter from "./routes/stripeWebhook.js";
import paymentRouter from "./routes/paymentRoute.js";
import { releaseExpiredReservations } from "./utils/releaseTable.js";

dotenv.config();
connectDB();

const app = express();

// Stripe Webhook Route - RAW Body Parser (MUST BE FIRST)
app.use("/api/v1/webhook/stripe", express.raw({ type: "application/json" }), webhookRouter);

// General Middleware
app.use(express.json()); // JSON Body Parser (for normal APIs)
app.use(cookieParser());

// CORS Setup
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

setInterval(() => {
  releaseExpiredReservations();
}, 30 * 1000);
// Routes
app.use("/api/v1", userRouter);
app.use("/api/v1", InventoryRouter);
app.use("/api/v1", StockRouter);
app.use('/api/v1', tableRouter)
app.use("/api/v1", reserveRouter)
app.use("/api/v1", categoryRoute)
app.use("/api/v1", categoryRouter);
app.use("/api/v1", menuRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", restaurantRouter);
app.use("/api/v1", LocationRouter);
app.use("/api/v1", paymentRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
