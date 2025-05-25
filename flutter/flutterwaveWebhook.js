
import axios from "axios";
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
    payload = req.body;
  } catch (error) {
    return res.status(400).send("Invalid payload format");
  }

  if (
    payload.event === "charge.completed" &&
    payload.data.status === "successful"
  ) {
    const tx_ref = payload.data.tx_ref;
    const transaction_id = String(payload.data.id); // Flutterwave transaction ID

    if (!tx_ref || !transaction_id) {
      console.error("Missing tx_ref or transaction_id");
      return res.status(400).send("Missing tx_ref or transaction_id");
    }

    // 🔁 Check if this tx_ref or transaction ID has already been processed
    const alreadyProcessed = await ReserveTableSchema.findOne({
      $or: [
        { tx_ref },
        { paymentReference: transaction_id }
      ]
    });

    if (alreadyProcessed?.isPaid) {
      console.log("Duplicate transaction. Already processed.");
      return res.status(200).send("Duplicate transaction. Already processed.");
    }

    let verifiedData;
    try {
      const verifyRes = await axios.get(
        `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          },
        }
      );

      verifiedData = verifyRes.data.data;

      if (
        verifyRes.data.status !== "success" ||
        !verifiedData ||
        verifiedData.status !== "successful" ||
        !["00", undefined].includes(verifiedData.charge_response_code)
      ) {
        console.error("Transaction not verified or not successful");
        return res.status(400).send("Payment not verified");
      }
    } catch (err) {
      console.error("Error verifying transaction:", err.message);
      return res.status(500).send("Transaction verification failed");
    }

    const { meta, amount } = verifiedData;
    if (!meta || !meta.userId || !meta.tableId) {
      return res.status(400).send("Missing metadata");
    }

    const { userId, tableId } = meta;

    try {
      const table = await createTableSchema.findById(tableId);
      if (!table) {
        return res.status(404).send("Table not found");
      }

      const expectedAmount = table.price;
      if (Number(amount) !== Number(expectedAmount)) {
        console.error(`Amount mismatch. Expected: ${expectedAmount}, Got: ${amount}`);
        return res.status(400).send("Incorrect payment amount");
      }

      const reservation = await ReserveTableSchema.findOne({ tx_ref });

      if (!reservation) {
        return res.status(404).send("Reservation not found");
      }

      if (reservation.isPaid) {
        console.log("Reservation already marked as paid");
        return res.status(200).send("Already processed");
      }

      // ✅ Mark reservation as paid and reserved
      reservation.isPaid = true;
      reservation.isReserved = true;
      reservation.reservedAt = new Date();
      reservation.paymentReference = transaction_id;
      await reservation.save();

      await createTableSchema.findByIdAndUpdate(tableId, {
        isReserved: true,
        reservedAt: new Date(),
        user: userId,
        tx_ref,
        paymentReference: transaction_id
      });      

      const user = await UserSchema.findById(userId);

      if (user?.email) {
        await sendEmail(
          user.email,
          "Your Table Reservation is Confirmed",
          `<p>Dear ${user.name},</p>
           <p>Your reservation for Table <strong>${table?.tableNumber}</strong> has been confirmed and paid successfully.</p>
           <p>It will be held for 10 minutes unless you check in.</p>`
        );
      }

      // ⏱ Auto release logic
      setTimeout(async () => {
        try {
          const latest = await ReserveTableSchema.findById(reservation._id);
          if (latest?.isReserved) {
            latest.isReserved = false;
            latest.isPaid = false;
            latest.reservedAt = null;
            latest.paymentReference = undefined;
            await latest.save();

            await createTableSchema.findByIdAndUpdate(tableId, {
              isReserved: false,
              reservedAt: null,
              user: null,
              tx_ref: null,
              $unset: { paymentReference: "" }
            });            

            if (user?.email) {
              await sendEmail(
                user.email,
                "Reservation Released",
                `<p>Dear ${user.name},</p>
                 <p>Your reservation for Table <strong>${table?.tableNumber}</strong> has been released due to inactivity after 10 minutes.</p>`
              );
            }

            console.log("⏱️ Table released after 10 minutes");
          }
        } catch (releaseErr) {
          console.error("❌ Error releasing table:", releaseErr.message);
        }
      }, 10 * 60 * 1000);

      return res.status(200).send("Payment processed securely");
    } catch (err) {
      console.error("❌ Error processing reservation:", err.message);
      return res.status(500).send("Internal error");
    }
  } else {
    return res.status(200).send("Ignored event");
  }
};
