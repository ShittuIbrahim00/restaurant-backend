import express from "express";
import { createRestaurant, deleteRestaurant, getAllRestaurants, getRestaurantById } from "../controllers/restaurantController.js";

const restaurantRouter = express.Router();

// Create a restaurant (admin only)
restaurantRouter.post("/create-restaurant", createRestaurant);

// Get all restaurants
restaurantRouter.get("/restaurants", getAllRestaurants);

// Get single restaurant (and its locations)
restaurantRouter.get("/restaurant", getRestaurantById);

// Delete a restaurant (admin only)
restaurantRouter.delete("/restaurant", deleteRestaurant);

export default restaurantRouter;
