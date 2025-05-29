import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import ReserveTableSchema from "../models/TableReserve.js";
import Order from "../models/orderModel.js";
import Menu from "../models/menuModel.js";
import Category from "../models/categoryModel.js";


export const userHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", startDate, status, endDate } = req.query;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Build filter object
    let orderFilter = { customer_id: userId };
    if (status) orderFilter.orderStatus = status;
    if (startDate || endDate) {
      orderFilter.createdAt = {};
      if (startDate) orderFilter.createdAt.$gte = new Date(startDate);
      if (endDate) orderFilter.createdAt.$lte = new Date(endDate);
    }

    // Fetch orders with filters, pagination, and sorting
    const orders = await orderModel.find(orderFilter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: 'menuItems.menu_id',
        select: 'name price'
      })
      .lean();

    const totalOrders = await orderModel.countDocuments(orderFilter);

    // Similarly for reservations - add sorting & filters if needed
    const reservations = await ReserveTableSchema.find({ user: userId })
      .sort({ reservation_Date: -1 }) // could add filters/sorting similarly
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: 'table',
        select: 'tableNumber category'
      })
      .lean();

    const totalReservations = await ReserveTableSchema.countDocuments({ user: userId });

    res.status(200).json({
      orders,
      totalOrders,
      reservations,
      totalReservations,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTotalRevenue = async (req, res) => {
  try {
    const orderTotal = await orderModel.aggregate([
      { $match: { paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const reservationTotal = await ReserveTableSchema.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: "$amountPaid" } } }
    ]);

    const orderRevenue = orderTotal[0]?.total || 0;
    const reservationRevenue = reservationTotal[0]?.total || 0;
    const totalRevenue = orderRevenue + reservationRevenue;

    res.status(200).json({
      success: true,
      orderRevenue,
      reservationRevenue,
      totalRevenue
    });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTopCategories = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
          },
        },
      },
      { $match: { paymentStatus: "Completed" } },
      { $unwind: "$menuItems" },
      {
        $lookup: {
          from: "menus", // collection name in MongoDB
          localField: "menuItems.menu_id",
          foreignField: "_id",
          as: "menuDetails",
        },
      },
      { $unwind: "$menuDetails" },
      {
        $group: {
          _id: "$menuDetails.category_id",
          totalQuantity: { $sum: "$menuItems.quantity" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          _id: 0,
          category: "$categoryDetails.name",
          totalQuantity: 1,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }, // top 5 categories
    ]);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error getting top categories:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


