import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ errorFormat: "minimal" });

// Middleware to verify stan ownership
export const verifyStanOwnership = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Find stan by ID
        const stan = await prisma.stan.findUnique({
            where: { id: Number(id) }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found"
            });
        }

        // Check if user owns this stan
        if (stan.id_user !== userId) {
            return res.status(403).json({
                message: "Akses ditolak. Anda tidak memiliki akses ke stan ini"
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
