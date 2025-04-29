import express from "express";
const CategoryRoute = express.Router()
import { createTableCategory, updateTableCategory, deleteTableCategory } from "../controllers/CategoryTable.js";
CategoryRoute.post('/create-table-category', createTableCategory)
CategoryRoute.put('/update-table-category/:id', updateTableCategory)
CategoryRoute.delete('/delete-table-category/:id', deleteTableCategory)


export default CategoryRoute;

