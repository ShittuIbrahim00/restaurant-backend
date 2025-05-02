import LocationSchema from "../models/LocationModel.js";
import RestaurantSchema from "../models/RestaurantModel.js";

// Create Location - Admin or Restaurant Owner
export const createLocation = async (req, res) => {
  try {
    const user = req.user;
    const { restaurantId, address, city } = req.body;

    const restaurant = await RestaurantSchema.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Access control
    if (user.role === "admin" || (user.role === "restaurant-owner" && restaurant.owner.equals(user._id))) {
      const location = await LocationSchema.create({ restaurant: restaurantId, address, city });
      res.status(201).json({ message: "Location created", location });
    } else {
      return res.status(403).json({ message: "Not authorized to create location for this restaurant" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all locations for a restaurant
export const getLocationsByRestaurant = async (req, res) => {
    try {
      const { restaurantId } = req.params;
  
      const locations = await LocationSchema.find({ restaurant: restaurantId });
      res.status(200).json(locations);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  
  // Get a single location by ID
  export const getLocationById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const location = await LocationSchema.findById(id).populate("restaurant", "name");
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
  
      res.status(200).json(location);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };  

// Delete Location - Admin or Restaurant Owner (of the specific restaurant)
export const deleteLocation = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const location = await LocationSchema.findById(id).populate("restaurant");
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    if (user.role === "admin" || (user.role === "restaurant-owner" && location.restaurant.owner.equals(user._id))) {
      await LocationSchema.findByIdAndDelete(id);
      res.status(200).json({ message: "Location deleted" });
    } else {
      return res.status(403).json({ message: "Not authorized to delete this location" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
