import { Router } from "express";
import { register } from "../controller/userController";
import { registerValidation } from "../validation/user.validation";
import { validateRequest } from "../middleware/validation";
import { verifyToken } from "../config/authorization";
const router = Router();

router.post("/register", validateRequest(registerValidation), register);

export default router;