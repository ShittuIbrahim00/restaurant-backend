import User from "../models/userModel.js";
import TableReserve from "../models/TableReserve.js";
export const createReserveTable = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      reservtion_Date,
      reservation_Time,
      qty_persons,
    } = req.body;
    const user = await User.findById(userId);
    if (!user)
      res.status(404).json({
        success: false,
        msg: "User id not found or user does not exist",
      });

    const tableRe = {
      reservtion_Date,
      reservation_Time,
      qty_persons,
    };
    const Reserve = new TableReserve(tableRe);
    const resp = await Reserve.save();
    res
      .status(200)
      .json({sucess: true, msg: "Table Reserved Successfully", data: resp });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "An Error Ocured While Reserving Table" });
  }
};




export const updateReserveTable = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user)
      res.status(404).json({
        success: false,
        msg: "User id not found or user does not exist",
      });
    const update = await TableReserve.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      msg: "Table Reservation Successfully Updated",
      data: update,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ msg: "An Error Ocured While Updating Reservtion Table" });
  }
};




export const getAllReserveTable = async (req, res) => {
  try {
    const resp = await TableReserve.find().populate("table").populate("user", {
      password: 0,
      __v: 0,
    });
    res.status(200).json({
      success: true,
      msg: "Succesfully Retrieved All Reserve Table",
      data: resp,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ msg: "An Error Ocured While Retrieving Reserve Table" });
  }
};




export const deleteReserveTable = async (req, res) => {
  try {
    const tableId = req.params.id;
    const find = TableReserve.findById(tableId);
    if (!find)
      res.status(404).json({
        success: false,
        msg: "Table id not found or table does not exist",
      });

    const deletereTable = TableReserve.findByIdAndDelete(tableId);
    res.status(200).json({
      success: true,
      msg: "Successfully deleted reserve table",
      data: deletereTable,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ msg: "An Error Ocured While Deleting Reserve Table" });
  }
};
