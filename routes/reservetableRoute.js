import express from "express";
const reserveRouter = express.Router()
import { createReserveTable, deleteReserveTable, updateReserveTable, getAllReserveTable } from "../controllers/ReserveTable.js";
import {protect, authorizeRoles} from '../middlewares/authMiddleware.js'

// reserveRouter.post('/create-reserve-table/:tableId', protect, createReserveTable)
// reserveRouter.get('/getAll-reserve-table', protect, authorizeRoles('admin'), getAllReserveTable)
// reserveRouter.put('/update-reserve-table/:id', protect, updateReserveTable) 
// reserveRouter.delete('/delete-reserve-table/:id', protect, authorizeRoles('admin'), deleteReserveTable)




reserveRouter.post('/create-reserve-table/:_id', createReserveTable)
reserveRouter.get('/getAll-reserve-table',getAllReserveTable)
reserveRouter.put('/update-reserve-table/:id', protect, updateReserveTable) 
reserveRouter.delete('/delete-reserve-table/:id',  deleteReserveTable)


export default reserveRouter