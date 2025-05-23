import mongoose from 'mongoose';

const StockMovementSchema = new mongoose.Schema({
  supplyItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplyItem',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'usage'],
    required: true
  },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String }
});

const StockSchema = mongoose.model('StockMovement', StockMovementSchema);

export default StockSchema;
