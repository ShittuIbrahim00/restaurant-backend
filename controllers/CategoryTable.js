import TableCat from "../models/TableCategory";
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
        const id = req.params
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

export const deleteTableCategory = async(req, res)=>{
    try {
        
    } catch (error) {
        console.log(error.message);
        res
          .status(500)
          .json({ msg: "An Error Ocured While  Deleting Table Category" });
    }
}
