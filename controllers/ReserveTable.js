import User from "../models/userModel.js";
import TableReserve from "../models/TableReserve.js";
import createTableSchema from "../models/CreateTable.js";

export const createReserveTable = async (req, res) => {
  try {
    const { tableNumber, reservation_Date, reservation_Time, qty_persons, userId } = req.body;

   
    const lastTable = await createTableSchema.find().sort({ tableNumber: -1 }).limit(1);
    
    if (lastTable.length > 0 && tableNumber <= lastTable[0].tableNumber) {
      return res.status(400).json({
        success: false,
        msg: `Table number should be greater than ${lastTable[0].tableNumber}. Please choose a valid number.`,
      });
    }

    // Proceed to create reservation (as before)
    const table = await createTableSchema.findById(req.params._id);
    if (!table) {
      return res.status(404).json({
        success: false,
        msg: "Table not found",
      });
    }

    if (qty_persons > table.capacity) {
      return res.status(400).json({
        success: false,
        msg: `This table can only accommodate ${table.capacity} people`,
      });
    }

    // Create reservation
    const reservation = new TableReserve({
      table: table._id,
      user: userId, // Add userId from request body
      reservation_Date,
      reservation_Time,
      qty_persons,
    });

    const savedReservation = await reservation.save();
    res.status(201).json({
      success: true,
      msg: "Table reserved successfully",
      data: savedReservation,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      msg: "An error occurred while reserving the table",
    });
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
    const resp = await TableReserve.find()
      .populate("table")
      .populate("user", { password: 0, __v: 0 });

    res.status(200).json({
      success: true,
      msg: "Successfully Retrieved All Reserve Tables",
      data: resp,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "An Error Occurred While Retrieving Reserve Tables"
    });
  }
};


export const deleteReserveTable = async (req, res) => {
  try {
    const id = req.params.id; // Assuming your route is defined as '/path/:id'
    const find = await TableReserve.findById(id);
    if (!find) {
      return res.status(404).json({
        success: false,
        msg: "Table id not found or table does not exist",
      });
    }

    const deletedTable = await TableReserve.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      msg: "Successfully deleted reserve table",
      data: deletedTable,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      msg: "An Error Occurred While Deleting Reserve Table"
    });
  }
};
