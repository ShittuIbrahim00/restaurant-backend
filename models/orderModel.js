import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
      customer_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
      },
      menuItems: [
        {
          menu_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Menu",
            required: true,
          },
          quantity: { type: Number, min: 1, required: true },
          customization: { type: String },
        },
      ],
      orderType: {
        type: String,
        enum: ["Dine-in", "Takeaway", "Delivery"],
        required: false,
      },
      tableNumber: { type: String },
      address: { type: String },
      orderStatus: {
        type: String,
        enum: ["Pending", "Completed", "On-Progress"],
        default: "Pending",
      },
      totalAmount: {
        type: Number,
        min: 0,
        required: false,
      },
      paymentStatus: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending",
      },
      tx_ref: {
        type: String,
        required: false,
        index: true,
      },
      paymentReference: {
        type: String,
        required: false,
        index: true,
      },
    },
    { timestamps: true }
  );
  
  
export default mongoose.model("Order", orderSchema);
