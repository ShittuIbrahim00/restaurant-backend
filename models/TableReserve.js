import mongoose from "mongoose";

const ReserveTable = new mongoose.Schema ({
    table: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Table'},
    user: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    reservation_Date: {type: Date, required: true},
    reservation_Time: {type: String, required: true},
    qty_persons: {type: Number, required: true, min: 1},
    date_created: {type: Date, default: Date.now(), required: true},
    updated_at: {type:Date, default: Date.now(), required: true}
})

const ReserveTableSchema = mongoose.model('ReserveTable', ReserveTable)

export default ReserveTableSchema;