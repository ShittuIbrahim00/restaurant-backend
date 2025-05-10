import mongoose from 'mongoose';

const SupplyItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  reorderPoint: { type: Number, required: true },
  unit: { type: String, default: "pcs" },
  supplierInfo: {
    name: String,
    contact: String,
  },
  lastUpdated: { type: Date, default: Date.now }
});

const SupplySchema =  mongoose.model('SupplyItem', SupplyItemSchema);

export default SupplySchema;