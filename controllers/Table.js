import createTableSchema from "../models/CreateTable.js";
import TableCat from "../models/TableCategory.js";
export const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, price, categoryId } = req.body; // Accept categoryId from request body

    // Check if the category exists
    const category = await TableCat.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, msg: "Category not found" });
    }

    // Create a new table and assign the categoryId
    const newTable = new createTableSchema({
      tableNumber,
      capacity,
      price,
      table_category: categoryId, // Assigning the category to the table
    });

    const tableDoc = await newTable.save();

    res.status(201).json({
      success: true,
      msg: "Table successfully created",
      data: tableDoc,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "An error occurred while creating the table" });
  }
};

export const updateTable = async (req, res) => {
  try {
    const id = req.params.id;
    const tableId = await createTableSchema.findById(id);
    if (!tableId)
      res.status(404).json({
        success: false,
        msg: "Table id not found or an error ocurred",
      });

    const update = await createTableSchema.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res
      .status(200)
      .json({ success: true, msg: "Table updated sucessfully", data: update });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "An Error Ocured While Updating Table" });
  }
};

export const getAllTable = async (req, res) => {
  try {
    const resp = await createTableSchema
      .find()
      .populate("table_category", { __v: 0 })
      .populate("user", { password: 0, __v: 0 });
    res
      .status(200)
      .json({ success: true, msg: "Table Retrieved Successfully", data: resp });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "An Error Ocured While Retrieving Tables" });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const id = req.params.id;
    const findTable = await createTableSchema.findById(id);
    if (!findTable)
      res.status(404).json({ success: false, msg: "Table id not found" });
    const resp = await createTableSchema.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, msg: "Table deleted successfully", data: resp });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "An Error Ocured While Deleting Table" });
  }
};

export const getTableByCategory = async (req, res) => {
  try {
    const { id } = req.params; // id = categoryId

    // Find tables with matching category
    const tables = await createTableSchema.find({ table_category: id });

    res.status(200).json({
      success: true,
      msg: "Tables found successfully for the category.",
      data: tables,
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ msg: "An error occurred while retrieving tables by category." });
  }
};
