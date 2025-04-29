import TableCat from "../models/TableCategory.js";
import Table from '../models/CreateTable.js'

export const createTableCategory = async (req, res) => {
  try {
    const createCategory = {
      name: req.body,
    };
    const resp = new TableCat(createCategory);
    const create = await resp.save();
    res
      .status(200)
      .json({
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


export const updateTableCategory = async(req, res)=>{
    try {
        const id = req.params.id
        const findCategory = TableCat.findById(id)
        if(!findCategory) res.status(404).json({sucess: false, msg: 'Table Category Id Was Not Found Or Table Category Does Not Exit'})

        const update = TableCat.findByIdAndUpdate(id, req.body, {new: true})
        res.status(200).json({success: true, msg: 'Table Category Successfully Updated', data: update})
    } catch (error) {
        console.log(error.message);
        res
          .status(500)
          .json({ msg: "An Error Ocured While  Updating Table Category" });
    }
}

export const deleteTableCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await TableCat.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, msg: 'Table Category Id Was Not Found Or Table Category Does Not Exist' });
    }
    await Table.deleteMany({ category: id });

    await TableCat.findByIdAndDelete(id);

    res.status(200).json({ success: true, msg: 'Table Category Successfully Deleted' });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "An Error Occurred While Deleting Table Category" });
  }
};

