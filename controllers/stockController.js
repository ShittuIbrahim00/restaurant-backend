import StockSchema from '../models/StockMovement.js';
import SupplySchema from '../models/SupplyItem.js';

export const createStockMovement = async (req, res) => {
  try {
    const { supplyItem, type, quantity, notes } = req.body;

    const item = await SupplySchema.findById(supplyItem);
    if (!item) return res.status(404).json({ message: "Supply item not found" });

    const movement = await StockSchema.create({ supplyItem, type, quantity, notes });

    // Adjust quantity
    item.quantity = type === "purchase" ? item.quantity + quantity : item.quantity - quantity;
    await item.save();

    // Optional: Trigger low stock alert
    if (item.quantity <= item.reorderPoint) {
      console.warn(`${item.name} is low in stock.`);
      // send socket / email alert
    }

    res.status(201).json(movement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all stock movements
export const getAllStockMovements = async (req, res) => {
  try {
    const stocks = await StockSchema.find().populate("supplyItem", "name");
    res.status(200).json(stocks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Aggregate stock trend
export const getMonthlyStockTrend = async (req, res) => {
  try {
    const trend = await StockSchema.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            type: "$type",
          },
          total: { $sum: "$quantity" },
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Convert to frontend-friendly format
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const trendMap = {};

    trend.forEach((item) => {
      const { month, year, type } = item._id;
      const label = `${months[month - 1]} ${year}`;
      
      if (!trendMap[label]) {
        trendMap[label] = { month: label, purchase: 0, usage: 0 };
      }

      if (type === "purchase") {
        trendMap[label].purchase = item.total;
      } else if (type === "usage") {
        trendMap[label].usage = item.total;
      }
    });

    res.json(Object.values(trendMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

