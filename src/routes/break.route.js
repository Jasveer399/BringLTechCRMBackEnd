import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { breakSetter, setEndTime } from "../controllers/break.controller.js";

const router = Router();

router.post("/", verifyJWT(['employee']), breakSetter)
router.post("/setEndTime", verifyJWT(['employee']), setEndTime)

export default router;