import axios from "axios";
import dotenv from "dotenv";
import ReserveTableSchema from "../models/TableReserve.js";
import createTableSchema from "../models/CreateTable.js";
import orderModel from "../models/orderModel.js";
import UserSchema from "../models/userModel.js";
import mongoose from "mongoose";
import cron from "node-cron";
import sendEmail from "../utils/sendEmail.js";
import { io } from "../utils/socket.js";

dotenv.config();

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

// INITIATE FLUTTERWAVE PAYMENT FOR TABLE RESERVATION
export const initiateFlutterwavePayment = async (req, res) => {
  const {
    email,
    amount,
    userId,
    tableId,
    qty_persons,
    reservation_Date,
    reservation_Time,
  } = req.body;

  try {
    const txRef = `tx-${Date.now()}`;

    // Save reservation before redirecting to payment
    await ReserveTableSchema.create({
      tx_ref: txRef,
      user: userId,
      table: tableId,
      qty_persons,
      reservation_Date,
      reservation_Time,
      isPaid: false,
      isReserved: false,
    });

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: txRef,
        amount,
        currency: "NGN",
        redirect_url: `https://restaurant-project-ivory.vercel.app/payment-status?tx_ref=${txRef}`,
        customer: { email },
        customizations: {
          title: "Table Reservation",
          description: "Payment for table reservation",
        },
        meta: {
          userId,
          tableId,
          qty_persons,
          reservation_Date,
          reservation_Time,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({ link: response.data.data.link });
  } catch (error) {
    console.error("Flutterwave error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to initiate payment" });
  }
};
// VERIFY FLUTTERWAVE PAYMENT FOR TABLE RESERVATION
export const verifyFlutterwavePayment = async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.body;

    if (!transaction_id || !tx_ref) {
      return res
        .status(400)
        .json({ message: "Missing transaction_id or tx_ref" });
    }

    // Step 1: Verify the transaction with Flutterwave
    const flutterwaveRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      }
    );

    const payment = flutterwaveRes.data?.data;
    console.log("✅ Received tx_ref:", tx_ref);
    console.log("✅ Payment verification response:", payment);

    if (
      !payment ||
      payment.status !== "successful" ||
      payment.tx_ref !== tx_ref
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unsuccessful transaction",
      });
    }

    // Step 2: Extract metadata
    const { userId, tableId } = payment.meta || {};
    if (!userId || !tableId) {
      return res
        .status(400)
        .json({ message: "Missing meta info in transaction" });
    }

    // Step 3: Validate amount
    const table = await createTableSchema.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const expectedAmount = table.price;
    const paidAmount = Number(payment.amount);

    if (Number(expectedAmount) !== paidAmount) {
      console.error(
        `❌ Amount mismatch. Expected: ${expectedAmount}, Got: ${paidAmount}`
      );
      return res
        .status(400)
        .json({ success: false, message: "Amount mismatch" });
    }

    // Step 4: Update reservation status
    const updatedReservation = await ReserveTableSchema.findOneAndUpdate(
      { tx_ref },
      {
        isPaid: true,
        isReserved: true,
        paymentReference: transaction_id,
        reservedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Step 5: Mark table as reserved
    await createTableSchema.findByIdAndUpdate(tableId, {
      isReserved: true,
      reservedAt: new Date(),
    });

    const user = await UserSchema.findById(userId);
    if (user && user.email) {
      try {
        await sendEmail(
          user.email,
          "Table Reservation Confirmed - Spicyhunt Restaurant",
          `<p>Hi ${user.name || ""},</p>
          <p>Your table reservation for Table <strong>${
            table.tableNumber
          }</strong> on ${updatedReservation.reservation_Date?.toDateString()} at ${
            updatedReservation.reservation_Time
          } is confirmed and paid successfully.</p>
          <p>Thank you for choosing Spicyhunt Restaurant! We look forward to serving you.</p>
          <p>Best regards,<br/>Spicyhunt Team</p>`
        );
      } catch (err) {
        console.error("Failed to send confirmation email:", err);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and reservation confirmed",
      data: payment,
    });
  } catch (error) {
    console.error(
      "❌ Error verifying payment:",
      error.response?.data || error.message
    );
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Utility to format current time as HH:mm
const formatTimeNow = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

export const initiateOrderPayment = async (req, res) => {
  const { email, amount, userId, orderIds, orderType, tableNumber, address } =
    req.body;

  try {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res
        .status(400)
        .json({ message: "orderIds must be a non-empty array" });
    }

    const objectIds = orderIds.map((id) => new mongoose.Types.ObjectId(id));
    const orders = await orderModel.find({ _id: { $in: objectIds } });

    if (orders.length !== orderIds.length) {
      return res.status(404).json({ message: "One or more orders not found" });
    }

    const txRef = `order-${Date.now()}`;

    if (orderType === "Dine-in" && tableNumber) {
      const table = await createTableSchema.findById(tableNumber);
      if (!table) return res.status(404).json({ message: "Table not found" });

      await ReserveTableSchema.create({
        tx_ref: txRef,
        user: userId,
        table: tableNumber,
        qty_persons: table.capacity,
        reservation_Date: new Date(),
        reservation_Time: formatTimeNow(),
        isPaid: false,
        isReserved: false,
      });
    }

    await orderModel.updateMany(
      { _id: { $in: objectIds } },
      {
        tx_ref: txRef,
        paymentStatus: "Pending",
        orderStatus: "On-Progress",
        orderType,
        ...(orderType === "Dine-in" && { tableNumber }),
        ...(orderType === "Delivery" && { address }),
      }
    );

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: txRef,
        amount,
        currency: "NGN",
        redirect_url: `https://restaurant-project-ivory.vercel.app/order-payment-status?tx_ref=${txRef}`,
        customer: { email },
        customizations: {
          title: "Food Order Payment",
          description: "Payment for restaurant food order",
        },
        meta: {
          userId,
          orderIds: JSON.stringify(orderIds),
          purpose: "order",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({ link: response.data.data.link });
  } catch (error) {
    console.error(
      "🔥 Flutterwave error:",
      error.response?.data || error.message
    );
    return res.status(500).json({ error: "Failed to initiate order payment" });
  }
};

export const verifyFlutterwaveOrderPayment = async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.body;

    if (!transaction_id || !tx_ref) {
      return res.status(400).json({ message: "Missing transaction_id or tx_ref" });
    }

    console.log("🔍 Verifying payment:", { transaction_id, tx_ref });

    // Verify payment with Flutterwave
    const flutterwaveRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    const payment = flutterwaveRes.data?.data;

    if (
      !payment ||
      payment.status !== "successful" ||
      payment.tx_ref !== tx_ref
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unsuccessful transaction",
      });
    }

    // Extract userId and orderIds from metadata
    let { userId, orderIds } = payment.meta || {};

    if (typeof orderIds === "string") {
      try {
        orderIds = JSON.parse(orderIds);
      } catch {
        orderIds = [orderIds];
      }
    }

    // Fetch orders from DB
    const orders = await orderModel.find({ _id: { $in: orderIds } });
    if (orders.length !== orderIds.length) {
      return res.status(404).json({ message: "One or more orders not found" });
    }

    // Check if any orders already completed
    if (orders.some((o) => o.paymentStatus === "Completed")) {
      return res.status(200).json({ message: "Order(s) already completed" });
    }

    // Update payment status and order status for all orders
    await orderModel.updateMany(
      { _id: { $in: orderIds } },
      { $set: { paymentStatus: "Completed", orderStatus: "On-Progress" } }
    );

    // Pick one order to emit for socket (or create a combined summary)
    const newOrder = orders[0];

    // Update reservation if exists (some orders may not have reservation)
    const updatedReservation = await ReserveTableSchema.findOneAndUpdate(
      { tx_ref },
      {
        isPaid: true,
        isReserved: true,
        paymentReference: transaction_id,
        reservedAt: new Date(),
      },
      { new: true }
    );

    if (updatedReservation) {
      const tableId = updatedReservation.table;

      // Mark the table as reserved
      await createTableSchema.findByIdAndUpdate(tableId, {
        isReserved: true,
        reservedAt: new Date(),
      });

      // Schedule table auto-release after 5 minutes
      const releaseTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      const cronTime = `${releaseTime.getMinutes()} ${releaseTime.getHours()} ${releaseTime.getDate()} ${
        releaseTime.getMonth() + 1
      } *`;

      cron.schedule(cronTime, async () => {
        try {
          await createTableSchema.findByIdAndUpdate(tableId, {
            isReserved: false,
            reservedAt: null,
          });

          await ReserveTableSchema.findOneAndUpdate(
            { tx_ref },
            {
              isReserved: false,
              reservation_Date: null,
              reservation_Time: null,
              isPaid: false,
              reservedAt: null,
            }
          );

          console.log(`🕒 Table ${tableId} automatically released after 5 minutes`);
        } catch (err) {
          console.error("❌ Error auto-releasing table:", err.message);
        }
      });
    }

    // Notify user by email
    const user = await UserSchema.findById(userId);
    if (user && user.email) {
      try {
        await sendEmail(
          user.email,
          "Order Payment Confirmed - Spicyhunt Restaurant",
          `<p>Hi ${user.name || ""},</p>
            <p>Your payment for your food order(s) has been successfully received.</p>
            <p>Order IDs: ${orderIds.join(", ")}</p>
            <p>Thank you for ordering with Spicyhunt Restaurant!</p>
            <p>Best regards,<br/>Spicyhunt Team</p>`
        );
      } catch (err) {
        console.error("❌ Failed to send order payment email:", err);
      }
    }

    // Emit new order event via socket.io for kitchen/dashboard updates
    io.emit("newOrder", {
      orderId: newOrder._id,
      createdAt: newOrder.createdAt,
      menuItems: newOrder.menuItems,
      orderType: newOrder.orderType,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified, order completed, table reserved",
      data: payment,
    });
  } catch (error) {
    console.error(
      "❌ Error verifying payment:",
      error.response?.data || error.message
    );
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

