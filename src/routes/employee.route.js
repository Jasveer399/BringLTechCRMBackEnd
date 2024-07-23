import { createEmployee, loginEmployee } from "../controllers/employee.controller.js";
import { Router} from "express";

const router = Router();

router.post("/createemployee", createEmployee);
router.post("/loginemployee", loginEmployee)

export default router;