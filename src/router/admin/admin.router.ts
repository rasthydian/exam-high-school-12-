import { Router } from "express";
import { 
    createStan, 
    getAllStan, 
    getStanById, 
    updateStan, 
    deleteStan
} from "../../controller/admin/AdminStanController";
import {
    createMenu,
    getAllMenu,
    getMenuByStan,
    getMenuById,
    updateMenu,
    deleteMenu
} from "../../controller/admin/AdminMenuController";
import {
    createDiskon,
    createDiskonPerMenu,
    getAllDiskon,
    getDiskonById,
    updateDiskon,
    deleteDiskon,
    assignDiskonToMenu,
    removeDiskonFromMenu,
    getActiveDiskon
} from "../../controller/admin/AdminDiskonController";
import {
    getOrdersForStan,
    getOrderByIdForStan,
    updateOrderStatus,
    getMonthlyIncomeRecap
} from "../../controller/admin/AdminOrderController";
import { createStanValidation, updateStanValidation } from "../../validation/admin/stan.validation";
import { createMenuValidation, updateMenuValidation } from "../../validation/admin/menu.validation";
import { createDiskonValidation, updateDiskonValidation, assignDiskonValidation, createDiskonPerMenuValidation } from "../../validation/admin/diskon.validation";
import { updateOrderStatusValidation } from "../../validation/admin/order.validation";
import { validateRequest } from "../../middleware/validation";
import { verifyToken, verifyAdminStan } from "../../config/authorization";
import { verifyStanOwnership } from "../../middleware/stanOwnership";
import { upload } from "../../config/upload";

const router = Router();

// Stan routes
router.post("/stan", verifyToken, verifyAdminStan, validateRequest(createStanValidation), createStan);
router.get("/stan", getAllStan);
router.get("/stan/:id", getStanById);
router.put("/stan/:id", verifyToken, verifyAdminStan, verifyStanOwnership, validateRequest(updateStanValidation), updateStan);
router.delete("/stan/:id", verifyToken, verifyAdminStan, verifyStanOwnership, deleteStan);

// Menu routes (Food & Drink)
router.post("/menu", verifyToken, verifyAdminStan, upload.single('foto'), validateRequest(createMenuValidation), createMenu);
router.get("/menu", getAllMenu);
router.get("/menu/my-stan", verifyToken, verifyAdminStan, getMenuByStan);
router.get("/menu/:id", getMenuById);
router.put("/menu/:id", verifyToken, verifyAdminStan, upload.single('foto'), validateRequest(updateMenuValidation), updateMenu);
router.delete("/menu/:id", verifyToken, verifyAdminStan, deleteMenu);

// Diskon routes
router.post("/diskon", verifyToken, verifyAdminStan, validateRequest(createDiskonValidation), createDiskon);
router.post("/diskon/per-menu", verifyToken, verifyAdminStan, validateRequest(createDiskonPerMenuValidation), createDiskonPerMenu);
router.get("/diskon", getAllDiskon);
router.get("/diskon/active", getActiveDiskon);
router.get("/diskon/:id", getDiskonById);
router.put("/diskon/:id", verifyToken, verifyAdminStan, validateRequest(updateDiskonValidation), updateDiskon);
router.delete("/diskon/:id", verifyToken, verifyAdminStan, deleteDiskon);

// Diskon assignment routes
router.post("/diskon/:id/assign", verifyToken, verifyAdminStan, validateRequest(assignDiskonValidation), assignDiskonToMenu);
router.post("/diskon/:id/remove", verifyToken, verifyAdminStan, validateRequest(assignDiskonValidation), removeDiskonFromMenu);

// Order Management routes
router.get("/orders", verifyToken, verifyAdminStan, getOrdersForStan);
router.get("/orders/:id", verifyToken, verifyAdminStan, getOrderByIdForStan);
router.put("/orders/:id/status", verifyToken, verifyAdminStan, validateRequest(updateOrderStatusValidation), updateOrderStatus);

// Income Recap route
router.get("/income/monthly", verifyToken, verifyAdminStan, getMonthlyIncomeRecap);

export default router;
