import { Admin } from "../model/admin.model.js";

const generateAccessAndRefreshToken = async (userid) => {
  try {
    const user = await Admin.findById(userid);
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
const createAdmin = async (req, res) => {
  const { username, email, password,adminType} = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const exitadmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });
    if (exitadmin) {
      return res.status(400).json({
        status: 400,
        message: "Username or Email already exists",
        success: false,
      });
    }
    const admin = await Admin.create({
      username,
      email,
      password,
      adminType,
    });

    return res
      .status(200)
      .json({
        status:200,
        message:"Admin Create SuccessFully",
        success:true,
      });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      success: false,
    });
  }
};
const adminlogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await Admin.findById(user._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: false,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        data: loggedInUser,
        adminType:loggedInUser.adminType,
        success: true,
        accessToken:accessToken,
        refreshToken: refreshToken,
        messaage: "Logged In Successfully !!",
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Internal Error", error });
  }
};
const logoutAdmin = async (req, res) => {
  await Admin.findByIdAndUpdate(
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
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
      message: "Admin Logged Out Successfully",
      success: true,
    });
}
const getallAdmin = async (req, res) =>{
   try {
       const admins = await Admin.find({});
       const count = admins.length;
       return res.status(200).json({
         data: admins,
         count: count,
         success: true,
       });
   } catch (error) {
     return res.status(500).json({
       messaage: "Internal Server Error",
       success: false,
       error,
     });
   }
}
export { createAdmin, adminlogin,logoutAdmin,getallAdmin};
