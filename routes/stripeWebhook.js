import express from "express";
import stripe from "../config/stripe.js";
import TableReserve from "../models/TableReserve.js";
import createTableSchema from "../models/CreateTable.js";
import dotenv from "dotenv";

dotenv.config();
const webhookRouter = express.Router();

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

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const reservationId = paymentIntent.metadata?.reservationId;

      if (!reservationId) {
        console.error("No reservationId found in payment metadata.");
        return res.status(400).send("Missing reservationId");
      }

      try {
        const reservation = await TableReserve.findById(reservationId);
        if (!reservation) {
          return res.status(404).send("Reservation not found");
        }

        reservation.isPaid = true;
        reservation.isReserved = true;
        reservation.reservedAt = new Date();
        reservation.paymentReference = paymentIntent.id;
        await reservation.save();

        const table = await createTableSchema.findById(reservation.table);
        if (table) {
          table.isReserved = true;
          table.reservedAt = new Date();
          await table.save();
        }

        console.log("✅ Reservation and table updated after successful payment.");
      } catch (error) {
        console.error("❌ Error updating reservation or table:", error.message);
        return res.status(500).send("Server error");
      }
    }

    res.json({ received: true });
  }
);

export default webhookRouter;
