import {
  createEmployee,
  getAllEmployee,
  getCurrentEmployee,
  getEmployeeData,
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
  router.get("/getAllEmployee", getAllEmployee);
router.post("/getEmployeeData", verifyJWT(['admin', 'employee']), getEmployeeData);
router.post(
  "/getSpecificEmployeeTasks",
  verifyJWT(["admin"]),
  getSpecificEmployeeTasks
);
router.post("/login", loginEmployee);
router.post("/updatepassword", verifyJWT(["employee"]), updatePassword),
  router.get("/getAllEmployee", getAllEmployee);
router.get("/logout", verifyJWT(["employee"]), logoutEmployee);
router.get("/getCurrentEmployee", verifyJWT(['employee']), getCurrentEmployee)

export default router;
