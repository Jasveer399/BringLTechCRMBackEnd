import { Employee } from "../model/employee.model.js";
import { nanoid } from "nanoid";
import { notifyAdmin, onMailer } from "../utils/mailer.js";
import mongoose from "mongoose";
import { uploadFileonCloudinary } from "../utils/cloudinary.js";
import fs from "fs"  

const generateAccessAndRefreshToken = async (userid) => {
  try {
    const user = await Employee.findById(userid);
    const accessToken = await user.generateAccessToken();
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
    const today = now;
    const todayAvailabilityIndex = user.availability.findIndex((entry) => {
      const entryDate = parseCustomDate(entry.availableFrom);
      return (
        entryDate.getDate() === today.getDate() &&
        entryDate.getMonth() === today.getMonth() &&
        entryDate.getFullYear() === today.getFullYear()
      );
    });

    if (todayAvailabilityIndex !== -1) {
      user.availability[todayAvailabilityIndex].isAvailable = true;
    } else {
      const newAvailability = {
        availableFrom: formattedLoginTimestamp,
        owner: "Employee",
        isAvailable: true,
      };
      user.availability.push(newAvailability);
    }

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
    console.error("Error in loginEmployee:", error);
    return res.status(500).json({
      message: "Something went wrong while logging in user",
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
function parseCustomDate(dateString) {
  const [datePart, timePart] = dateString.split(",");
  const [day, month, year] = datePart.split("-");
  const [time, ampm] = timePart.split(/(?=[ap]m)/i);
  const [hours, minutes] = time.split(":");

  let parsedHours = parseInt(hours);
  if (ampm.toLowerCase() === "pm" && parsedHours !== 12) {
    parsedHours += 12;
  } else if (ampm.toLowerCase() === "am" && parsedHours === 12) {
    parsedHours = 0;
  }

  return new Date(year, month - 1, day, parsedHours, parseInt(minutes));
}
const logoutEmployee = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({
      message: "All fields are required",
      success: false,
    });
  }
  console.log("Req Body", req.body);

  try {
    const user = await Employee.findById(req.user?._id);
    const now = new Date();
    const formattedLoginTimestamp = formatDate(now);

    // Update the specific availability entry
    const updatedUser = await Employee.findOneAndUpdate(
      {
        _id: user._id,
        "availability._id": new mongoose.Types.ObjectId(id),
      },
      {
        $set: {
          "availability.$.availableTo": formattedLoginTimestamp,
          "availability.$.isAvailable": false,
        },
      },
      { new: true }
    );
    console.log("updatedUser =>", updatedUser);

    if (!updatedUser) {
      return res.status(404).json({
        message: "User or availability entry not found",
        success: false,
      });
    }

    console.log("Updated User", updatedUser);

    const options = {
      httpOnly: true,
      secure: false,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        message: "Employee Logged Out Successfully",
        success: true,
        data: updatedUser,
      });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      message: "Error While Employee Logged Out",
      success: false,
      error: error.message,
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
  const { year, month } = req.body; // Assuming year and month are provided as query parameters

  try {
    const pipeline = [
      {
        $addFields: {
          availabilityArray: {
            $cond: {
              if: { $isArray: "$availability" },
              then: "$availability",
              else: [],
            },
          },
        },
      },
      {
        $unwind: {
          path: "$availabilityArray",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          parsedDate: {
            $cond: {
              if: { $ne: ["$availabilityArray", undefined] },
              then: {
                $dateFromParts: {
                  year: {
                    $toInt: {
                      $arrayElemAt: [
                        {
                          $split: [
                            {
                              $arrayElemAt: [
                                {
                                  $split: [
                                    "$availabilityArray.availableFrom",
                                    ",",
                                  ],
                                },
                                0,
                              ],
                            },
                            "-",
                          ],
                        },
                        2,
                      ],
                    },
                  },
                  month: {
                    $toInt: {
                      $arrayElemAt: [
                        {
                          $split: [
                            {
                              $arrayElemAt: [
                                {
                                  $split: [
                                    "$availabilityArray.availableFrom",
                                    ",",
                                  ],
                                },
                                0,
                              ],
                            },
                            "-",
                          ],
                        },
                        1,
                      ],
                    },
                  },
                  day: {
                    $toInt: {
                      $arrayElemAt: [
                        {
                          $split: [
                            {
                              $arrayElemAt: [
                                {
                                  $split: [
                                    "$availabilityArray.availableFrom",
                                    ",",
                                  ],
                                },
                                0,
                              ],
                            },
                            "-",
                          ],
                        },
                        0,
                      ],
                    },
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          employee: { $first: "$$ROOT" },
          loginCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$parsedDate", null] },
                    { $eq: [{ $year: "$parsedDate" }, parseInt(year)] },
                    { $eq: [{ $month: "$parsedDate" }, parseInt(month)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          employee: {
            $mergeObjects: [
              {
                $arrayToObject: {
                  $filter: {
                    input: { $objectToArray: "$employee" },
                    cond: { $ne: ["$$this.k", "availabilityArray"] },
                  },
                },
              },
              { loginCount: "$loginCount" },
            ],
          },
        },
      },
    ];

    const allEmployees = await Employee.aggregate(pipeline);

    if (!allEmployees || allEmployees.length === 0) {
      return res.status(404).json({
        message: "No employees found",
        success: false,
      });
    }

    // Remove sensitive information
    const sanitizedEmployees = allEmployees.map(({ employee }) => {
      const { password, refreshToken, ...sanitizedEmployee } = employee;
      return sanitizedEmployee;
    });

    return res.status(200).json({
      message: "All Employees fetched with login counts!",
      data: sanitizedEmployees,
      count: sanitizedEmployees.length,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong while fetching all employees",
      success: false,
    });
  }
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
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  try {
    const pipeline = [
      {
        $match: {
          _id: req.user?._id,
        },
      },
      {
        $addFields: {
          availabilityArray: {
            $cond: {
              if: { $isArray: "$availability" },
              then: "$availability",
              else: [],
            },
          },
        },
      },
      {
        $unwind: {
          path: "$availabilityArray",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          parsedDate: {
            $cond: {
              if: { $ne: ["$availabilityArray", undefined] },
              then: {
                $dateFromParts: {
                  year: {
                    $toInt: {
                      $arrayElemAt: [
                        {
                          $split: [
                            {
                              $arrayElemAt: [
                                {
                                  $split: [
                                    "$availabilityArray.availableFrom",
                                    ",",
                                  ],
                                },
                                0,
                              ],
                            },
                            "-",
                          ],
                        },
                        2,
                      ],
                    },
                  },
                  month: {
                    $toInt: {
                      $arrayElemAt: [
                        {
                          $split: [
                            {
                              $arrayElemAt: [
                                {
                                  $split: [
                                    "$availabilityArray.availableFrom",
                                    ",",
                                  ],
                                },
                                0,
                              ],
                            },
                            "-",
                          ],
                        },
                        1,
                      ],
                    },
                  },
                  day: {
                    $toInt: {
                      $arrayElemAt: [
                        {
                          $split: [
                            {
                              $arrayElemAt: [
                                {
                                  $split: [
                                    "$availabilityArray.availableFrom",
                                    ",",
                                  ],
                                },
                                0,
                              ],
                            },
                            "-",
                          ],
                        },
                        0,
                      ],
                    },
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          employee: { $first: "$$ROOT" },
          loginCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$parsedDate", null] },
                    { $eq: [{ $year: "$parsedDate" }, parseInt(year)] },
                    { $eq: [{ $month: "$parsedDate" }, parseInt(month)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          employee: {
            $mergeObjects: [
              {
                $arrayToObject: {
                  $filter: {
                    input: { $objectToArray: "$employee" },
                    cond: { $ne: ["$$this.k", "availabilityArray"] },
                  },
                },
              },
              { loginCount: "$loginCount" },
            ],
          },
        },
      },
    ];

    const employee = await Employee.aggregate(pipeline);

    if (!employee) {
      return res.status(404).json({
        message: "No employees found",
        success: false,
      });
    }

    // Remove sensitive information
    const sanitizedEmployees = employee.map(({ employee }) => {
      const { password, refreshToken, ...sanitizedEmployee } = employee;
      return sanitizedEmployee;
    });

    console.log("sanitizedEmployees: ", sanitizedEmployees);

    return res.status(200).json({
      message: "All Employees fetched with login counts!",
      data: sanitizedEmployees[0],
      count: sanitizedEmployees.length,
      success: true,
    });

    // const employee = await Employee.findById(req.user?._id).select(
    //   "-password -refreshToken"
    // );

    // if (!employee) {
    //   return res.status(400).json({
    //     messaage: "Employee Not Found !!",
    //     success: false,
    //   });
    // }

    // return res.status(200).json({
    //   data: employee,
    //   messaage: "Employee fetched !!",
    //   success: true,
    // });
  } catch (error) {
    return res.status(500).json({
      messaage: "Error while fetching employee !!",
      success: false,
    });
  }
};
const getSpecificEmployeeData = async (req, res) => {
  const { id } = req.body;
  console.log("Req Body", req.body);
  if (!id) {
    return res.status(400).json({
      messaage: "Employee ID is required",
      success: false,
    });
  }
  try {
    const employee = await Employee.findById(id).select(
      "-password -refreshToken"
    );
    if (!employee) {
      return res.status(400).json({
        messaage: "Employee Not Found!!",
        success: false,
      });
    }

    return res.status(200).json({
      data: employee,
      messaage: "Employee fetched!!",
      success: true,
    });
  } catch (error) {}
};
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  console.log("Uploading image =>", req.file);
  
  if (!fs.existsSync(req.file.path)) {
    return res.status(400).json({ error: "File does not exist at the specified path" });
  }
  try {
    console.log("Image Path =>", req.file.path);
    const result = await uploadFileonCloudinary(req.file.path);
    console.log("Result =>", result);
    if (result && result.url) {
      res.json({ url: result.url });
    } else {
      throw new Error("Failed to upload image to Cloudinary");
    }
  } catch (error) {
    console.error("Error in image upload:", error);
    res.status(500).json({ error: "Failed to upload image", details: error.message });
  }
};
const updateEmployee = async (req, res) => {
  const {profile}= req.body;
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.user?._id,
      { $set: {
        name:profile.firstName,
        email:profile.email,
        phoneNo:profile.phone,
        address:profile.address,
        gender:profile.gender,
        dob:profile.dateOfBirth,
        twitter:profile.twitter,
        linkedIn:profile.linkedIn,
        profileImageUrl:profile.profileImageUrl,
      } },
      { new: true }
    ).select("-password -refreshToken");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.status(200).json({
      message: "Employee updated successfully",
      employee,
      success: true,
    });
  } catch (error) {
    console.error("Error in updating employee:", error);
    res.status(500).json({ message: "Failed to update employee", details: error.message });
  }
}
export {
  createEmployee,
  loginEmployee,
  logoutEmployee,
  getAllEmployee,
  updatePassword,
  getEmployeeData,
  getSpecificEmployeeTasks,
  getCurrentEmployee,
  getSpecificEmployeeData,
  uploadImage,
  updateEmployee,
};
