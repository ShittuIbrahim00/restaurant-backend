import mongoose from "mongoose";

const TableCategory = new mongoose.Schema({
  name: { type: String, required: true, enum: ['Regular', 'Executive'] },
});

const TableCat = mongoose.model('Table-Category', TableCategory);

export default TableCat;
