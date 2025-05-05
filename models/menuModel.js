import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
    admin_id: {type: mongoose.SchemaTypes.ObjectId, ref:"User", required:true},
    category_id: {type: mongoose.SchemaTypes.ObjectId, ref:"Category", required:true},
    name: {type: String, required:true},
    desc: {type:String, required:true},
    price: {type:Number, required:true},
    availability: {type: Boolean, default:true},
    img: {type: String},
},{timestamps:true}
)

export default mongoose.model("Menu", menuSchema);