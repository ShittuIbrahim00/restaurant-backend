import express from "express";
const userRouter = express.Router();

import { registerUser, loginUser, adminCreateUser, staffCreateUser, getUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";

import { authorizeRoles, protect } from "../middlewares/authMiddleware.js";

userRouter.post("/register", registerUser);     
userRouter.post("/login", loginUser);           

// Admin creates any user
// Save token to localStorage in the front-end
userRouter.post( "/admin/create-user", protect, authorizeRoles("admin"), adminCreateUser);

// Branch manager (staffs) creates specific roles
// Save token to localStorage in the front-end
userRouter.post( "/staff/create-user", protect, authorizeRoles("branch-manager", "restaurant-owner"), staffCreateUser );

// (admin only)
userRouter.get("/restaurant-users", protect, authorizeRoles("admin", "restaurant-owner", "branch-manager"), getUsers);

// (admin or self)
userRouter.get("/restaurant-user", protect, getUserById);

// (admin or self)
userRouter.put("/update-restaurant-user", protect, updateUser);

// (admin only)
userRouter.delete("/delete-restaurant-user", protect, authorizeRoles("admin", "restaurant-owner"), deleteUser);

export default userRouter;
