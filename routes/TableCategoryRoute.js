import express from "express";
const CategoryRoute = express.Router()
import { createTableCategory, updateTableCategory, deleteTableCategory, getAllTableCategory } from "../controllers/CategoryTable.js";
import {protect, authorizeRoles} from '../middlewares/authMiddleware.js'

CategoryRoute.post('/create-table-category', protect, authorizeRoles('admin'), createTableCategory)
CategoryRoute.put('/update-table-category/:id', protect, authorizeRoles('admin'), updateTableCategory)
CategoryRoute.delete('/delete-table-category/:id', protect, authorizeRoles('admin'), deleteTableCategory)
CategoryRoute.get('/get-all-category', protect, authorizeRoles('admin'), getAllTableCategory)

export default CategoryRoute;

