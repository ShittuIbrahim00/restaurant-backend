import express from "express";
const reserveRouter = express.Router()
import { createReserveTable, deleteReserveTable, updateReserveTable, getAllReserveTable } from "../controllers/ReserveTable.js";

reserveRouter.post('/create-reserve-table', createReserveTable)
reserveRouter.get('/getAll-reserve-table', getAllReserveTable)
reserveRouter.put('/update-reserve-table/:id', updateReserveTable)
reserveRouter.delete('/delete-reserve-table/:id', deleteReserveTable)

export default reserveRouter