import { Break } from "../model/break.model.js";

const breakSetter = async (req, res) => {
  const { type, startTime, endTime, date } = req.body;

  try {
    let breakRes;

    if (type === "Lunch") {
      breakRes = await Break.create({
        breakType: type,
        lunchBreakStart: startTime,
        lunchBreakEnd: endTime,
        date: date,
        employeeId: req.user?._id,
      });
    } else if (type === "Snacks") {
      breakRes = await Break.create({
        breakType: type,
        snacksBreakStart: startTime,
        snacksBreakEnd: endTime,
        date: date,
        employeeId: req.user?._id,
      });
    } else if (type === "Tea") {
      breakRes = await Break.create({
        breakType: type,
        teaBreakStart: startTime,
        teaBreakEnd: endTime,
        date: date,
        employeeId: req.user?._id,
      });
    }

    if (!breakRes) {
      return res.status(500).json({
        error: error.message,
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      data: breakRes,
      message: "Break set !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Error while setting break !!",
      success: false,
    });
  }
};

const setEndTime = async (req, res) => {
  const { type, endTime, date } = req.body;
  console.log(req.body);

  try {
    let breakRes;

    if (type === "Lunch") {
      breakRes = await Break.findOneAndUpdate(
        {
          employeeId: req.user?._id,
          breakType: type,
          date: date,
        },
        {
          $set: {
            lunchBreakEnd: endTime,
          },
        },
        { new: true }
      );
    } else if (type === "Snacks") {
      breakRes = await Break.findOneAndUpdate(
        {
          employeeId: req.user?._id,
          breakType: type,
          date: date,
        },
        {
          $set: {
            snacksBreakEnd: endTime,
          },
        },
        { new: true }
      );
    } else if (type === "Tea") {
      breakRes = await Break.findOneAndUpdate(
        {
          employeeId: req.user?._id,
          breakType: type,
          date: date,
        },
        {
          $set: {
            teaBreakEnd: endTime,
          },
        },
        { new: true }
      );
    }

    if (!breakRes) {
      return res.status(500).json({
        error: error.message,
        message: "Break Document not found !!",
        success: false,
      });
    }

    return res.status(200).json({
      data: breakRes,
      message: "End time set !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "Error while set end time !!",
      success: false,
    });
  }
};

export { breakSetter, setEndTime };
