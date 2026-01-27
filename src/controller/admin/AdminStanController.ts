import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'
import jwt from "jsonwebtoken"

const prisma = new PrismaClient({ errorFormat: "minimal" });

// Create Stan
const createStan = async (req: Request, res: Response) => {
    try {
        const { nama_stan, nama_pemilik, telp } = req.body;
        const userId = req.user?.id;
        const username = req.user?.username;
        const role = req.user?.role;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Check if user already has a stan
        const existingStan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (existingStan) {
            return res.status(400).json({
                message: "User already has a stan registered"
            });
        }

        const newStan = await prisma.stan.create({
            data: {
                nama_stan,
                nama_pemilik,
                telp,
                id_user: userId
            }
        });

        // Generate JWT token for admin
        const payload = {
            id: userId,
            username: username,
            role: role
        };

        const signature = process.env.SECRET || '';
        const token = jwt.sign(payload, signature);

        return res.status(201).json({
            message: "Stan created successfully",
            data: newStan,
            token: token,
            admin: {
                id: userId,
                username: username,
                role: role
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get All Stan
const getAllStan = async (req: Request, res: Response) => {
    try {
        const stans = await prisma.stan.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Success get all stan",
            data: stans
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Stan by ID
const getStanById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const stan = await prisma.stan.findUnique({
            where: { id: Number(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                },
                menu: true
            }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found"
            });
        }

        return res.status(200).json({
            message: "Success get stan",
            data: stan
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Update Stan
const updateStan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama_stan, nama_pemilik, telp } = req.body || {};

        // Check if stan exists
        const existingStan = await prisma.stan.findUnique({
            where: { id: Number(id) }
        });

        if (!existingStan) {
            return res.status(404).json({
                message: "Stan not found"
            });
        }

        // Build update data object with only provided fields
        const updateData: any = {};
        if (nama_stan !== undefined) updateData.nama_stan = nama_stan;
        if (nama_pemilik !== undefined) updateData.nama_pemilik = nama_pemilik;
        if (telp !== undefined) updateData.telp = telp;

        const updatedStan = await prisma.stan.update({
            where: { id: Number(id) },
            data: updateData
        });

        return res.status(200).json({
            message: "Stan updated successfully",
            data: updatedStan
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Delete Stan
const deleteStan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if stan exists
        const existingStan = await prisma.stan.findUnique({
            where: { id: Number(id) }
        });

        if (!existingStan) {
            return res.status(404).json({
                message: "Stan not found"
            });
        }

        await prisma.stan.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json({
            message: "Stan deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export { 
    createStan, 
    getAllStan, 
    getStanById, 
    updateStan, 
    deleteStan
};
