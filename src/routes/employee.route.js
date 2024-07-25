import { createEmployee, getAllEmployee, loginEmployee, logoutEmployee, updatePassword } from "../controllers/employee.controller.js";
import { Router} from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", createEmployee);
router.post("/login", loginEmployee)
router.post("/updatepassword",verifyJWT(['employee']),updatePassword),
router.get("/logout", verifyJWT(['employee']), logoutEmployee)
router.get("/getAllEmployee", getAllEmployee)


export default router;