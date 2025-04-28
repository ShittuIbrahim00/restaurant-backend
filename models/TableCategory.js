import mongoose from "mongoose";


const Table_category = new mongoose.Schema({
    name: {required: true, enum: ['Regular', 'Executive'], default: 'Regular'}
})

const TableCat = mongoose.model('Table-Category', Table_category)

export default TableCat;