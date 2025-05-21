import express from "express";
import { placeOrder, getCustomerOrders,updateOrderStatus, getAllOrders} from "../controllers/orderController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const orderRouter = express.Router()

orderRouter.post("/place-orders", placeOrder);
orderRouter.get("/orders/:customerId", getCustomerOrders);
orderRouter.put("/orders/:orderId/status", protect, authorizeRoles("admin"), updateOrderStatus);
orderRouter.get("/get-all-orders", protect,authorizeRoles("admin"), getAllOrders)

export default orderRouter ;