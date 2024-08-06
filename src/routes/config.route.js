import { Router} from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { employeeRole, getAllrole } from "../controllers/config.controller.js";
const router = Router();

router.post("/employeeRole", verifyJWT(["admin"]), employeeRole);
router.get("/getAllrole", verifyJWT(["admin"]), getAllrole)


export default router;