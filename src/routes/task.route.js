import { createTask, getAllTasks } from "../controllers/task.controller.js";
import { Router } from "express";
import { adminVerifyJWT, employeeVerifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/", adminVerifyJWT, employeeVerifyJWT, createTask)
router.get("/getAllTasks", getAllTasks)

export default router