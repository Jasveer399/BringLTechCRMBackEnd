
import { createEmployee, getAllEmployee, getEmployeeData, loginEmployee, logoutEmployee, updatePassword } from "../controllers/employee.controller.js";
import { Router} from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", createEmployee);
router.post("/login", loginEmployee)
router.post("/updatepassword",verifyJWT(['employee']),updatePassword),
router.get("/logout", verifyJWT(['employee']), logoutEmployee)
router.get("/getAllEmployee", getAllEmployee)
router.post("/getEmployeeData", verifyJWT(['admin']), getEmployeeData)


export default router;