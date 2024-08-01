import { Employee } from "../model/employee.model.js";
import { Task } from "../model/task.model.js";
import mongoose from "mongoose";

const createTask = async (req, res) => {
  const { title, description, link, timeFrom, timeTo, employeeId,date} = req.body;
  if (!title && !description && !timeFrom && !timeTo && !date) {
    return res.status(400).json({
      messaage: "all fields are required",
      success: false,
    });
  }

  try {
    const createdTask = await Task.create({
      title,
      description,
      link,
      timeFrom,
      timeTo,
      date,
      createdBy: req.role,
      assignedTo: employeeId,
    });

    if (!createdTask) {
      return res.status(500).json({
        messaage: "Something went wrong while creating task !!",
        success: false,
      });
    }
    return res.status(200).json({
      messaage: "Task created",
      data: createdTask,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error while creating task",
      success: false,
    });
  }
};
const getAllTasks = async (req, res) => {
try {
    const allTasks = await Task.find({});
    if (!allTasks) {
      return res.status(500).json({
        messaage: "Error while getting all task",
        success: false,
      });
    }
    return res.status(200).json({
      messaage: "Task fetched !!",
      data: allTasks,
      count: allTasks.length,
      success: true,
    });
} catch (error) {
  return res.status(500).json({
      messaage: "Error while getting all task",
      success: false,
    });
}
};
const getSpecificEmployeeTask = async (req, res) => {
  let id;
  if (req.body._id) {
    id = new mongoose.Types.ObjectId(req.body._id);
  } else if (req.user?._id) {
    id = req.user?._id;
  }

  const user = await Employee.findById({ _id: id });

  if (!user) {
    return res.status(400).json({
      messaage: "user not found",
      success: false,
    });
  }
  const tasks = await Task.aggregate([
    {
      $match: {
        assignedTo: user._id,
      },
    },
  ]);

  if (!tasks) {
    return res.status(500).json({
      messaage: "tasks not found",
      success: false,
    });
  }

  return res.status(200).json({
    data: tasks,
    messaage: "Tasks fetched",
    success: true,
  });
};
const taskVerifyHandler = async (req, res) => {
  const { _id, link, timeExceedChecker } = req.body;
  console.log(req.body);
  

  const verifiedTask = await Task.findByIdAndUpdate(
    _id,
    {
      $set: {
        completion: true,
        taskcompleteLink:link,
        timeExceeded: timeExceedChecker
      },
    },
    { new: true }
  );
  if (!verifiedTask) {
    return res.status(500).json({
      messaage: "Error while verifying task",
      success: false,
    });
  }
  return res.status(200).json({
    data: verifiedTask,
    messaage: "Task verified !!",
    success: true,
  });
};
const taskDelete = async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({
      messaage: "Task id is required",
      success: false,
    });
  }
  if (!req.user) {
    return res.status(400).json({
      messaage: "UnAuthorized Requiest",
      success: false,
    });
  }
  const task = await Task.findByIdAndDelete({ _id });
  if (!task) {
    return res.status(500).json({
      messaage: "Task is Not Fund",
      success: false,
    });
  }
  return res.status(200).json({
    messaage: "Task deleted successfully",
    success: true,
  });
};
const modifyTaskHandler = async (req, res) => {
  const {
    _id,
    newModifydes,
    newModifyTimeto,
    newModifyTimeFrom,
    newModifyLink,
    newModifyDate
  } = req.body;
  console.log(req.body);
  try {
    if (!newModifydes && !newModifyTimeto && !newModifyTimeFrom && !newModifyDate) {
      return res.status(400).json({
        messaage: "All field are required",
        success: false,
      });
    }
    const task = await Task.findById(_id);
    if (!task) {
      return res.status(400).json({
        messaage: "Task Not Found",
        success: false,
      });
    }
    task.newModifyLink = newModifyLink;
    task.newModifyDes = newModifydes;
    task.newModifyTimeto = newModifyTimeto;
    task.newModifyTimeFrom = newModifyTimeFrom;
    task.newModifyDate = newModifyDate;
    task.isModify = true;
    const modifiedTask = await task.save();
    if (!modifiedTask) {
      return res.status(500).json({
        messaage: "Error while Modifying task",
        success: false,
      });
    }
    return res.status(200).json({
      data: modifiedTask,
      messaage: "Task Modified Successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Internal Server Error",
      success: false,
      error,
    });
  }
};
const updateTaskHandler = async (req, res) => {
  try {
    const {
      _id,
      newUpdatedDes,
      newUpdatedTimeto,
      newUpdatedTimeFrom,
      newUpdateLink,
      newUpdateDate
    } = req.body;
    console.log(req.body);
    if (!newUpdatedDes && !newUpdatedTimeto && !newUpdatedTimeFrom && !newUpdateDate) {
      return res.status(400).json({
        messaage: "All field are required",
        success: false,
      });
    }

    const task = await Task.findById(_id);
    if (!task) {
      return res.status(400).json({
        messaage: "Task Not Found",
        success: false,
      });
    }
    task.newUpdateLink = newUpdateLink;
    task.newUpdatedDes = newUpdatedDes;
    task.newUpdatedTimeto = newUpdatedTimeto;
    task.newUpdatedTimeFrom = newUpdatedTimeFrom;
    task.newUpdateDate = newUpdateDate;
    task.isUpdated = true;
    const updatedTask = await task.save();
    if (!updatedTask) {
      return res.status(500).json({
        messaage: "Error while Upadting task",
        success: false,
      });
    }
    return res.status(200).json({
      data: updatedTask,
      messaage: "Task Updated Successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Internal Server Error",
      success: false,
      error,
    });
  }
};
const taskAdminVerificationHandler = async (req, res) => {
  const { _id } = req.body;

  const verifiedTask = await Task.findByIdAndUpdate(
    _id,
    {
      $set: {
        isVerify: true,
      },
    },
    { new: true }
  );
  if (!verifiedTask) {
    return res.status(500).json({
      messaage: "Error while verifying task by Admin",
      success: false,
    });
  }
  return res.status(200).json({
    data: verifiedTask,
    messaage: "Task verified !!",
    success: true,
  });
}
export {
  createTask,
  getAllTasks,
  getSpecificEmployeeTask,
  taskVerifyHandler,
  taskDelete,
  modifyTaskHandler,
  updateTaskHandler,
  taskAdminVerificationHandler,
};
