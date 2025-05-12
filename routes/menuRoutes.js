import express from "express";
import { createMenu,getMenu, getMenuByCategory } from "../controllers/menuController.js";
import { protect,  authorizeRoles} from "../middlewares/authMiddleware.js";


const menuRouter = express.Router()

menuRouter.post("/create-menu", protect, authorizeRoles("admin"), createMenu)
menuRouter.get("/category/:categoryId/menus", getMenuByCategory);
menuRouter.get("/get-menu",  getMenu);

export default menuRouter;