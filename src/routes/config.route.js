import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  addHolidays,
  employeeRole,
  getAllrole,
  getHolidays,
} from "../controllers/config.controller.js";
const router = Router();

router.post("/employeeRole", verifyJWT(["admin"]), employeeRole);
router.get("/getAllrole", verifyJWT(["admin"]), getAllrole);
router.post("/addholidy", verifyJWT(["admin"]), addHolidays);
router.post("/getholiday", verifyJWT(["admin"]), getHolidays);
export default router;
