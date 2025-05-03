import express from "express";
import { createLocation, deleteLocation, getLocationsByRestaurant, getLocationById, updateLocation } from "../controllers/locationController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const LocationRouter = express.Router();

// Create a location (admin or restaurant-owner)
LocationRouter.post("/create-location", protect, authorizeRoles("admin", "restaurant-owner"), createLocation);

// Get all locations for a restaurant
// ?restaurantId=123
LocationRouter.get("/restaurant-locations", getLocationsByRestaurant);

// Get a single location
LocationRouter.get("/restaurant-location", getLocationById);

// Delete a location
LocationRouter.put("/restaurant-location", updateLocation);

LocationRouter.delete("/restaurant-location", deleteLocation);

export default LocationRouter;
