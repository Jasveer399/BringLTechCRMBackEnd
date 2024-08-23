import {
  addSalary,
  changeNewPassword,
  checkSalary,
  createEmployee,
  deleteEmployee,
  editSalary,
  getAllEmployee,
  getCurrentEmployee,
  getEmployeeData,
  getEmployeeRatings,
  getEmployeeSalary,
  getSpecificEmployeeData,
  getSpecificEmployeeTasks,
  loginEmployee,
  logoutEmployee,
  updateEmployee,
  updatePassword,
  uploadImage,
} from "../controllers/employee.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import multer from "multer";
const router = Router();
const upload = multer({ dest: 'uploads/' });

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
router.post("/logout", verifyJWT(["employee"]), logoutEmployee);
router.get("/getCurrentEmployee", verifyJWT(["employee", "admin"]), getCurrentEmployee);
router.post("/getSpecificEmployeeData",getSpecificEmployeeData);
router.post('/upload-image', upload.single('image'),uploadImage);
router.post("/updateEmployee", verifyJWT(["employee"]), updateEmployee)
router.post("/changeNewPassword", verifyJWT(["employee"]), changeNewPassword)
router.get("/getEmployeeRatings", verifyJWT(["admin"]), getEmployeeRatings)
router.post("/deleteEmployee", verifyJWT(["admin"]), deleteEmployee)
router.post("/checksalary", verifyJWT(["employee"]),checkSalary)
router.post("/addSalary", verifyJWT(["employee", "admin"]),addSalary)
router.post("/editSalary", verifyJWT(["employee", "admin"]),editSalary)
router.post("/getEmployeeSalary", verifyJWT(["employee", "admin"]),getEmployeeSalary)

export default router;
