import mongoose from "mongoose";

const schema = mongoose.Schema;

const createTable = new schema({
  categoryId: {type: mongoose.Schema.Types.ObjectId, ref: 'Table-Category'},
  tableNumber: { required: true, type: String },
  capacity: { required: true, type: String },
  price: { required: true, type: String },
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  isReserved: { type: Boolean, default: false },
  reservedAt: { type: Date, default: null },
  date_created: {type: Date, default: Date.now(), required: true},
  updated_at: {type:Date, default: Date.now(), required: true}
});

const createTableSchema = mongoose.model("Table", createTable);

export default createTableSchema;
