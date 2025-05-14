import stripe from "../config/stripe.js";
import TableReserve from "../models/TableReserve.js";
import UserSchema from "../models/userModel.js";

export const createStripePaymentIntent = async (req, res) => {
  try {
    const { reservationId, userId } = req.body;

    if (!reservationId || !userId) {
      return res.status(400).json({ success: false, msg: "Missing data" });
    }

    const user = await UserSchema.findById(userId);
    const reservation = await TableReserve.findById(reservationId).populate("table");

    if (!user || !reservation) {
      return res.status(404).json({ success: false, msg: "User or reservation not found" });
    }

    const amount = reservation.qty_persons * 1000; // e.g., $10 per person

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        reservationId: reservation._id.toString(),
        userId: user._id.toString(),
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, msg: "Failed to create payment intent" });
  }
};
