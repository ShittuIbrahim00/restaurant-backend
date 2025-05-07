import mongoose from "mongoose";

const ReserveTable = new mongoose.Schema({
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  reservation_Date: { type: Date, required: true },
  reservation_Time: { type: String, required: true },
  qty_persons: { type: Number, required: true, min: 1 },
  date_created: { type: Date, default: Date.now, required: true },
  updated_at: { type: Date, default: Date.now, required: true }
});

const ReserveTableSchema = mongoose.model('ReserveTable', ReserveTable);

export default ReserveTableSchema;
