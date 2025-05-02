import express from "express";
import { createLocation, deleteLocation, getLocationsByRestaurant, getLocationById } from "../controllers/locationController.js";

const LocationRouter = express.Router();

// Create a location (admin or restaurant-owner)
LocationRouter.post("/", createLocation);

// Get all locations for a restaurant
LocationRouter.get("/restaurant/:restaurantId", getLocationsByRestaurant);

// Get a single location
LocationRouter.get("/:id", getLocationById);

// Delete a location
LocationRouter.delete("/:id", deleteLocation);

export default LocationRouter;
