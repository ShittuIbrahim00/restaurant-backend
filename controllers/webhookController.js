import Stripe from "stripe";
import TableReserve from "../models/TableReserve.js";
import createTableSchema from "../models/CreateTable.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const reservation = new TableReserve({
        user: session.metadata.userId,
        table: session.metadata.tableId,
        reservation_Date: session.metadata.reservation_Date,
        reservation_Time: session.metadata.reservation_Time,
        qty_persons: session.metadata.qty_persons,
      });

      await reservation.save();

      // Mark the table as reserved
      const table = await createTableSchema.findById(session.metadata.tableId);
      if (table) {
        table.isReserved = true;
        await table.save();
      }

      console.log("✅ Table reservation created after successful payment.");
    } catch (err) {
      console.error("Failed to create reservation from webhook:", err.message);
    }
  }

  res.status(200).send("Received");
};
