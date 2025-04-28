import express from "express";
const tableRouter = express.Router()
import { createTable, getAllTable, deleteTable, updateTable } from "../controllers/Table.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

tableRouter.post('/create-table', authorizeRoles('admin, branch-manager'), protect, createTable)
tableRouter.get('/get-all-table', getAllTable)
tableRouter.delete('/delete-table/:id', deleteTable)
tableRouter.put('/update-table/:id', updateTable)

export default tableRouter