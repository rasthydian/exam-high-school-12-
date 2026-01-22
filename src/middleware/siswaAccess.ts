import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ errorFormat: "minimal" });

// Middleware to verify siswa can only access their own profile or admin can access all
export const verifySiswaAccessOrAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // If admin, allow access to all
        if (userRole === 'admin_stan') {
            return next();
        }

        // If siswa, check if they own this profile
        const siswa = await prisma.siswa.findUnique({
            where: { id: Number(id) }
        });

        if (!siswa) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        if (siswa.id_user !== userId) {
            return res.status(403).json({
                message: "Akses ditolak. Anda hanya bisa mengakses profil Anda sendiri"
            });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
