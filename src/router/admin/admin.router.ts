import { Router } from "express";
import { createStan, getAllStan, getStanById, updateStan, deleteStan } from "../../controller/admin/adminController";
import { createStanValidation, updateStanValidation } from "../../validation/admin/stan.validation";
import { validateRequest } from "../../middleware/validation";
import { verifyToken, verifyAdminStan } from "../../config/authorization";
import { verifyStanOwnership } from "../../middleware/stanOwnership";

const router = Router();

// Protected routes - require JWT token and admin_stan role
router.post("/stan", verifyToken, verifyAdminStan, validateRequest(createStanValidation), createStan);
router.get("/stan", getAllStan); // Public - semua bisa lihat daftar stan
router.get("/stan/:id", getStanById); // Public - semua bisa lihat detail stan
router.put("/stan/:id", verifyToken, verifyAdminStan, verifyStanOwnership, validateRequest(updateStanValidation), updateStan);
router.delete("/stan/:id", verifyToken, verifyAdminStan, verifyStanOwnership, deleteStan);

export default router;
