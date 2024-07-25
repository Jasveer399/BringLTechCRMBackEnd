import { Employee } from "../model/employee.model.js";
import { nanoid } from "nanoid";

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
  if (!name && !position && !employeeId && !email) {
    return res.status(400).json({
      messaage: "all fields are required",
      success: false,
    });
  }
  const userExists = await Employee.findOne({ employeeId });
  if (userExists) {
    return res.status(400).json({
      messaage: "Employee id already exists",
      success: false,
    });
  }
  try {
    const password = nanoid(10);
    if (!password) {
      return res.status(500).json({
        messaage: "Passsword is Not Created During Employee Registeration",
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
        messaage: "Something went wrong while creating user !!",
        success: false,
      });
    }
    return res.status(200).json({
      messaage: "Employee created",
      data: createdUser,
      password: password,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error while creating employee",
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

    console.log(isPasswordCorrect);
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      messaage: "Password Update Successfully !!",
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

const logoutEmployee = async (req, res) => {
  await Employee.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
      messaage: "User Logged Out Successfully",
      success: true,
    });
};

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
  const { _id } = req.body;

  const employee = await Employee.findById({ _id }).select(
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
};

export {
  createEmployee,
  loginEmployee,
  logoutEmployee,
  getAllEmployee,
  updatePassword,
  getEmployeeData,
};
