import { createTask, getAllTasks } from "../controllers/task.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/", verifyJWT(['admin', 'employee']), createTask)
router.get("/getAllTasks",verifyJWT(['admin']), getAllTasks)

export default router