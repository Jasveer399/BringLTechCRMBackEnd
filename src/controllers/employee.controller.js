import { Employee } from "../model/employee.model.js";
import jwt from "jsonwebtoken";

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
  const { name, position, email, employeeId, password } = req.body;
  console.log(req.body)

  if (!name && !position && !employeeId && !password && !email) {
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
    console.log("hi")
    const createdUser = await Employee.create({
      name,
      position,
      email,
      employeeId,
      password
    });
    console.log("hi 2")

    if (!createdUser) {
      return res.status(500).json({
        messaage: "Something went wrong while creating user !!",
        success: false,
      });
    }
    console.log("hi3")


    return res.status(200).json({
      messaage: "Employee created",
      data: createdUser,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error while creating employee",
      success: false,
    });
  }
};

const loginEmployee = async (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId && !password) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }

  try {
    const user = await Employee.findOne({ employeeId });
  
    if (!user) {
      return res.status(400).json({
        messaage: "Invalid credentials",
        success: false,
      });
    }

    console.log(user)
  
    const isPasswordCorrect = await user.isPasswordCorrect(password);
  
    if (!isPasswordCorrect) {
      return res.json({
        status: 400,
        message: "Wrong Password",
        success: false,
      });
    }

    console.log(isPasswordCorrect)
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
  
    const loggedInUser = await Employee.findById(user._id).select(
      "-password -refreshToken"
    );
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
          {
            data: loggedInUser,
            refreshToken: refreshToken,
            messaage: "Logged In Successfully !!",
            success: true,
          },
        )
  } catch (error) {
    return res.status(400).json({
        messaage: "Something went wrong while loggin user",
        success: false
    })
  }
};

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
  }

export { createEmployee, loginEmployee, logoutEmployee };
