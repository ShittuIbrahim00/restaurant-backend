import cron from "node-cron";
import createTableSchema from "../models/CreateTable.js";
// import CreateTable from "../models/CreateTable.js";

// Run every 10 minutes (you can adjust the interval)
cron.schedule("*/10 * * * *", async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const released = await createTableSchema.updateMany(
      {
        isReserved: true,
        reservedAt: { $lte: oneHourAgo },
      },
      {
        $set: { isReserved: false, reservedAt: null },
      }
    );

    if (released.modifiedCount > 0) {
      console.log(`${released.modifiedCount} tables released`);
    }
  } catch (err) {
    console.error("Error releasing tables:", err);
  }
});
