import TableReserve from "../models/TableReserve.js";
import createTableSchema from "../models/CreateTable.js";

export const releaseExpiredReservations = async () => {
  const expirationMs = 1 * 60 * 1000; // 1 minute
  const expirationDate = new Date(Date.now() - expirationMs);

  try {
    const expiredReservations = await TableReserve.find({
      isReserved: true,
      reservedAt: { $lte: expirationDate },
    });

    for (const reservation of expiredReservations) {
      reservation.isReserved = false;
      reservation.isPaid = false; // optional, if you want to reset payment
      reservation.reservedAt = null;
      reservation.paymentReference = null;
      await reservation.save();

      const table = await createTableSchema.findById(reservation.table);
      if (table) {
        table.isReserved = false;
        table.reservedAt = null;
        await table.save();
      }

      console.log(`Released reservation ${reservation._id} and associated table.`);
    }
  } catch (error) {
    console.error("Error releasing expired reservations:", error);
  }
};
