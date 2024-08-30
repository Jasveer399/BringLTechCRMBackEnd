import { Leave } from "../model/leave.model.js";
import { Employee } from "../model/employee.model.js";
import { formatDate } from "../utils/formattedDateTime.js";
import mongoose from "mongoose";

const createLeave = async (req, res) => {
  const { employeeId, leaveType, reason, date } = req.body;

  try {
    if (!employeeId && !leaveType && !reason && !date) {
      return res.status(400).json({
        error: error.message,
        message: "All data is required !!",
        success: false,
      });
    }

    const user = await Employee.findById({ _id: employeeId });

    if (!user) {
      return res.status(500).json({
        error: error.message,
        message: "User not found !!",
        success: false,
      });
    }
    console.log(req.body)
    if (leaveType === "Half-Day") {
      // Find the matching availability object
      const availabilityIndex = user.availability.findIndex(
        (avail) => avail.availableFrom && avail.availableFrom.split(",")[0] === date
      );
      console.log(availabilityIndex)

      if (availabilityIndex !== -1) {
        // Update existing availability
        user.availability[availabilityIndex].isAvailable = false;
        user.availability[availabilityIndex].type = leaveType;
        user.availability[availabilityIndex].owner = "Employee";
        user.availability[availabilityIndex].date = date;
      } else {
        // If no matching availability found, create a new one
        const newAvailability = {
          // availableFrom: date,
          // availableTo: date, // Assuming same date for availableTo
          isAvailable: false,
          date: date,
          owner: "Employee",
          type: leaveType,
        };
        user.availability.push(newAvailability);
      }
    } else {
      // For full-day leaves, create a new availability entry
      const newAvailability = {
        date: date,
        owner: "Employee",
        isAvailable: false,
        type: leaveType,
      };
      user.availability.push(newAvailability);
    }

    const leave = await Leave.create({
      employeeId,
      leaveType,
      reason,
      date,
    });

    if (!leave) {
      return res.status(500).json({
        error: error.message,
        message: "Error while creating leave !!",
        success: false,
      });
    }
    await user.save();

    return res.status(200).json({
      data: leave,
      message: "Leave Created !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Error while creating leave !!",
      success: false,
    });
  }
};

const fetchLeaveOfSpecificemployee = async (req, res) => {
  // const { employeeId } = req.body;
  let id
  if (req.body.employeeId) {
    id = req.body.employeeId
  } else {
    id = req.user?._id
  }
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = currentDate.getFullYear();

    const leaves = await Leave.aggregate([
      {
        $match: {
          employeeId: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $addFields: {
          dateParts: {
            $map: {
              input: { $split: ["$date", "-"] },
              as: "part",
              in: { $toInt: "$$part" },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $arrayElemAt: ["$dateParts", 1] }, currentMonth] },
              { $eq: [{ $arrayElemAt: ["$dateParts", 2] }, currentYear] },
            ],
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Leaves fetched successfully",
      success: true,
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Error while fetching leave !!",
      success: false,
    });
  }
};

const getEmployeesOnLeaveToday = async (req, res) => {
  try {
    // Get today's date in the format dd-M-yyyy
    const dateTime = formatDate(new Date());
    const today = dateTime.split(",")[0];

    const employeesOnLeave = await Leave.aggregate([
      {
        $match: {
          date: today,
        },
      },
      {
        $lookup: {
          from: "employees", // Assuming your Employee collection name is "employees"
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $unwind: "$employeeDetails",
      },
      {
        $project: {
          _id: 1,
          leaveType: 1,
          reason: 1,
          date: 1,
          employeeName: "$employeeDetails.name",
          employeeID: "$employeeDetails._id",
        },
      },
    ]);

    const count = employeesOnLeave.length;

    return res.status(200).json({
      success: true,
      message: "Employees on leave today fetched successfully",
      count: count,
      data: employeesOnLeave,
    });
  } catch (error) {
    return res.status(500).json({
      error: error,
      message: "Error while counting employees on leave today",
      success: false,
    });
  }
};

const fetchAllEmployeesLeaves = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = currentDate.getFullYear();

    const leaves = await Leave.aggregate([
      {
        $addFields: {
          dateParts: {
            $map: {
              input: { $split: ["$date", "-"] },
              as: "part",
              in: { $toInt: "$$part" },
            },
          },
        },
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $arrayElemAt: ["$dateParts", 1] }, currentMonth] },
              { $eq: [{ $arrayElemAt: ["$dateParts", 2] }, currentYear] },
            ],
          },
        },
      },
    ]);

    return res.status(200).json({
      message: "Leaves fetched successfully",
      success: true,
      data: leaves,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Error while fetching leaves !!",
      success: false,
    });
  }
};


export { createLeave, fetchLeaveOfSpecificemployee, getEmployeesOnLeaveToday, fetchAllEmployeesLeaves };
