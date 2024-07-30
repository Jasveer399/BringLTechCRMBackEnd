import { Employee } from "../model/employee.model.js";
import { nanoid } from "nanoid";
import { notifyAdmin, onMailer } from "../utils/mailer.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userid) => {
  try {
    const user = await Employee.findById(userid);
    console.log(user);

    const accessToken = await user.generateAccessToken();
    console.log(accessToken);
    const refreshToken = await user.generateRefreshToken();

    return { accessToken, refreshToken };
  } catch (error) {
    return res.status(400).json({
      messaage: "something went wrong while creating user",
      success: false,
    });
  }
};

const createEmployee = async (req, res) => {
  const { name, position, email, employeeId } = req.body;
  const adminEmail = "jassijas182002@gmail.com"; // Admin's email address

  if (!name || !position || !employeeId || !email) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  const userExists = await Employee.findOne({ employeeId });
  if (userExists) {
    return res.status(400).json({
      message: "Employee id already exists",
      success: false,
    });
  }

  try {
    const password = nanoid(10);
    if (!password) {
      return res.status(500).json({
        message: "Password is not created during employee registration",
        success: false,
      });
    }
    console.log(password);
    const createdUser = await Employee.create({
      name,
      position,
      email,
      employeeId,
      password,
    });
    if (!createdUser) {
      return res.status(500).json({
        message: "Something went wrong while creating user!",
        success: false,
      });
    }
    const employeeMailSent = await onMailer(email, employeeId, password);
    const adminNotified = await notifyAdmin(adminEmail, createdUser);
    return res.status(200).json({
      message: "Employee created",
      data: createdUser,
      password: password,
      success: true,
      employeeMail: employeeMailSent
        ? "Mail sent successfully to employee"
        : "Could not send email to employee!",
      adminNotification: adminNotified
        ? "Admin notified successfully"
        : "Could not notify admin!",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while creating employee",
      error: error.message,
      success: false,
    });
  }
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const id = req.user?._id;
  if (!oldPassword && !newPassword) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }
  try {
    const user = await Employee.findById(id);
    if (!user) {
      return res.status(400).json({
        messaage: "Invalid credentials",
        success: false,
      });
    }

    console.log(user);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      return res.json({
        status: 400,
        message: "Wrong Password",
        success: false,
      });
    }

    // console.log(isPasswordCorrect);
    user.password = newPassword;
    user.ispasswordupdated = true;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      messaage: "Password Update Successfully !!",
      data: user.ispasswordupdated,
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      messaage: "Something went wrong while Updating Password",
      success: false,
    });
  }
};

const loginEmployee = async (req, res) => {
  const { employeeId, password } = req.body;
  if (!employeeId || !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }
  try {
    const user = await Employee.findOne({ employeeId });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Wrong Password",
        success: false,
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const now = new Date();
    const formattedLoginTimestamp = formatDate(now);

    const newAvailability = {
      availableFrom: formattedLoginTimestamp,
      owner: "Employee",
      isAvailable: true,
    };

    const aev = user.availability.push(newAvailability);
    user.refreshToken = refreshToken;
    await user.save();

    const loggedInUser = await Employee.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        data: loggedInUser,
        accessToken,
        message: "Logged In Successfully!",
        success: true,
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Something went wrong while logging in user",
      success: false,
    });
  }
};
const logoutEmployee = async (req, res) => {
  const { id } = req.query;
  try {
    const user = await Employee.findById(req.user?._id);
    const now = new Date();
    const formattedLoginTimestamp = formatDate(now);

    console.log(id);
    const agg = await Employee.aggregate([
      {
        $match: {
          _id: user._id,
        },
      },
      {
        $unwind: "$availability",
      },
      {
        $match: {
          "availability._id": new mongoose.Types.ObjectId(id),
        },
      },
      {
        $set: {
          "availability.availableTo": formattedLoginTimestamp,
        },
      },
    ]);
    console.log(agg);
    const options = {
      httpOnly: true,
      secure: false,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        messaage: "Epmloyee Logged Out Successfully",
        success: true,
      });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error While Epmloyee Logged Out",
      success: false,
      error: error,
    });
  }
};
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedTime = `${hours}:${minutes}${ampm}`;

  return `${day}-${month}-${year},${formattedTime}`;
}

const getAllEmployee = async (req, res) => {
  const AllEmployee = await Employee.find({});

  if (!AllEmployee) {
    return res.status(500).json({
      messaage: "Error while getting all task",
      success: false,
    });
  }

  return res.status(200).json({
    messaage: "Task fetched !!",
    data: AllEmployee,
    success: true,
  });
};

const getEmployeeData = async (req, res) => {
  let id;
  if (req.body._id) {
    id = new mongoose.Types.ObjectId(req.body._id);
  } else if (req.user?._id) {
    id = req.user?._id;
  }
  try {
    const employee = await Employee.findById(id).select(
      "-password -refreshToken"
    );

    if (!employee) {
      return res.status(400).json({
        messaage: "Employee not found",
        success: false,
      });
    }

    return res.status(200).json({
      data: employee,
      messaage: "Employee fetched !!",
      success: true,
    });
  } catch (error) {
    return res.status(200).json({
      messaage: "error while getting Employee data !!",
      success: false,
    });
  }
};

const getSpecificEmployeeTasks = async (req, res) => {
  const { _id } = req.body;
  let id;
  if (req.body._id) {
    id = req.body._id;
  } else if (req.user?._id) {
    id = req.user?._id;
  }
  console.log(id);

  try {
    const employee = await Employee.findById({ id });

    if (!employee) {
      return res.status(400).json({
        messaage: "employee not found",
        success: false,
      });
    }

    const tasks = employee.tasks;

    return res.status(500).json({
      data: tasks,
      messaage: "tasks fetched !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "something went wrong while fetching tasks",
      success: false,
    });
  }
};

const getCurrentEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user?._id).select(
      "-password -refreshToken"
    );

    if (!employee) {
      return res.status(400).json({
        messaage: "Employee Not Found !!",
        success: false,
      });
    }

    return res.status(200).json({
      data: employee,
      messaage: "Employee fetched !!",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error while fetching employee !!",
      success: false,
    });
  }
};

export {
  createEmployee,
  loginEmployee,
  logoutEmployee,
  getAllEmployee,
  updatePassword,
  getEmployeeData,
  getSpecificEmployeeTasks,
  getCurrentEmployee,
};
