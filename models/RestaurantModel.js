import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String },
  },
  { timestamps: true }
);

// Cascade delete: When a restaurant is deleted, delete its locations
restaurantSchema.pre("findOneAndDelete", async function (next) {
  const restaurantId = this.getQuery()["_id"];
  await mongoose.model("Location").deleteMany({ restaurant: restaurantId });
  next();
});

const RestaurantSchema = mongoose.model("Restaurant", restaurantSchema);
export default RestaurantSchema;
