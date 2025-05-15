import stripe from "../config/stripe.js";
import TableReserve from "../models/TableReserve.js";
import createTableSchema from "../models/CreateTable.js"; // Ensure you have the correct model

export const confirmPayment = async (req, res) => {
  try {
    const { reservationId, paymentIntentId } = req.body;

    if (!reservationId || !paymentIntentId) {
      return res.status(400).json({ success: false, msg: "Missing data" });
    }

    const reservation = await TableReserve.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, msg: "Reservation not found" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      reservation.isPaid = true;
      await reservation.save();

      const table = await createTableSchema.findById(reservation.table);
      if (table) {
        table.isReserved = true;
        await table.save();
      } else {
        return res.status(404).json({ success: false, msg: "Table not found" });
      }

      res.status(200).json({
        success: true,
        msg: "Payment successful and reservation confirmed",
      });
    } else {
      res.status(400).json({
        success: false,
        msg: "Payment not successful. Please try again.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "An error occurred during payment confirmation" });
  }
};
