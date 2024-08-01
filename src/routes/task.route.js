import {
  createTask,
  getAllTasks,
  getSpecificEmployeeTask,
  getTodayTasks,
  modifyTaskHandler,
  taskAdminVerificationHandler,
  taskDelete,
  taskVerifyHandler,
  updateTaskHandler,
} from "../controllers/task.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT(["admin", "employee"]), createTask);
router.get("/getAllTasks", verifyJWT(["admin"]), getAllTasks);
router.post(
  "/getemployeetasks",
  verifyJWT(["admin", "employee"]),
  getSpecificEmployeeTask
);
router.post("/verifytask", verifyJWT(["employee"]), taskVerifyHandler);
router.post("/deleteTask", verifyJWT(["admin", "employee"]), taskDelete);
router.patch("/modifytask", verifyJWT(["admin"]), modifyTaskHandler);
router.patch("/updatetask", verifyJWT(["admin"]), updateTaskHandler);
router.patch(
  "/adminVerificationtask",
  verifyJWT(["admin"]),
  taskAdminVerificationHandler
);
router.post("/gettodaytask", verifyJWT(["admin"]), getTodayTasks);
export default router;
