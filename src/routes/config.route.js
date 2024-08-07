import { Router} from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { deleteRole, editRole, employeeRole, getAllrole } from "../controllers/config.controller.js";
const router = Router();

router.post("/employeeRole", verifyJWT(["admin"]), employeeRole);
router.get("/getAllrole", verifyJWT(["admin"]), getAllrole)
router.post("/deleteRole", verifyJWT(["admin"]), deleteRole)
router.post("/editRole", verifyJWT(["admin"]), editRole)


export default router;