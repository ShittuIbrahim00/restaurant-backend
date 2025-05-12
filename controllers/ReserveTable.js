import User from "../models/userModel.js";
import TableReserve from "../models/TableReserve.js";
import createTableSchema from "../models/CreateTable.js";

export const createReserveTable = async (req, res) => {
  try {
    const { reservation_Date, reservation_Time, qty_persons, userId } =
      req.body;

    // Validate user ID
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, msg: "User ID is required" });
    }

    // Check if user exists
    const findUser = await User.findById(userId);
    if (!findUser) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Validate table ID
    const tableId = req.params;
    if (!tableId) {
      return res
        .status(400)
        .json({ success: false, msg: "Table ID is required" });
    }

    // Find the table
    const table = await createTableSchema.findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, msg: "Table not found" });
    }

    // Convert qty_persons to a number and validate capacity
    const quantity = parseInt(qty_persons, 10);
    if (isNaN(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid number of persons" });
    }

    if (quantity > table.capacity) {
      return res.status(400).json({
        success: false,
        msg: `This table can only accommodate ${table.capacity} people`,
      });
    }

    // Check for conflicting reservation
    const conflictingReservation = await TableReserve.findOne({
      table: table._id,
      reservation_Date,
      reservation_Time,
    });

    if (conflictingReservation) {
      return res.status(409).json({
        success: false,
        msg: "This table is already reserved for the selected date and time",
      });
    }

    // Set table as reserved
    table.isReserved = true;
    const savedTable = await table.save();

    if (!savedTable) {
      return res
        .status(500)
        .json({ success: false, msg: "Failed to set table as reserved" });
    }

    // Create the reservation
    const reservation = new TableReserve({
      table: table._id,
      user: userId,
      reservation_Date,
      reservation_Time,
      qty_persons: quantity, // Store as a number
    });

    const savedReservation = await reservation.save();

    res.status(201).json({
      success: true,
      msg: "Table reserved successfully",
      data: savedReservation,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        msg: "An error occurred while reserving the table",
      });
  }
};

export const cancelReserveTable = async (req, res) => {
  try {
    const { reservationId } = req.params;

    // Find the reservation
    const reservation = await TableReserve.findById(reservationId);
    if (!reservation) {
      return res
        .status(404)
        .json({ success: false, msg: "Reservation not found" });
    }

    // Find the table
    const table = await createTableSchema.findById(reservation.table);
    if (!table) {
      return res.status(404).json({ success: false, msg: "Table not found" });
    }

    // Set table as not reserved
    table.isReserved = false;
    await table.save();

    // Delete the reservation
    await TableReserve.findByIdAndDelete(reservationId);

    res
      .status(200)
      .json({ success: true, msg: "Reservation canceled successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "An error occurred while canceling the reservation" });
  }
};

export const getSingleReserveTable = async (req, res) => {
  try {
    const { reservationId } = req.params;

    if (!reservationId) {
      return res
        .status(404)
        .json({ success: false, msg: "Reservation id required" });
    }
    const findReserveTableByID = await TableReserve.findById(reservationId).populate('user', {__v: 0, password: 0}).populate('table', {__v:0})
    if (!findReserveTableByID) {
      return res
        .status(404)
        .json({ success: false, msg: "Reserve table not found" });
    }
    res.status(200).json({
      success: true,
      msg: "Reserve Table Retrieve Successfully",
      data: findReserveTableByID,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ msg: "An error occurred while fetching the reservation table" });
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
      msg: "An Error Occurred While Retrieving Reserve Tables",
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
      msg: "An Error Occurred While Deleting Reserve Table",
    });
  }
};
