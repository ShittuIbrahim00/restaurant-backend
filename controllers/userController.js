import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserSchema from "../models/userModel.js";

// =========================
// Self Registration (Admin or Customer)
// =========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["admin", "customer"].includes(role)) {
      return res.status(403).json({ message: "Only admins or customers can self-register" });
    }

    const existing = await UserSchema.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserSchema.create({ name, email, password: hashedPassword, role });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// Login
// =========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserSchema.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// Admin Creates Any User
// =========================
export const adminCreateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can access this route" });
    }

    const { name, email, password, role } = req.body;

    const existing = await UserSchema.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserSchema.create({ name, email, password: hashedPassword, role });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// Branch Manager Creates Staff (not admin)
// =========================
export const staffCreateUser = async (req, res) => {
  try {
    if (req.user.role !== "branch-manager") {
      return res.status(403).json({ message: "Only branch manager can create staff roles" });
    }

    const { name, email, password, role } = req.body;

    const allowedRoles = ["receptionist", "waiter", "chef"];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Branch manager can only create staff roles" });
    }

    const existing = await UserSchema.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserSchema.create({ name, email, password: hashedPassword, role });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// Get All Users (admin use)
// =========================
export const getUsers = async (req, res) => {
  try {
    const users = await UserSchema.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// Get Single User by ID
// =========================
export const getUserById = async (req, res) => {
    try {
      const targetUser = await UserSchema.findById(req.params.id).select("-password");
  
      if (!targetUser) return res.status(404).json({ message: "User not found" });
  
      // Admin can access any
      if (req.user.role === "admin") {
        return res.status(200).json(targetUser);
      }
  
      // Customer can access themselves only
      if (req.user.role === "customer" && req.user._id.toString() === req.params.id) {
        return res.status(200).json(targetUser);
      }
  
      // Staffs can view themselves only
      if (req.user.role === "waiter" && req.user._id.toString() === req.params.id) {
        return res.status(200).json(targetUser);
      }
  
      return res.status(403).json({ message: "Access denied" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

// =========================
// Update User
// =========================
export const updateUser = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      const userToUpdate = await UserSchema.findById(req.params.id);
      if (!userToUpdate) return res.status(404).json({ message: "User not found" });
  
      // Admin can update anyone
      if (req.user.role === "admin") {
        userToUpdate.name = name || userToUpdate.name;
        userToUpdate.email = email || userToUpdate.email;
        if (password) {
          userToUpdate.password = await bcrypt.hash(password, 10);
        }
        await userToUpdate.save();
        return res.status(200).json({ message: "User updated", user: userToUpdate });
      }
  
      // Customer can update self only
      if (
        req.user.role === "customer" &&
        req.user._id.toString() === req.params.id
      ) {
        userToUpdate.name = name || userToUpdate.name;
        userToUpdate.email = email || userToUpdate.email;
        if (password) {
          userToUpdate.password = await bcrypt.hash(password, 10);
        }
        await userToUpdate.save();
        return res.status(200).json({ message: "Profile updated", user: userToUpdate });
      }
  
      // Staffs cannot update
      return res.status(403).json({ message: "Staff cannot update profile. Please contact admin." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

// =========================
// Delete User
// =========================
export const deleteUser = async (req, res) => {
  try {
    const user = await UserSchema.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
