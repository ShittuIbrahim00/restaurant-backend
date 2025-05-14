import Stripe from "stripe";
import createTableSchema from "../models/CreateTable";
import UserSchema from "../models/userModel";

export const createTableReservationWithOptionalPayment = async (req, res) => {
    try {
      const { userId, tableId, reservation_Date, reservation_Time, qty_persons } = req.body;
  
      if (!userId || !tableId || !reservation_Date || !reservation_Time || !qty_persons) {
        return res.status(400).json({ success: false, msg: "All fields are required" });
      }
  
      const user = await UserSchema.findById(userId);
      const table = await createTableSchema.findById(tableId);
      if (!user || !table) {
        return res.status(404).json({ success: false, msg: "User or Table not found" });
      }
  
      const quantity = parseInt(qty_persons, 10);
      if (quantity > table.capacity) {
        return res.status(400).json({
          success: false,
          msg: `This table can only accommodate ${table.capacity} people`,
        });
      }
  
      // Check for existing reservation conflict
      const existing = await TableReserve.findOne({
        table: tableId,
        reservation_Date,
        reservation_Time,
      });
  
      if (existing) {
        return res.status(409).json({
          success: false,
          msg: "This table is already reserved for the selected date and time",
        });
      }
  
      // FREE BOOKING
      if (table.price === 0) {
        const reservation = new ({
          user: userId,
          table: tableId,
          reservation_Date,
          reservation_Time,
          qty_persons: quantity,
        });
  
        await reservation.save();
        table.isReserved = true;
        await table.save();
  
        return res.status(201).json({
          success: true,
          msg: "Table reserved for free",
          data: reservation,
        });
      }
  
      // PAID BOOKING — Proceed to Stripe
      const session = await Stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: table.price * 100,
              product_data: {
                name: `Table Reservation: #${table.tableNumber}`,
                description: `For ${qty_persons} person(s) on ${reservation_Date} at ${reservation_Time}`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          tableId,
          reservation_Date,
          reservation_Time,
          qty_persons: quantity,
        },
        success_url: `${process.env.CLIENT_URL}/reservation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/reservation-cancelled`,
      });
  
      res.status(200).json({
        success: true,
        paymentRequired: true,
        url: session.url,
      });
    } catch (error) {
      console.error("Reservation Error:", error);
      res.status(500).json({ success: false, msg: "An error occurred" });
    }
  };
  