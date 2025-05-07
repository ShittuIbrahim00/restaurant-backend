import mongoose from "mongoose";

const schema = mongoose.Schema;

const createTable = new schema({
  table_category: {type: mongoose.Schema.Types.ObjectId, ref: 'Table-Category'},
  tableNumber: { required: true, type: Number },
  capacity: { required: true, type: Number },
  price: { required: true, type: String },
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date_created: {type: Date, default: Date.now(), required: true},
  updated_at: {type:Date, default: Date.now(), required: true}
});

const createTableSchema = mongoose.model("Table", createTable);

export default createTableSchema;
