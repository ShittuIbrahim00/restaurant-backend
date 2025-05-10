import express from "express";
import { createRestaurant, deleteRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant } from "../controllers/restaurantController.js";

const restaurantRouter = express.Router();

restaurantRouter.post("/create-restaurant", createRestaurant);
restaurantRouter.get("/restaurants", getAllRestaurants);
restaurantRouter.get("/restaurant", getRestaurantById);
restaurantRouter.put("/restaurant", updateRestaurant);
restaurantRouter.delete("/restaurant", deleteRestaurant);

export default restaurantRouter;