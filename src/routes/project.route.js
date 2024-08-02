import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createProject, deleteProject, getAllProjects } from "../controllers/project.controller.js";

const router = Router();

router.post("/", verifyJWT(['admin']), createProject)
router.get("/getAllProjects", verifyJWT(['admin']), getAllProjects)
router.post("/deleteProject", verifyJWT(['admin']), deleteProject)

export default router;