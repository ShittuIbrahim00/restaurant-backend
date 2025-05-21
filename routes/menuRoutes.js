import express from "express";
import { createMenu,getMenu, getMenuByCategory,deleteMenu, getSingleMenu } from "../controllers/menuController.js";
import { protect,  authorizeRoles} from "../middlewares/authMiddleware.js";


const menuRouter = express.Router()

menuRouter.post("/create-menu", protect, authorizeRoles("admin"), createMenu)
menuRouter.delete("/delete-menu/:id", protect, authorizeRoles("admin"), deleteMenu)
menuRouter.get("/category/:categoryId/menus", getMenuByCategory);
menuRouter.get("/get-menu",  getMenu)
menuRouter.get("/menu/:id", getSingleMenu)
export default menuRouter;