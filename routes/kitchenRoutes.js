// routes/kitchenRoutes.js
import express from "express";
import { processKitchenOrder } from "../controllers/kitchenController.js";

const router = express.Router();

router.put("/kitchen/process/:orderId", processKitchenOrder);

export default router;
