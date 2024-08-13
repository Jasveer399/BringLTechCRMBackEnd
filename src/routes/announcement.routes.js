import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  addHolidays,
  deleteHoliday,
  deleteRole,
  editRole,
  employeeRole,
  getAllrole,
  getHolidays,
} from "../controllers/config.controller.js";
import {
  createAnnouncement,
  getAllAnnouncements,
} from "../controllers/announcement.controller.js";
const router = Router();
router.post(
  "/send",
  verifyJWT(["admin"]),
  createAnnouncement
);
router.post(
  "/getallannouncement",
  verifyJWT(["admin", "employee"]),
  getAllAnnouncements
);
router.post("/addholidy", verifyJWT(["admin"]), addHolidays);
router.post("/getholiday", verifyJWT(["admin"]), getHolidays);
router.post("/deleteRole", verifyJWT(["admin"]), deleteRole);
router.post("/editRole", verifyJWT(["admin"]), editRole);
router.delete("/deleteHoliday", verifyJWT(["admin"]), deleteHoliday);

export default router;
