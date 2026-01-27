import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ errorFormat: "minimal" });

// Create Diskon (General)
const createDiskon = async (req: Request, res: Response) => {
    try {
        const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir } = req.body;

        const newDiskon = await prisma.diskon.create({
            data: {
                nama_diskon,
                persentase_diskon: parseFloat(persentase_diskon),
                tanggal_awal: new Date(tanggal_awal),
                tanggal_akhir: new Date(tanggal_akhir)
            }
        });

        return res.status(201).json({
            message: "Diskon created successfully",
            data: newDiskon
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Create Diskon Per Menu (Create + Auto Assign)
const createDiskonPerMenu = async (req: Request, res: Response) => {
    try {
        const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir, id_menu } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get stan of the user
        const stan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found. Please create a stan first."
            });
        }

        // Verify all menus belong to the user's stan
        const menus = await prisma.menu.findMany({
            where: {
                id: { in: id_menu },
                id_stan: stan.id
            }
        });

        if (menus.length !== id_menu.length) {
            return res.status(403).json({
                message: "Some menus do not belong to your stan or do not exist"
            });
        }

        // Create diskon
        const newDiskon = await prisma.diskon.create({
            data: {
                nama_diskon,
                persentase_diskon: parseFloat(persentase_diskon),
                tanggal_awal: new Date(tanggal_awal),
                tanggal_akhir: new Date(tanggal_akhir)
            }
        });

        // Create assignments
        const menuDiskonData = id_menu.map((menuId: number) => ({
            id_menu: menuId,
            id_diskon: newDiskon.id
        }));

        await prisma.menu_diskon.createMany({
            data: menuDiskonData
        });

        // Get result with relations
        const result = await prisma.diskon.findUnique({
            where: { id: newDiskon.id },
            include: {
                menu_diskon: {
                    include: {
                        menu: {
                            select: {
                                id: true,
                                nama_masakan: true,
                                harga: true,
                                jenis: true,
                                foto: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(201).json({
            message: "Diskon created and assigned to menu successfully",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get All Diskon
const getAllDiskon = async (req: Request, res: Response) => {
    try {
        const diskons = await prisma.diskon.findMany({
            include: {
                menu_diskon: {
                    include: {
                        menu: {
                            select: {
                                id: true,
                                nama_masakan: true,
                                harga: true,
                                jenis: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Success get all diskon",
            data: diskons
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Diskon by ID
const getDiskonById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const diskon = await prisma.diskon.findUnique({
            where: { id: Number(id) },
            include: {
                menu_diskon: {
                    include: {
                        menu: {
                            select: {
                                id: true,
                                nama_masakan: true,
                                harga: true,
                                jenis: true,
                                foto: true,
                                deskripsi: true
                            }
                        }
                    }
                }
            }
        });

        if (!diskon) {
            return res.status(404).json({
                message: "Diskon not found"
            });
        }

        return res.status(200).json({
            message: "Success get diskon",
            data: diskon
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Update Diskon
const updateDiskon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir } = req.body || {};

        // Check if diskon exists
        const existingDiskon = await prisma.diskon.findUnique({
            where: { id: Number(id) }
        });

        if (!existingDiskon) {
            return res.status(404).json({
                message: "Diskon not found"
            });
        }

        // Build update data object with only provided fields
        const updateData: any = {};
        if (nama_diskon !== undefined) updateData.nama_diskon = nama_diskon;
        if (persentase_diskon !== undefined) updateData.persentase_diskon = parseFloat(persentase_diskon);
        if (tanggal_awal !== undefined) updateData.tanggal_awal = new Date(tanggal_awal);
        if (tanggal_akhir !== undefined) updateData.tanggal_akhir = new Date(tanggal_akhir);

        const updatedDiskon = await prisma.diskon.update({
            where: { id: Number(id) },
            data: updateData
        });

        return res.status(200).json({
            message: "Diskon updated successfully",
            data: updatedDiskon
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Delete Diskon
const deleteDiskon = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if diskon exists
        const existingDiskon = await prisma.diskon.findUnique({
            where: { id: Number(id) }
        });

        if (!existingDiskon) {
            return res.status(404).json({
                message: "Diskon not found"
            });
        }

        // Delete related menu_diskon first
        await prisma.menu_diskon.deleteMany({
            where: { id_diskon: Number(id) }
        });

        // Delete diskon
        await prisma.diskon.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json({
            message: "Diskon deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Assign Diskon to Menu
const assignDiskonToMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // diskon id
        const { id_menu } = req.body; // array of menu ids
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get stan of the user
        const stan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found"
            });
        }

        // Check if diskon exists
        const diskon = await prisma.diskon.findUnique({
            where: { id: Number(id) }
        });

        if (!diskon) {
            return res.status(404).json({
                message: "Diskon not found"
            });
        }

        // Verify all menus belong to the user's stan
        const menus = await prisma.menu.findMany({
            where: {
                id: { in: id_menu },
                id_stan: stan.id
            }
        });

        if (menus.length !== id_menu.length) {
            return res.status(403).json({
                message: "Some menus do not belong to your stan or do not exist"
            });
        }

        // Delete existing assignments for this diskon and these menus
        await prisma.menu_diskon.deleteMany({
            where: {
                id_diskon: Number(id),
                id_menu: { in: id_menu }
            }
        });

        // Create new assignments
        const menuDiskonData = id_menu.map((menuId: number) => ({
            id_menu: menuId,
            id_diskon: Number(id)
        }));

        await prisma.menu_diskon.createMany({
            data: menuDiskonData
        });

        const result = await prisma.diskon.findUnique({
            where: { id: Number(id) },
            include: {
                menu_diskon: {
                    include: {
                        menu: {
                            select: {
                                id: true,
                                nama_masakan: true,
                                harga: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Diskon assigned to menu successfully",
            data: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Remove Diskon from Menu
const removeDiskonFromMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // diskon id
        const { id_menu } = req.body; // array of menu ids
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get stan of the user
        const stan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found"
            });
        }

        // Check if diskon exists
        const diskon = await prisma.diskon.findUnique({
            where: { id: Number(id) }
        });

        if (!diskon) {
            return res.status(404).json({
                message: "Diskon not found"
            });
        }

        // Verify all menus belong to the user's stan
        const menus = await prisma.menu.findMany({
            where: {
                id: { in: id_menu },
                id_stan: stan.id
            }
        });

        if (menus.length !== id_menu.length) {
            return res.status(403).json({
                message: "Some menus do not belong to your stan or do not exist"
            });
        }

        // Delete assignments
        await prisma.menu_diskon.deleteMany({
            where: {
                id_diskon: Number(id),
                id_menu: { in: id_menu }
            }
        });

        return res.status(200).json({
            message: "Diskon removed from menu successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Active Diskons (currently valid)
const getActiveDiskon = async (req: Request, res: Response) => {
    try {
        const now = new Date();

        const diskons = await prisma.diskon.findMany({
            where: {
                tanggal_awal: { lte: now },
                tanggal_akhir: { gte: now }
            },
            include: {
                menu_diskon: {
                    include: {
                        menu: {
                            select: {
                                id: true,
                                nama_masakan: true,
                                harga: true,
                                jenis: true,
                                foto: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Success get active diskon",
            data: diskons
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export { 
    createDiskon,
    createDiskonPerMenu,
    getAllDiskon,
    getDiskonById,
    updateDiskon,
    deleteDiskon,
    assignDiskonToMenu,
    removeDiskonFromMenu,
    getActiveDiskon
};
