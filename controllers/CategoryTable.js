import TableCat from "../models/TableCategory.js";
import Table from "../models/CreateTable.js";

export const createTableCategory = async (req, res) => {
  try {
    const createCategory = {
      name: req.body,
    };
    const resp = new TableCat(createCategory);
    const create = await resp.save();
    res.status(200).json({
      sucess: true,
      msg: "Successfully Created Table Category",
      data: create,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ msg: "An Error Ocured While Creating Table Category" });
  }
};

export const updateTableCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const findCategory = TableCat.findById(id);
    if (!findCategory)
      res
        .status(404)
        .json({
          sucess: false,
          msg: "Table Category Id Was Not Found Or Table Category Does Not Exit",
        });

    const update = TableCat.findByIdAndUpdate(id, req.body, { new: true });
    res
      .status(200)
      .json({
        success: true,
        msg: "Table Category Successfully Updated",
        data: update,
      });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ msg: "An Error Ocured While  Updating Table Category" });
  }
};

export const deleteTableCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid category ID format" });
    }

    const category = await TableCat.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        msg: "Table category not found",
      });
    }

    // Delete all tables under this category
    await createTableSchema.deleteMany({ table_category: id });

    // Then delete the category
    await TableCat.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      msg: "Table category and all related tables deleted successfully",
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "An error occurred while deleting table category" });
  }
};

export const getAllTableCategory = async (req, res) => {
  try {
    const resp = await TableCat.find();
    res
      .status(200)
      .json({
        status: true,
        msg: "Successfully retrieved the data",
        data: resp,
      });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ msg: "An Error Occurred While Fetching Table Category" });
  }
};
