import express from "express";
const tableRouter = express.Router()
import { createTable, deleteTable, updateTable, getTableByCategory, getSingleTable, getAllTablesWithReservationInfo } from "../controllers/Table.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

tableRouter.post('/create-table', protect, authorizeRoles("admin", "restaurant-owner"), createTable)
tableRouter.get('/get-all-table', getAllTablesWithReservationInfo)
tableRouter.delete('/delete-table/:id',protect, authorizeRoles("admin", "restaurant-owner"), deleteTable)
tableRouter.put('/update-table/:id', protect, authorizeRoles("admin", "restaurant-owner"), updateTable)
tableRouter.get('/get-table-category/:id', getTableByCategory)
tableRouter.get('/get-single-table/:tableId', getSingleTable )


// tableRouter.post('/create-table', createTable)
// tableRouter.get('/get-all-table', getAllTable)
// tableRouter.delete('/delete-table/:id', deleteTable)
// tableRouter.put('/update-table/:id',  updateTable)
// tableRouter.get('/get-table-category/:id', getTableByCategory)
export default tableRouter