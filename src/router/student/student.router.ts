import { Router } from "express";
import { 
    createSiswa, 
    getAllSiswa, 
    getSiswaById, 
    updateSiswa, 
    deleteSiswa
} from "../../controller/student/StudentProfileController";
import {
    getAllMenuForSiswa,
    getMenuByIdForSiswa
} from "../../controller/student/StudentMenuController";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getOrdersByMonth,
    printOrderReceipt
} from "../../controller/student/StudentOrderController";
import { createSiswaValidation, updateSiswaValidation } from "../../validation/student/student.validation";
import { createOrderValidation } from "../../validation/student/order.validation";
import { validateRequest } from "../../middleware/validation";
import { verifyToken, verifyAdmin } from "../../config/authorization";
import { upload } from "../../config/upload";
import { verifySiswaAccessOrAdmin } from "../../middleware/siswaAccess";

const router = Router();

// Siswa CRUD (Admin only)
router.post("/siswa", verifyToken, verifyAdmin, upload.single('foto'), validateRequest(createSiswaValidation), createSiswa);
router.get("/siswa", getAllSiswa); 
router.get("/siswa/:id", getSiswaById);
router.put("/siswa/:id", verifyToken, verifySiswaAccessOrAdmin, upload.single('foto'), validateRequest(updateSiswaValidation), updateSiswa);
router.delete("/siswa/:id", verifyToken, verifyAdmin, deleteSiswa);

// Menu routes for Siswa (Public - can view menu)
router.get("/menu", getAllMenuForSiswa);
router.get("/menu/:id", getMenuByIdForSiswa);

// Order routes for Siswa (Protected - must login as siswa)
router.post("/order", verifyToken, validateRequest(createOrderValidation), createOrder);
router.get("/order", verifyToken, getMyOrders);
router.get("/order/history", verifyToken, getOrdersByMonth);
router.get("/order/:id", verifyToken, getOrderById);
router.get("/order/:id/receipt", verifyToken, printOrderReceipt);

export default router;
