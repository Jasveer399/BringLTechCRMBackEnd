import { Router} from "express";
import { adminlogin, createAdmin, logoutAdmin } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/",createAdmin);
router.post("/login",adminlogin);
router.get("/logout", verifyJWT(['admin']), logoutAdmin)


export default router;