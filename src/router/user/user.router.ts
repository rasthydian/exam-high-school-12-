import { Router } from "express";
import { login, register } from "../../controller/user/userController";
import { registerValidation, loginValidation } from "../../validation/user/user.validation";
import { validateRequest } from "../../middleware/validation";
import { verifyToken } from "../../config/authorization";
const router = Router();

router.post("/register", validateRequest(registerValidation), register);
router.post("/login", validateRequest(loginValidation), login);
export default router;