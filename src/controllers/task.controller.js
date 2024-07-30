import { Employee } from "../model/employee.model.js";
import { Task } from "../model/task.model.js";
import mongoose from "mongoose";

const createTask = async (req, res) => {
  const { title, description, link, timeFrom, timeTo, employeeId } = req.body;
  if (!title && !description && !timeFrom && !timeTo) {
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
      createdBy: req.role,
      assignedTo: employeeId,
    });

    console.log(createdTask);

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
    success: true,
  });
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

  console.log(user);

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

  console.log(tasks);

  return res.status(200).json({
    data: tasks,
    messaage: "Tasks fetched",
    success: true,
  });
};

const taskVerifyHandler = async (req, res) => {
  const { _id } = req.body;

  const verifiedTask = await Task.findByIdAndUpdate(
    _id,
    {
      $set: {
        completion: true,
      },
    },
    { new: true }
  );

  console.log(verifiedTask);

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

export {
  createTask,
  getAllTasks,
  getSpecificEmployeeTask,
  taskVerifyHandler,
  taskDelete,
};
