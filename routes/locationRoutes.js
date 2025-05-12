import express from "express";
import { createLocation, deleteLocation, getLocationsByRestaurant, getLocationById, updateLocation } from "../controllers/locationController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const LocationRouter = express.Router();

LocationRouter.post("/create-location", protect, authorizeRoles("admin", "restaurant-owner"), createLocation);
LocationRouter.get("/restaurant-locations", getLocationsByRestaurant);
LocationRouter.get("/restaurant-location", getLocationById);
LocationRouter.put("/restaurant-location/:id", protect, authorizeRoles("admin", "restaurant-owner"), updateLocation);

LocationRouter.delete("/restaurant-location", protect, authorizeRoles("admin", "restaurant-owner"), deleteLocation);

export default LocationRouter;