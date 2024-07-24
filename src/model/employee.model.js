import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const employeeSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        employeeId: {
            type: String,
            unique: true,
            required: true
        },

        password: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String,
        },
        isAvailable: {
            type: Boolean,
            default: false
        },
        availableTo:{
            type: String,
        },
        availableFrom:{
            type: String,
        },
    },
    {
        timestamps: true
    }
)

employeeSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

employeeSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

employeeSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            employeeId: this.employeeId,
            position: this.position
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
employeeSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const Employee = mongoose.model("Employee", employeeSchema)