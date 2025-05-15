import express from "express";
import { createRestaurant, deleteRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant } from "../controllers/restaurantController.js";
import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

const restaurantRouter = express.Router();

restaurantRouter.post("/create-restaurant", createRestaurant);
restaurantRouter.get("/restaurants", getAllRestaurants);
restaurantRouter.get("/restaurant", getRestaurantById);
restaurantRouter.put("/restaurant/:id", protect, authorizeRoles("admin"), updateRestaurant);
restaurantRouter.delete("/restaurant/:id", protect, authorizeRoles("admin"), deleteRestaurant);

export default restaurantRouter;