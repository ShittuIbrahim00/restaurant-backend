import axios from "axios";
import dotenv from "dotenv";
import ReserveTableSchema from "../models/TableReserve.js";
import createTableSchema from "../models/CreateTable.js";

dotenv.config();

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

// INITIATE FLUTTERWAVE PAYMENT
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
        redirect_url: `${process.env.CLIENT_URL}/payment-status?tx_ref=${txRef}`,
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

// VERIFY FLUTTERWAVE PAYMENT
export const verifyFlutterwavePayment = async (req, res) => {
  try {
    const { transaction_id, tx_ref } = req.body;

    if (!transaction_id || !tx_ref) {
      return res.status(400).json({ message: "Missing transaction_id or tx_ref" });
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

    if (!payment || payment.status !== "successful" || payment.tx_ref !== tx_ref) {
      return res.status(400).json({
        success: false,
        message: "Invalid or unsuccessful transaction",
      });
    }

    // Step 2: Extract metadata
    const { userId, tableId } = payment.meta || {};
    if (!userId || !tableId) {
      return res.status(400).json({ message: "Missing meta info in transaction" });
    }

    // Step 3: Validate amount
    const table = await createTableSchema.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const expectedAmount = table.price;
    const paidAmount = Number(payment.amount);

    if (Number(expectedAmount) !== paidAmount) {
      console.error(`❌ Amount mismatch. Expected: ${expectedAmount}, Got: ${paidAmount}`);
      return res.status(400).json({ success: false, message: "Amount mismatch" });
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

    return res.status(200).json({
      success: true,
      message: "Payment verified and reservation confirmed",
      data: payment,
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error.response?.data || error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
