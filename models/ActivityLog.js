import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: String,
    action: String,
  },
  { timestamps: true }
);


const ActivityLogSchema = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLogSchema;

// const ActivityLog = require("../models/ActivityLog");

// await ActivityLog.create({
//   user: userId,         // ObjectId of the user
//   role: "Admin",        // Or infer from user.role
//   action: "Added a new table category.",
// });
