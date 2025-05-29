import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// import "./utils/releaseTable.js";

// Routes
import http from "http";
import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import menuRouter from "./routes/menuRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import InventoryRouter from "./routes/inventoryRoutes.js";
import StockRouter from "./routes/stockRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import LocationRouter from "./routes/locationRoutes.js";
import tableRouter from './routes/tableRoute.js';
import reserveRouter from "./routes/reservetableRoute.js";
import categoryRoute from './routes/TableCategoryRoute.js';
import kitchenRouter from "./routes/kitchenRoutes.js";
import flutterwaveRouter from "./flutter/flutterwaveRoute.js";
import { releaseExpiredReservations } from "./utils/releaseExpiredReservation.js";
import HistoryRouter from "./routes/historyroute.js";
import kitchenTouter from "./controllers/orderController.js";
import { initSocket } from "./utils/socket.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = process.env.CLIENT_URLS?.split(",") || [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://restaurant-dashboard-three.vercel.app",
  "https://restaurant-project-ivory.vercel.app"
];

// CORS config
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server & Socket.io server
const server = http.createServer(app);
export const io = initSocket(server);

// Create a namespace for kitchen staff
export const kitchenNamespace = io.of('/kitchen');

kitchenNamespace.on('connection', (socket) => {
  console.log('Kitchen staff connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Kitchen staff disconnected:', socket.id);
  });
});

// Routes
app.use("/api/v1/flutterwave", flutterwaveRouter);

app.use("/api/v1", userRouter);
app.use("/api/v1", InventoryRouter);
app.use("/api/v1", StockRouter);
app.use("/api/v1", tableRouter);
app.use("/api/v1", reserveRouter);
app.use("/api/v1", categoryRoute);
app.use("/api/v1", categoryRouter);
app.use("/api/v1", menuRouter);
app.use("/api/v1", orderRouter); // Make sure orderRouter can import kitchenNamespace to emit events
app.use("/api/v1", restaurantRouter);
app.use("/api/v1", LocationRouter);
app.use("/api/v1/history", HistoryRouter);
app.use("/api/v1", kitchenRouter);
app.use("/api/v1", kitchenTouter);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  setInterval(releaseExpiredReservations, 60 * 1000); 
});