const kitchenTouter = express.Router();
import express from 'express';;
import { kitchenNamespace } from '../index.js'; // <-- import socket namespace
import Menu from "../models/menuModel.js";
import orderModel from "../models/orderModel.js";

export const placeOrder = async (req, res) => {
  try {
    const { customer_id, menuItems, orderType, tableNumber, address } =
      req.body;

    if (!customer_id || !menuItems || !orderType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //Fetch menu items once
    const menuIds = menuItems.map((item) => item.menu_id);
    const menus = await Menu.find({
      _id: { $in: menuIds },
      availability: true,
    });

    if (menus.length !== menuItems.length) {
      return res
        .status(404)
        .json({ message: "Some menu items are unavailable or not found" });
    }

    let totalAmount = 0;
    menuItems.forEach((item) => {
      const menu = menus.find((m) => m._id.toString() === item.menu_id);
      if (menu) {
        totalAmount += menu.price * item.quantity;
      }
    });

    const newOrder = new Order({
      customer_id,
      menuItems,
      orderType,
      tableNumber: orderType === "Dine-in" ? tableNumber : undefined,
      address: orderType === "Delivery" ? address : undefined,
      totalAmount,
      orderStatus: "Pending",
      paymentStatus: "Pending",
    });

    await newOrder.save();

    return res
      .status(201)
      .json({ message: "Order Placed successfully", order: newOrder });
  } catch (error) {
    console.log("Error placing order", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { customer_id, menuItems } = req.body;

    if (!customer_id || !menuItems || !Array.isArray(menuItems)) {
      return res.status(400).json({ message: "Missing or invalid input" });
    }

    // Find or create an unpaid order (cart)
    let order = await orderModel.findOne({
      customer_id,
      paymentStatus: "Pending",
    });

    if (!order) {
      order = new orderModel({
        customer_id,
        menuItems,
        orderStatus: "Pending",
        paymentStatus: "Pending",
      });
    } else {
      // Avoid duplicates
      menuItems.forEach(newItem => {
        const exists = order.menuItems.some(
          item => item.menu_id.toString() === newItem.menu_id
        );
        if (!exists) order.menuItems.push(newItem);
      });
    }

    await order.save();

    return res.status(200).json({ message: "Item added to cart", cart: order });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPendingOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ orderStatus: "On-Progress" })
      .populate("menuItems.menu_id")
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};

export const getAllOrder = async (req, res) => {
  try {
    const allOrders = await orderModel
      .find()
      .populate("menuItems.menu_id")
      .populate("customer_id", "name email") // if you want customer info
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: allOrders,
      message: "All orders retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;

    const orders = await orderModel.find({ customer_id: customerId })
      .populate("menuItems.menu_id", "name price")
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No orders found for this customer" });
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching customers orders", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Admin failed to update order", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { menu_id, quantity, customization } = req.body;

    // Validate input
    if (!menu_id || (!quantity && customization === undefined)) {
      return res.status(400).json({
        success: false,
        message:
          "menu_id and at least one of quantity or customization is required",
      });
    }

    // Find the order and validate existence
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Check if the logged-in user owns the order
    if (order.customer_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not own this order",
      });
    }

    // Prevent changes if order is completed
    if (order.orderStatus === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a completed order",
      });
    }

    // Locate the item in the menuItems array
    const itemIndex = order.menuItems.findIndex(
      (item) => item.menu_id.toString() === menu_id
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in order" });
    }

    // Update quantity if provided
    if (quantity !== undefined) {
      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
      }
      order.menuItems[itemIndex].quantity = quantity;
    }

    // Update customization if provided
    if (customization !== undefined) {
      order.menuItems[itemIndex].customization = customization;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const DeleteOrder = async (req, res) => {
  try {
    const { orderId, menu_id } = req.params;

    const order = await orderModel.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.customer_id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.orderStatus === "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot remove item from a completed order" });
    }

    order.menuItems = order.menuItems.filter(
      (item) => item.menu_id.toString() !== menu_id
    );

    await order.save();

    res.status(200).json({ success: true, message: "Item removed", order });
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

kitchenTouter.post('/', async (req, res) => {
  try {
    const newOrder = await orderModel.create(req.body);

    // Emit to kitchen namespace so kitchen staff get notified immediately
    kitchenNamespace.emit('newOrder', newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create order', error });
  }
});
export default kitchenTouter;
