import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  },
  { timestamps: true }
);

const LocationSchema = mongoose.model("Location", locationSchema);
export default LocationSchema;
