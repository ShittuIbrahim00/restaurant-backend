import express from 'express';
import { createSupplyItem, getAllSupplyItems, updateSupplyItem } from '../controllers/inventoryController.js';
import { authorizeRoles, protect } from '../middlewares/authMiddleware.js';

const InventoryRouter = express.Router();

InventoryRouter.post("/create-inventory", protect, createSupplyItem)
InventoryRouter.get("/inventories", protect, getAllSupplyItems);

InventoryRouter.put("/inventory", protect, updateSupplyItem);

export default InventoryRouter;
