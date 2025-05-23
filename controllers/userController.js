import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserSchema from "../models/userModel.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["admin", "customer"].includes(role)) {
      return res.status(403).json({ message: "Only admins or customers can self-register" });
    }

    const existing = await UserSchema.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserSchema.create({ name, email, password: hashedPassword, role });

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserSchema.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin Creates Any Use
export const adminCreateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can access this route" });
    }

    const { name, email, password, role } = req.body;

    const existing = await UserSchema.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserSchema.create({ name, email, password: hashedPassword, role });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Branch Manager Creates Staff (not admin)
export const staffCreateUser = async (req, res) => {
  try {
    const loggedInRole = req.user.role; // Get role of the person making the request

    if (!["branch-manager", "restaurant-owner"].includes(loggedInRole)) {
      return res.status(403).json({
        message: "Only branch manager and restaurant owner can create staff roles",
      });
    }

    const { name, email, password, role } = req.body;

    const allowedRoles = ["receptionist", "waiter", "chef", "branch-manager"];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Branch manager and restaurant owner can only create staff roles",
      });
    }

    const existing = await UserSchema.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserSchema.create({ name, email, password: hashedPassword, role });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// admin only
export const getUsers = async (req, res) => {
  try {
    const users = await UserSchema.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
    const {userId} = req.query;
  try {
    const targetUser = await UserSchema.findById(userId).select("-password");

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(targetUser);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
    const {userId} = req.query;
  try {
    const { name, email, password } = req.body;

    const userToUpdate = await UserSchema.findById(userId);
    if (!userToUpdate)
      return res.status(404).json({ message: "User not found" });

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
    if (req.user.role === "customer" && userId.toString() === userId) {
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

//   Admin olny
export const deleteUser = async (req, res) => {
    const {userId} = req.query;
  try {
    const user = await UserSchema.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
