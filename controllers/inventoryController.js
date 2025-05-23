import StockSchema from "../models/StockMovement.js";
import SupplySchema from "../models/SupplyItem.js";

// Helper function to check low stock
const checkLowStock = async (item) => {
  if (item.quantity <= item.reorderPoint) {
    console.warn(`Low stock alert: ${item.name}`);
    // (Optional) Send notification
  }
};

export const createSupplyItem = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admin can create supply items" });
    }

    const { name, quantity, reorderPoint, unit, supplierInfo } = req.body;

    const existing = await SupplySchema.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Item already exists" });
    }

    const item = await SupplySchema.create({
      name,
      quantity,
      reorderPoint,
      unit,
      supplierInfo
    });

    // 🔹 Log stock purchase
    await StockSchema.create({
      supplyItem: item._id,
      type: "purchase",
      quantity,
      notes: `Initial stock for ${name}`
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all supply items
export const getAllSupplyItems = async (req, res) => {
  try {
    const items = await SupplySchema.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE supply item (quantity or reorderPoint)
export const updateSupplyItem = async (req, res) => {
  try {
    const { id } = req.query;
    const updates = req.body;

    const oldItem = await SupplySchema.findById(id);
    if (!oldItem) return res.status(404).json({ message: "Item not found" });

    const updatedItem = await SupplySchema.findByIdAndUpdate(id, updates, { new: true });
    await checkLowStock(updatedItem);

    // 🔹 Determine if it's a purchase or usage
    if (updates.quantity !== undefined && updates.quantity !== oldItem.quantity) {
      const movementType = updates.quantity > oldItem.quantity ? "purchase" : "usage";
      const movementQty = Math.abs(updates.quantity - oldItem.quantity);

      await StockSchema.create({
        supplyItem: updatedItem._id,
        type: movementType,
        quantity: movementQty,
        notes: `Stock ${movementType} via update`
      });
    }

    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

