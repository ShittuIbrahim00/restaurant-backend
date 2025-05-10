import express from 'express';
import { createStockMovement, getAllStockMovements, getMonthlyStockTrend } from '../controllers/stockController.js';
import { protect } from '../middlewares/authMiddleware.js';

const StockRouter = express.Router();

// StockRouter.route('/')
StockRouter.post("/create-stock", protect, createStockMovement)
StockRouter.get("/stocks", protect, getAllStockMovements);
StockRouter.get("/stock/trend", getMonthlyStockTrend);


export default StockRouter;
