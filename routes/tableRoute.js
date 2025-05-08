import express from "express";
const tableRouter = express.Router()
import { createTable, getAllTable, deleteTable, updateTable, getTableByCategory } from "../controllers/Table.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

// tableRouter.post('/create-table', protect, authorizeRoles("admin"), createTable)
// tableRouter.get('/get-all-table', getAllTable)
// tableRouter.delete('/delete-table/:id',protect, authorizeRoles("admin"), deleteTable)
// tableRouter.put('/update-table/:id', protect, authorizeRoles("admin"), updateTable)
// tableRouter.get('/get-table-category/:id', getTableByCategory)



tableRouter.post('/create-table', createTable)
tableRouter.get('/get-all-table', getAllTable)
tableRouter.delete('/delete-table/:id', deleteTable)
tableRouter.put('/update-table/:id',  updateTable)
tableRouter.get('/get-table-category/:id', getTableByCategory)
export default tableRouter