import cron from "node-cron";
import createTableSchema from "../models/CreateTable.js";
import ReserveTableSchema from "../models/TableReserve.js";

// Every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const expiredReservations = await ReserveTableSchema.find({
      isReserved: true,
      isPaid: false,
      reservedAt: { $lte: oneHourAgo },
    });

    const tableIdsToRelease = expiredReservations.map(res => res.table);

    await createTableSchema.updateMany(
      { _id: { $in: tableIdsToRelease } },
      { $set: { isReserved: false } }
    );

    await ReserveTableSchema.updateMany(
      { _id: { $in: expiredReservations.map(res => res._id) } },
      { $set: { isReserved: false } }
    );

    console.log("Expired reservations cleared:", expiredReservations.length);
  } catch (error) {
    console.error("Error releasing tables:", error.message);
  }
});
