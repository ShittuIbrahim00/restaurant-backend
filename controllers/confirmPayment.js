import stripe from "../config/stripe.js";
import TableReserve from "../models/TableReserve.js";
import createTableSchema from "../models/CreateTable.js";

export const confirmPayment = async (req, res) => {
  try {
    const { reservationId, paymentIntentId } = req.body;

    if (!reservationId || !paymentIntentId) {
      return res.status(400).json({ success: false, msg: "Missing data" });
    }

    // Retrieve the Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        msg: "Payment not successful. Please try again.",
      });
    }

    // Find reservation
    const reservation = await TableReserve.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, msg: "Reservation not found" });
    }

    // Update reservation
    reservation.isPaid = true;
    reservation.isReserved = true;
    reservation.reservedAt = new Date();
    reservation.paymentReference = paymentIntentId;
    await reservation.save();

    // Update the table's reservation status
    const table = await createTableSchema.findById(reservation.table);
    if (!table) {
      return res.status(404).json({ success: false, msg: "Table not found" });
    }

    table.isReserved = true;
    table.reservedAt = new Date();
    await table.save();

    res.status(200).json({
      success: true,
      msg: "Payment successful and reservation confirmed",
      data: reservation,
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ success: false, msg: "Server error during payment confirmation" });
  }
};
