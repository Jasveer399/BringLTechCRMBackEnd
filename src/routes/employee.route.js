import {
  createEmployee,
  getAllEmployee,
  getCurrentEmployee,
  getEmployeeData,
  getSpecificEmployeeData,
  getSpecificEmployeeTasks,
  loginEmployee,
  logoutEmployee,
  updatePassword,
} from "../controllers/employee.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", createEmployee);
router.post("/login", loginEmployee);
router.post("/updatepassword", verifyJWT(["employee"]), updatePassword),
  router.post("/getAllEmployee", getAllEmployee);
router.post(
  "/getEmployeeData",
  verifyJWT(["admin", "employee"]),
  getEmployeeData
);
router.post(
  "/getSpecificEmployeeTasks",
  verifyJWT(["admin"]),
  getSpecificEmployeeTasks
);
router.post("/login", loginEmployee);
router.post("/updatepassword", verifyJWT(["employee"]), updatePassword),
  router.get("/getAllEmployee", getAllEmployee);
router.get("/logout", verifyJWT(["employee"]), logoutEmployee);
router.get("/getCurrentEmployee", verifyJWT(["employee"]), getCurrentEmployee);
router.post("/getSpecificEmployeeData",getSpecificEmployeeData)

export default router;
