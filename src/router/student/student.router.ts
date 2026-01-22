import { Router } from "express";
import { createSiswa, getAllSiswa, getSiswaById, updateSiswa, deleteSiswa } from "../../controller/student/studentController";
import { createSiswaValidation, updateSiswaValidation } from "../../validation/student/student.validation";
import { validateRequest } from "../../middleware/validation";
import { verifyToken, verifyAdmin } from "../../config/authorization";
import { upload } from "../../config/upload";
import { verifySiswaAccessOrAdmin } from "../../middleware/siswaAccess";

const router = Router();

// Protected routes - require JWT token and admin role
router.post("/siswa", verifyToken, verifyAdmin, upload.single('foto'), validateRequest(createSiswaValidation), createSiswa);
router.get("/siswa", getAllSiswa); 
router.get("/siswa/:id", getSiswaById);
router.put("/siswa/:id", verifyToken, verifySiswaAccessOrAdmin, upload.single('foto'), validateRequest(updateSiswaValidation), updateSiswa);
router.delete("/siswa/:id", verifyToken, verifyAdmin, deleteSiswa);

export default router;
