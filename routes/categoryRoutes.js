import express from "express"
import { createCategory, getCategory, deleteCategory } from "../controllers/categoryController.js"
import {protect,authorizeRoles} from "../middlewares/authMiddleware.js"
const categoryRouter = express.Router()

categoryRouter.post("/create-category", protect, authorizeRoles("admin"), createCategory )
categoryRouter.delete("/delete-category/:id", protect, authorizeRoles("admin"), deleteCategory)
categoryRouter.get("/get-category",  getCategory )
export default categoryRouter;