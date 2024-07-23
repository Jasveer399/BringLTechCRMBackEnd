import { Router} from "express";
import { adminlogin, createAdmin } from "../controllers/admin.controller.js";

const router = Router();

router.post("/",createAdmin);
router.post("/login",adminlogin);


export default router;