import mongoose from "mongoose";

const schema = mongoose.Schema;

const createTable = new schema({
  table_category: {required: true, type: String, ref: 'Table-Category'},
  table_number: { required: true, type: String },
  capacity: { required: true, type: Number },
  price: { required: true, type: Number },
  user: {required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date_created: {type: Date, default: Date.now(), required: true},
  updated_at: {type:Date, default: Date.now(), required: true}
});

const createTableSchema = mongoose.model("Table", createTable);

export default createTableSchema;
