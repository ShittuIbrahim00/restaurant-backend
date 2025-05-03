import LocationSchema from "../models/LocationModel.js";
import RestaurantSchema from "../models/RestaurantModel.js";

// Create Location - Admin or Restaurant Owner
export const createLocation = async (req, res) => {
  try {
    const { restaurant, address, city } = req.body;
    const user = req.user;

    const foundRestaurant = await RestaurantSchema.findById(restaurant);
    if (!foundRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const checkIfAddExist = await LocationSchema.findOne({address});
    if(checkIfAddExist) return res.status(400).json({message: "Address exists"})

    // Role-based access check
    if (user.role === "restaurant-owner") {
      if (!foundRestaurant.owner.equals(user._id)) {
        return res.status(403).json({ message: "Forbidden: You can only add location to your own restaurant" });
      }
    } else if (user.role !== "admin") {
      return res.status(403).json({ message: "Only admin or restaurant-owner can add locations" });
    }

    const location = await LocationSchema.create({ restaurant, address, city });

    res.status(201).json({ message: "Location created", location });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get all locations for a restaurant
export const getLocationsByRestaurant = async (req, res) => {
    try {
      const { restaurantId } = req.query;
  
      const locations = await LocationSchema.find({ restaurant: restaurantId });
      res.status(200).json(locations);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  
  // Get a single location by ID
  export const getLocationById = async (req, res) => {
    try {
      const { id } = req.query;
  
      const location = await LocationSchema.findById(id).populate("restaurant", "name");
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
  
      res.status(200).json(location);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };  

  // Update Location - Admin or restaurant-owner
export const updateLocation = async (req, res) => {
    try {
      const user = req.user;
      const { id } = req.params;
      const updates = req.body;
  
      const location = await Location.findById(id).populate("restaurant");
  
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
  
      if (user.role === "admin" || (user.role === "restaurant-owner" && location.restaurant.owner.equals(user._id))) {
        const updatedLocation = await Location.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true,
        });
        return res.status(200).json({ message: "Location updated", location: updatedLocation });
      } else {
        return res.status(403).json({ message: "Not authorized to update this location" });
      }
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  

// Delete Location - Admin or Restaurant Owner (of the specific restaurant)
export const deleteLocation = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.query;

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
