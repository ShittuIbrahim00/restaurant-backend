import Stripe from "stripe";
import dotenv from "dotenv";
import ReserveTableSchema from "../models/TableReserve.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  console.log("🔔 Stripe webhook hit");

  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  console.log("✅ Stripe event received:", event.type);

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;

    const metadata = intent.metadata;
    const tableId = metadata.tableId;
    const qty_persons = metadata.qty_persons;
    const userId = metadata.userId;

    console.log("📦 Metadata received:", { tableId, qty_persons, userId });

    try {
      const reservation = await ReserveTableSchema.findOne({ user: userId, table: tableId });

      if (!reservation) {
        console.warn("⚠️ Reservation not found:", { userId, tableId });
        return res.status(404).json({ success: false, msg: "Reservation not found" });
      }

      reservation.isPaid = true;
      await reservation.save();

      console.log("✅ Reservation marked as paid:", reservation._id);
      res.status(200).json({ received: true });
    } catch (err) {
      console.error("❌ Error updating reservation:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    console.log("ℹ️ Unhandled event type:", event.type);
    res.status(200).json({ received: true });
  }
};
