import { createEmployee, loginEmployee, logoutEmployee } from "../controllers/employee.controller.js";
import { Router} from "express";
import { employeeVerifyJWT } from "../middleware/auth.middleware.js"

const router = Router();

router.post("/", createEmployee);
router.post("/login", loginEmployee)
router.get("/logout", employeeVerifyJWT, logoutEmployee)

export default router;