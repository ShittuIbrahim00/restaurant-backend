import express from "express";
const userRouter = express.Router();

import { registerUser, loginUser, adminCreateUser, staffCreateUser, getUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";

import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

userRouter.post("/register", registerUser);       // For self-registering admin/customer
userRouter.post("/login", loginUser);             // Login

// Admin creates any user
// Save token to localStorage in the front-end
userRouter.post( "/admin/create-user", protect, authorizeRoles("admin"), adminCreateUser);

// Branch manager (staffs) creates specific roles
// Save token to localStorage in the front-end
userRouter.post( "/staff/create-user", protect, authorizeRoles("branch-manager"), staffCreateUser );

// Get all users (admin only)
userRouter.get("/restaurant-users", protect, authorizeRoles("admin"), getUsers);

// Get single user (admin or self)
userRouter.get("/restaurant-users/:id", protect, getUserById);

// Update user (admin or self)
userRouter.put("/restaurant-users/:id", protect, updateUser);

// Delete user (admin only)
userRouter.delete("/restaurant-users/:id", protect, authorizeRoles("admin"), deleteUser);

export default userRouter;
