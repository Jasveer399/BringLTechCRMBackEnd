import jwt from "jsonwebtoken"
import { Employee } from "../model/employee.model.js";
import { Admin } from "../model/admin.model.js";

export const adminVerifyJWT = async(req, res, next) => {
    console.log(req.header('Authorization'))
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")

        if (!token) {
            return res.status(400).json({
                message: "Unauthorized request !!",
                success: false,
            })
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken")

        if (!admin) {
            return res.status(400).json({
                message: "Access Token not found",
                success: false,
            })
        }

        req.admin = admin
        next()

    } catch (error) {
        return res.status(400).json({
            message: "Invalid access token",
            success: false,
        })
    }
}

export const employeeVerifyJWT = async(req, res, next) => {
    console.log(req.header('Authorization'))
    console.log(req.cookies?.accessToken)
    try {
        const token = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ", "")

        if (!token) {
            return res.status(400).json({
                message: "Unauthorized request !!",
                success: false,
            })
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await Employee.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            return res.status(400).json({
                message: "Access Token not found",
                success: false,
            })
        }

        req.user = user
        next()

    } catch (error) {
        return res.status(400).json({
            message: "Invalid access token",
            success: false,
        })
    }
}