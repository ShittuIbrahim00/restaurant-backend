import createTableSchema from "../models/CreateTable.js";
import ReserveTableSchema from "../models/TableReserve.js";
import sendEmail from "./sendEmail.js";

export const releaseExpiredReservations = async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

    const expiredReservations = await ReserveTableSchema.find({
      isReserved: true,
      reservedAt: { $lte: tenMinutesAgo },
    }).populate('user'); // populate user to get email

    for (const reservation of expiredReservations) {
      const tableId = reservation.table;
      const userEmail = reservation.user?.email;

      // Release table
      await createTableSchema.findByIdAndUpdate(tableId, {
        isReserved: false,
        reservedAt: null,
      });

      // Reset reservation
      await ReserveTableSchema.findByIdAndUpdate(reservation._id, {
        isReserved: false,
        isPaid: false,
        reservation_Date: null,
        reservation_Time: null,
        reservedAt: null,
      });

      console.log(`🕒 Released table ${tableId} from expired reservation`);

      // Send email notification if user email is present
      if (userEmail) {
        const subject = "Your Table Reservation Has Been Released";
        const htmlContent = `
          <h2>Reservation Released</h2>
          <p>Dear customer,</p>
          <p>Your table reservation has been automatically released as the payment was not completed in time.</p>
          <p>If you still want to book a table, please make a new reservation.</p>
          <p>Thank you for choosing Spicyhunt Restaurant.</p>
          <a href="https://restaurant-project-ivory.vercel.app/tables">Book another table</a>
        `;

        await sendEmail(userEmail, subject, htmlContent);
      }
    }
  } catch (err) {
    console.error("❌ Error releasing expired reservations:", err.message);
  }
};
