import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customer_id: {type:mongoose.SchemaTypes.ObjectId, ref:"User", required:true},
    menuItems:[
        {
            menu_id: {type: mongoose.SchemaTypes.ObjectId, ref: "Menu", required:true},
            quantity:{type:Number, min:1, required:true},
            customization:{type:String}
        }
    ],
    orderType:{type:String, enum:["Dine-in", "Takeaway", "Delivery"], required:true},
    tableNumber:{type:String}, //only for Dine-In
    address: {type:String}, //only for delivery
    orderStatus:{type:String, enum:["Pending", "Completed", "On-Progress"], default:"Pending"},
    totalAmount: {type:Number, min:0, required:true},
    paymentStatus:{type:String, enum:["Pending", "Completed"],default:"Pending"},
},{timestamps:true}
)

export default mongoose.model("Order", orderSchema);