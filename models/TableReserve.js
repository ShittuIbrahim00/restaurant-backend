import mongoose from "mongoose";

const ReserveTable = new mongoose.Schema({
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservation_Date: { type: Date, required: true },
  reservation_Time: { type: String, required: true },
  tx_ref: { type: String },
  qty_persons: { type: Number, required: true, min: 1 },
  isReserved: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false }, // ✅ Added
  paymentReference: { type: String },         // ✅ Added
  reservedAt: { type: Date, default: null },
  date_created: { type: Date, default: Date.now, required: true },
  updated_at: { type: Date, default: Date.now, required: true }
});

const ReserveTableSchema = mongoose.model('ReserveTable', ReserveTable);
export default ReserveTableSchema;
