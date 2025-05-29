import express from "express";
import {
  createMenu,
  getMenu,
  getMenuByCategory,
  getSingleCategory,
  updateMenu,
} from "../controllers/menuController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const menuRouter = express.Router();

menuRouter.post("/create-menu", protect, authorizeRoles("admin"), createMenu);
menuRouter.get("/category/:categoryId/menus", getMenuByCategory);
menuRouter.get("/get-menu", getMenu);
menuRouter.get("/menu/:menuId", getSingleCategory);
menuRouter.put("/menus/:id", updateMenu);

export default menuRouter;
