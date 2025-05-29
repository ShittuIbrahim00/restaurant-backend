import axios from "axios";
import createTableSchema from "../models/CreateTable.js";
import ReserveTableSchema from "../models/TableReserve.js";
import UserSchema from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";
import orderModel from "../models/orderModel.js";

export const flutterwaveWebhook = async (req, res) => {
  const signature = req.headers["verif-hash"];
  const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH;

  if (!signature || signature !== FLW_SECRET_HASH) {
    return res.status(401).send("Unauthorized");
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString("utf8"));
  } catch (error) {
    return res.status(400).send("Invalid payload format");
  }

  if (
    payload.event === "charge.completed" &&
    payload.data.status === "successful"
  ) {
    const tx_ref = payload.data.tx_ref;
    const transaction_id = String(payload.data.id);

    if (!tx_ref || !transaction_id) {
      console.error("Missing tx_ref or transaction_id");
      return res.status(400).send("Missing tx_ref or transaction_id");
    }

    let verifiedData;
    try {
      const verifyRes = await axios.get(
        `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
        }
      );

      verifiedData = verifyRes.data.data;

      if (
        verifyRes.data.status !== "success" ||
        !verifiedData ||
        verifiedData.status !== "successful" ||
        !["00", undefined].includes(verifiedData.charge_response_code)
      ) {
        console.error("Transaction not verified or not successful");
        return res.status(400).send("Payment not verified");
      }
    } catch (err) {
      console.error("Error verifying transaction:", err.message);
      return res.status(500).send("Transaction verification failed");
    }

    const { meta, amount } = verifiedData;

    if (!meta?.purpose) {
      return res.status(400).send("Missing metadata purpose");
    }

    if (meta.purpose === "table") {
      // === TABLE RESERVATION LOGIC ===
      const { userId, tableId } = meta;

      // Check if already processed
      const alreadyProcessed = await ReserveTableSchema.findOne({
        $or: [{ tx_ref }, { paymentReference: transaction_id }],
      });

      if (alreadyProcessed?.isPaid) {
        return res
          .status(200)
          .send("Duplicate transaction. Already processed.");
      }

      const table = await createTableSchema.findById(tableId);
      if (!table) return res.status(404).send("Table not found");

      if (Number(amount) !== Number(table.price)) {
        console.error("Amount mismatch");
        return res.status(400).send("Incorrect payment amount");
      }

      const reservation = await ReserveTableSchema.findOne({ tx_ref });
      if (!reservation) return res.status(404).send("Reservation not found");

      reservation.isPaid = true;
      reservation.isReserved = true;
      reservation.reservedAt = new Date();
      reservation.paymentReference = transaction_id;
      reservation.amountPaid = Number(amount);
      await reservation.save();

      await createTableSchema.findByIdAndUpdate(tableId, {
        isReserved: true,
        reservedAt: new Date(),
        user: userId,
        tx_ref,
        paymentReference: transaction_id,
      });

      const user = await UserSchema.findById(userId);
      if (user?.email) {
        await sendEmail(
          user.email,
          "Your Table Reservation is Confirmed",
          `<p>Dear ${user.name},</p>
           <p>Your reservation for Table <strong>${table?.tableNumber}</strong> has been confirmed and paid successfully.</p>
           <p>It will be held for 10 minutes unless you check in.</p>`
        );
      }

      return res.status(200).send("Table reservation payment processed");
    } else if (meta.purpose === "order") {
      // === FOOD ORDER PAYMENT LOGIC FOR MULTIPLE ORDERS ===
      const { orderIds, userId } = meta;

      if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).send("Missing or invalid orderIds in metadata");
      }

      // Find all orders
      const orders = await orderModel.find({ _id: { $in: orderIds } });
      if (orders.length !== orderIds.length) {
        return res.status(404).send("One or more orders not found");
      }

      // Check for already paid order
      if (orders.some((o) => o.paymentStatus === "Completed")) {
        return res
          .status(200)
          .send("Duplicate transaction. Already processed.");
      }

      // Verify amount matches sum of order amounts
      const totalOrderAmount = orders.reduce(
        (sum, o) => sum + Number(o.totalAmount),
        0
      );
      if (Number(amount) !== totalOrderAmount) {
        console.error("Amount mismatch in order payment");
        return res.status(400).send("Incorrect payment amount");
      }

      // Mark all orders as completed
      await orderModel.updateMany(
        { _id: { $in: orderIds }, paymentStatus: { $ne: "Completed" } },
        { $set: { paymentStatus: "Completed" } }
      );

      // Update tables status to "Available" for Dine-in orders with assigned table
      const dineInTables = orders
        .filter((o) => o.orderType === "Dine-in" && o.tableNumber)
        .map((o) => o.tableNumber);

      if (dineInTables.length > 0) {
        await createTableSchema.updateMany(
          { tableNumber: { $in: dineInTables } },
          {
            $set: {
              isReserved: false,
              reservedAt: null,
              user: null,
              tx_ref: null,
              paymentReference: null,
            },
          }
        );
        console.log(
          `🪑 Released tables for orders: ${dineInTables.join(", ")}`
        );
      }

      // Clear user's cart
      await UserSchema.findByIdAndUpdate(userId, { cart: [] });

      const user = await UserSchema.findById(userId);
      if (user?.email) {
        await sendEmail(
          user.email,
          "Your Order(s) are Confirmed",
          `<p>Dear ${user.name},</p>
           <p>Your order(s) have been paid successfully. They are now being processed.</p>`
        );
      }

      return res.status(200).send("Order payment processed");
    }

    return res.status(400).send("Unknown payment purpose");
  }

  return res.status(200).send("Ignored event");
};
