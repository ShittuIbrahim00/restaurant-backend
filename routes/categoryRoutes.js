import express from "express"
import { createCategory } from "../controllers/categoryController.js"
import {protect,authorizeRoles} from "../middlewares/authMiddleware.js"
const categoryRouter = express.Router()

categoryRouter.post("/create-category", protect, authorizeRoles("admin"), createCategory )

export default categoryRouter;