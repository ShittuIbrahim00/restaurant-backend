import createTableSchema from "../models/CreateTable.js";
import ReserveTableSchema from "../models/TableReserve.js";
import UserSchema from "../models/userModel.js";
import sendEmail from "../utils/sendEmail.js";

export const flutterwaveWebhook = async (req, res) => {
  const signature = req.headers["verif-hash"];
  const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH;

  if (!signature || signature !== FLW_SECRET_HASH) {
    return res.status(401).send("Unauthorized");
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch (error) {
    return res.status(400).send("Invalid payload format");
  }

  if (
    payload.event === "charge.completed" &&
    payload.data.status === "successful"
  ) {
    const { userId, tableId } = payload.data.meta;

    try {
      const reservation = await ReserveTableSchema.findOne({
        user: userId,
        table: tableId,
        isPaid: false,
      });

      if (!reservation) {
        return res
          .status(404)
          .json({ success: false, msg: "Reservation not found" });
      }

      // Mark reservation as paid and reserved
      reservation.isPaid = true;
      reservation.isReserved = true;
      reservation.reservedAt = new Date();
      await reservation.save();

      // Update the table record as reserved
      await createTableSchema.findByIdAndUpdate(tableId, {
        isReserved: true,
        reservedAt: new Date(),
        user: userId,
      });

      console.log("✅ Reservation marked as paid & reserved");

      // Send confirmation email
      const user = await UserSchema.findById(userId);
      const table = await createTableSchema.findById(tableId);

      if (user && user.email) {
        await sendEmail(
          user.email,
          "Your Table Reservation is Confirmed",
          `<p>Dear ${user.name},</p>
           <p>Your reservation for Table <strong>${table?.tableNumber}</strong> has been confirmed and paid successfully.</p>
           <p>It will be held for 10 minutes unless you check in.</p>`
        );
      }

      // Automatically release the table after 10 minutes
      setTimeout(async () => {
        const latest = await ReserveTableSchema.findById(reservation._id);

        if (latest?.isReserved) {
          latest.isReserved = false;
          await latest.save();

          await createTableSchema.findByIdAndUpdate(tableId, {
            isReserved: false,
            reservedAt: null,
            user: null,
          });

          console.log("⏱️ Table released after 10 minutes");

          // Send release email
          if (user && user.email) {
            await sendEmail(
              user.email,
              "Reservation Released",
              `<p>Dear ${user.name},</p>
               <p>Your reservation for Table <strong>${table?.tableNumber}</strong> has been released due to inactivity after 10 minutes.</p>`
            );
          }
        }
      }, 10 * 60 * 1000); // 10 minutes
    } catch (err) {
      console.error("❌ Error updating reservation:", err.message);
    }
  }

  res.status(200).send("Webhook received");
};
