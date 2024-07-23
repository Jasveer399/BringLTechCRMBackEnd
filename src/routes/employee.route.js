import { createEmployee, loginEmployee, logoutEmployee } from "../controllers/employee.controller.js";
import { Router} from "express";
import { employeeVerifyJWT } from "../middleware/auth.middleware.js"

const router = Router();

router.post("/createemployee", createEmployee);
router.post("/loginemployee", loginEmployee)
router.get("/logoutemployee", employeeVerifyJWT, logoutEmployee)

export default router;