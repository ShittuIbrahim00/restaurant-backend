import express from "express";
import {
  getTopCategories,
  getTotalRevenue,
  userHistory,
} from "../controllers/userhistory.js";
import orderModel from "../models/orderModel.js";
import ActivityLogSchema from "../models/ActivityLog.js";
const HistoryRouter = express.Router();

HistoryRouter.get("/user/:userId", userHistory);
HistoryRouter.get("/revenue", getTotalRevenue);
HistoryRouter.get("/top-category", getTopCategories);

// Get number of orders per day (past 7 days)
HistoryRouter.get("/analytics/order-overview", async (req, res) => {
  try {
    const result = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

HistoryRouter.get("/analytics/order-type-distribution", async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const types = ["Dine-in", "Takeaway", "Delivery"];

    const counts = await orderModel.aggregate([
      { $match: { orderType: { $in: types } } },
      {
        $group: {
          _id: "$orderType",
          count: { $sum: 1 },
        },
      },
    ]);

    const data = types.map((type) => {
      const typeCount = counts.find((c) => c._id === type)?.count || 0;
      return {
        type,
        count: typeCount,
        percentage: totalOrders
          ? Math.round((typeCount / totalOrders) * 100)
          : 0,
      };
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

HistoryRouter.get("/recent", async (req, res) => {
  try {
    const recentOrders = await orderModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("customer_id", "name")
      .populate("menuItems.menuItem", "name image");

    const formatted = recentOrders.map((order) => ({
      id: order._id,
      img: order.menuItems?.[0]?.menuItem?.image || "",
      menu: order.menuItems.map((m) => m.menuItem?.name).join(", "),
      amount: `$${order.totalAmount.toFixed(2)}`,
      customer: order.customer_id?.name || "Guest",
      status: order.orderStatus,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ error: "Failed to fetch recent orders" });
  }
});

// GET /api/activity/recent
HistoryRouter.get("/recent", async (req, res) => {
  try {
    const logs = await ActivityLogSchema.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name role");

    const formatted = logs.map((log) => ({
      user: log.user?.name || "System",
      role: log.user?.role || log.role,
      action: log.action,
      time: new Date(log.createdAt).toLocaleString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

export default HistoryRouter;
