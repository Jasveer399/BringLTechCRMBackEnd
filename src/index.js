import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/dbconnect.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Your React app's URL
  credentials: true
}));
app.use(cookieParser())
app.use(express.urlencoded({
  extended: true,
  limit: "16kb"
}))

connectDB();

import adminrouter from "./routes/admin.route.js";
import employeeRouter from "./routes/employee.route.js";

app.use("/admin", adminrouter);
app.use("/employee", employeeRouter)

app.listen(3000, () =>
  console.log("Server listening on http://localhost on port 3000")
);
