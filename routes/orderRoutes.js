import express from "express";
import { placeOrder, getCustomerOrders,updateOrderStatus, updateOrder, DeleteOrder, addToCart, getPendingOrders, getAllOrder} from "../controllers/orderController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const orderRouter = express.Router()

orderRouter.post("/place-orders", placeOrder);
orderRouter.post("/orders/add-to-cart", addToCart);
orderRouter.get("/orders/pending", getPendingOrders);
orderRouter.get("/orders", getAllOrder);
orderRouter.get("/orders/:customerId", getCustomerOrders);
orderRouter.put("/orders/:orderId/status", protect, authorizeRoles("admin"), updateOrderStatus);
orderRouter.put("/orders/:orderId", protect, updateOrder);
orderRouter.delete("/orders/:orderId/item/:menu_id", protect, DeleteOrder);

export default orderRouter ;