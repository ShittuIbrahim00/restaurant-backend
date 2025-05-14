import express from "express";
import stripe from "../config/stripe.js";
import TableReserve from "../models/TableReserve.js";
import dotenv from "dotenv";

dotenv.config();
const webhookRouter = express.Router();

// ✅ Fix: use root path since it's mounted at `/api/v1/webhook/stripe`
webhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("⚠️ Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle successful payment
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const reservationId = paymentIntent.metadata.reservationId;

      const reservation = await TableReserve.findById(reservationId);
      if (reservation) {
        reservation.isPaid = true;
        reservation.paymentReference = paymentIntent.id;
        await reservation.save();
        console.log("✅ Payment succeeded and reservation updated.");
      }
    }

    res.json({ received: true });
  }
);

export default webhookRouter;
