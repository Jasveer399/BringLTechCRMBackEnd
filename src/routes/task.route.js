import { createTask, getAllTasks, getSpecificEmployeeTask, taskDelete, taskVerifyHandler } from "../controllers/task.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/", verifyJWT(['admin', 'employee']), createTask)
router.get("/getAllTasks",verifyJWT(['admin']), getAllTasks)
router.post("/getemployeetasks",verifyJWT(['admin', 'employee']), getSpecificEmployeeTask)
router.post("/verifytask", verifyJWT(['employee']), taskVerifyHandler)
router.delete("/deleteTask",verifyJWT(['admin', 'employee']),taskDelete)

export default router