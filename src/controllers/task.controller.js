import { Task } from "../model/task.model.js";

const createTask = async (req, res) => {
    const { title, description, link, timeFrom, timeTo, createdBy } = req.body;
    console.log(req.body)
    
    if (!title && !description && !timeFrom && !timeTo && !createdBy) {
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
        createdBy
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

  const getAllTasks = async(req, res) => {
    const allTasks = await Task.find({})

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
  }

  export {
    createTask,
    getAllTasks
  }
  