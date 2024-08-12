import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createLeave, fetchLeaveOfSpecificemployee } from "../controllers/leave.controller.js";

const router = Router();

router.post("/", verifyJWT(["admin"]), createLeave);
router.post("/fetchLeaveOfSpecificemployee", verifyJWT(["admin"]), fetchLeaveOfSpecificemployee);

export default router;