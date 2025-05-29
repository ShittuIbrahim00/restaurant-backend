import menuModel from "../models/menuModel.js";
import Menu from "../models/menuModel.js";
import SupplySchema from "../models/SupplyItem.js";

export const createMenu = async (req, res) => {
  try {
    const {
      admin_id,
      category_id,
      name,
      desc,
      price,
      availability = true,
      ingredients = [],
      img = "",
    } = req.body;

    // Basic validation (you can expand this)
    if (!admin_id) return res.status(400).json({ message: "Admin ID is required" });
    if (!category_id) return res.status(400).json({ message: "Category ID is required" });
    if (!name || !desc) return res.status(400).json({ message: "Name and description are required" });
    if (price == null || price < 0) return res.status(400).json({ message: "Valid price is required" });

    // Map ingredients strings to expected objects if needed
    const formattedIngredients = ingredients.map(item => {
      if (typeof item === "string") {
        return { inventoryItem: item, quantity: 1 }; // Or get quantity from request body
      }
      return item;
    });

    const newMenu = new Menu({
      admin_id,
      category_id,
      name,
      desc,
      price,
      availability,
      ingredients: formattedIngredients,
      img,
    });

    await newMenu.save();

    return res.status(201).json({ message: "Menu created successfully", menu: newMenu });
  } catch (error) {
    console.error("Error creating menu:", error);
    return res.status(500).json({ message: "Menu could not be created" });
  }
};

export const getMenu = async (req, res) => {
  try {
    const menus = await Menu.find()
      .populate("ingredients.inventoryItem")
    res.status(200).json({
      success: true,
      message: "All menus",
      menus,
    });
  } catch (err) {
    console.error("Error fetching menus:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
//get menu by category
export const getMenuByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const menus = await Menu.find({
      category_id: categoryId,
      availability: true,
    });
    return res.status(200).json({ menus });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error finding menus by category" });
  }
};

export const getSingleCategory = async (req, res) => {
  try {
    const { menuId } = req.params;
    const checkId = await Menu.findById(menuId);
    if (!checkId)
      return res
        .status(404)
        .json({ message: "Id does not match", success: false });
    const data = await menuModel.findById(menuId);
    res
      .status(200)
      .json({ success: true, data: data, message: "Single category" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const menuId = req.params.id;
    const {
      admin_id,
      category_id,
      name,
      desc,
      price,
      availability,
      ingredients,
      img,
    } = req.body;

    if (!menuId) return res.status(400).json({ message: "Menu ID is required" });

    const updated = await Menu.findByIdAndUpdate(
      menuId,
      {
        admin_id,
        category_id,
        name,
        desc,
        price,
        availability,
        ingredients,
        img,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    return res.json({ message: "Menu updated successfully", menu: updated });
  } catch (err) {
    console.error("Error updating menu:", err);
    res.status(500).json({ message: "Could not update menu item" });
  }
};
