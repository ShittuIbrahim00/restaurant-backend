import Stripe from "stripe";
import dotenv from "dotenv";
import ReserveTableSchema from "../models/TableReserve.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object;

    const metadata = intent.metadata;
    const tableId = metadata.tableId;
    const qty_persons = metadata.qty_persons;
    const userId = metadata.userId;

    try {
      const reservation = await ReserveTableSchema.findOne({ user: userId, table: tableId });

      if (!reservation) {
        return res.status(404).json({ success: false, msg: "Reservation not found" });
      }

      reservation.isPaid = true;
      await reservation.save();

      console.log("Payment successful and reservation updated");
      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Error updating reservation:", err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(200).json({ received: true });
  }
};
