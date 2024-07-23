import { Router} from "express";
import { adminlogin, createAdmin, logoutAdmin } from "../controllers/admin.controller.js";

const router = Router();

router.post("/",createAdmin);
router.post("/login",adminlogin);
router.get("/logout",logoutAdmin)


export default router;