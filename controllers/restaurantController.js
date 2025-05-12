import RestaurantSchema from "../models/RestaurantModel.js";
import UserSchema from "../models/userModel.js";

// Create Restaurant - Only admin can do this
export const createRestaurant = async (req, res) => {
  try {
    const { name, owner, description } = req.body;

    // Validate owner
    const validatedOwner = await UserSchema.findById(owner);
    if (!validatedOwner || validatedOwner.role !== "restaurant-owner") {
      return res.status(400).json({ message: "Invalid restaurant owner" });
    };

    const checkName = await RestaurantSchema.findOne({name});
    if(checkName) return res.status(400).json({ message: "Name already exist" });

    const restaurant = await RestaurantSchema.create({
      name,
      owner: owner,
      description,
    });

    res.status(201).json({ message: "Restaurant created", restaurant });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
    try {
      const restaurants = await RestaurantSchema.find().populate("owner", "name email role");
      res.status(200).json(restaurants);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  
  // Get a single restaurant by ID
  export const getRestaurantById = async (req, res) => {
    try {
      const { id } = req.query;
  
      const restaurant = await RestaurantSchema.findById(id).populate("owner", "name email role");
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      // Optionally include locations
      const locations = await Location.find({ restaurant: id });
  
      res.status(200).json({ restaurant, locations });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

  // Update Restaurant - Admin only
export const updateRestaurant = async (req, res) => {
    try {
      const user = req.user;
  
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can update restaurants" });
      }
  
      const { id } = req.params;
      const updates = req.body;
  
      const restaurant = await RestaurantSchema.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });
  
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      res.status(200).json({ message: "Restaurant updated", restaurant });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  

// Delete Restaurant (and its Locations) - Only admin
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.query;

    const restaurant = await RestaurantSchema.findOneAndDelete({ _id: id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Location deletion is handled by the schema pre hook
    res.status(200).json({ message: "Restaurant and associated locations deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};