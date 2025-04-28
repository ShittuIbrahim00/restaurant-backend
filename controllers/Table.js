import createTableSchema from "../models/CreateTable.js";
import TableCat from "../models/TableCategory.js";
export const createTable = async (req, res) => {
  try {
    const id = req.body
    const { table_number, capacity, price, restaurantId } =
      req.body;

      const findCategory = await TableCat.findById(id)
      if(!findCategory) res.status(404).json({status: false, msg: 'Category id not found or category does not exit'})
    const newTable = {
      table_number,
      restaurantId,
      capacity,
      price,
    };

    const tableDoc = new createTableSchema(newTable);
    const resp = await tableDoc.save();
    res
      .status(201)
      .json({ success: true, msg: "Table Successfully Created", data: resp });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "An Error Ocured While Creating Table" });
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
    const resp = await createTableSchema.find().populate('table_category', {__v: 0}).populate('user', {password: 0, __v: 0});
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
    res.status(200).json({ success: true, msg: "Table deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "An Error Ocured While Deleting Table" });
  }
};
