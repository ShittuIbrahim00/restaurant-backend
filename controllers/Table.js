import createTableSchema from "../models/CreateTable.js";
import TableCat from "../models/TableCategory.js";
import TableReserve from "../models/TableReserve.js";

export const createTable = async (req, res) => {
  try {
    const { capacity, price, tableNumber, categoryId } = req.body;

    // Check if the category exists

    const existingTable = await createTableSchema.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        msg: `Table number ${tableNumber} already exists. Please choose a different number.`,
      });
    }
    const category = await TableCat.findById(categoryId);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, msg: "Category not found" });
    }

    // Create a new table and assign the categoryId
    const newTable = new createTableSchema({
      capacity: capacity,
      price: price,
      tableNumber: tableNumber,
      categoryId: categoryId,
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
      .populate("categoryId")
      .populate("user", { password: 0, __v: 0 });

    res.status(200).json({
      success: true,
      msg: "Table Retrieved Successfully",
      data: resp,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "An Error Occurred While Retrieving Tables" });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const id = req.params.id;

    const findTable = await createTableSchema.findById(id);
    if (!findTable) {
      return res.status(404).json({
        success: false,
        msg: "Table ID not found",
      });
    }

    const reservations = await ReserveTableSchema.find({ table: id });
    if (reservations.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "Cannot delete table, it has active reservations.",
      });
    }

    // Step 3: Delete the table
    await createTableSchema.findByIdAndDelete(id);

    const resp = await createTableSchema.find().populate("categoryId");
    res.status(200).json({
      success: true,
      msg: "Table deleted successfully",
      data: resp,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      msg: "An error occurred while deleting the table",
    });
  }
};

export const getTableByCategory = async (req, res) => {
  try {
    const { id } = req.params; // id = categoryId

    // Find tables with matching category
    const tables = await createTableSchema.find({ categoryId: id });

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


export const getSingleTable = async (req, res) => {
  try {
    const { tableId } = req.params;

    // Validate tableId
    if (!tableId) {
      return res.status(400).json({ success: false, msg: 'Table ID is required' });
    }

    // Find the table by ID
    const findTable = await createTableSchema.findById(tableId);

    // If table not found
    if (!findTable) {
      return res.status(404).json({ success: false, msg: 'Table not found or does not exist' });
    }

    // Success response
    res.status(200).json({
      success: true,
      msg: 'Table retrieved successfully',
      data: findTable
    });

  } catch (error) {
    console.error("Error fetching table:", error.message);
    res.status(500).json({
      success: false,
      msg: "An error occurred while retrieving table.",
      error: error.message // Provide error message for debugging
    });
  }
};
