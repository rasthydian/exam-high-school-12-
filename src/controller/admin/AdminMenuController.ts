import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ errorFormat: "minimal" });

// Create Menu (Food & Drink)
const createMenu = async (req: Request, res: Response) => {
    try {
        const { nama_masakan, harga, jenis, deskripsi } = req.body;
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

        // Handle uploaded file if exists
        let fotoPath = "";
        if (req.file) {
            fotoPath = req.file.filename;
        }

        const newMenu = await prisma.menu.create({
            data: {
                nama_masakan,
                harga: parseFloat(harga),
                jenis,
                foto: fotoPath,
                deskripsi: deskripsi || "",
                id_stan: stan.id
            }
        });

        return res.status(201).json({
            message: "Menu created successfully",
            data: newMenu
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get All Menu
const getAllMenu = async (req: Request, res: Response) => {
    try {
        const menus = await prisma.menu.findMany({
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                        nama_pemilik: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Success get all menu",
            data: menus
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Menu by Stan
const getMenuByStan = async (req: Request, res: Response) => {
    try {
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

        const menus = await prisma.menu.findMany({
            where: { id_stan: stan.id },
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                        nama_pemilik: true
                    }
                },
                menu_diskon: {
                    include: {
                        diskon: true
                    }
                }
            }
        });

        // Transform data to include active discounts
        const now = new Date();
        const menusWithDiskon = menus.map((menu: any) => {
            const activeDiscounts = menu.menu_diskon
                .filter((md: any) => {
                    const diskon = md.diskon;
                    return diskon && diskon.tanggal_awal <= now && diskon.tanggal_akhir >= now;
                })
                .map((md: any) => md.diskon);

            // Calculate discounted price if there are active discounts
            let hargaSetelahDiskon = null;
            let diskonAktif = null;
            let hemat = null;
            
            if (activeDiscounts.length > 0) {
                const maxDiskon = activeDiscounts.reduce((max: any, current: any) => 
                    current.persentase_diskon > max.persentase_diskon ? current : max
                );
                diskonAktif = {
                    id: maxDiskon.id,
                    nama_diskon: maxDiskon.nama_diskon,
                    persentase_diskon: maxDiskon.persentase_diskon
                };
                hargaSetelahDiskon = Math.round(menu.harga * (1 - maxDiskon.persentase_diskon / 100));
                hemat = menu.harga - hargaSetelahDiskon;
            }

            return {
                ...menu,
                harga_asli: menu.harga,
                harga_setelah_diskon: hargaSetelahDiskon,
                harga_final: hargaSetelahDiskon || menu.harga,
                hemat: hemat,
                diskon_aktif: diskonAktif,
                ada_diskon: activeDiscounts.length > 0
            };
        });

        return res.status(200).json({
            message: "Success get menu by stan",
            data: menusWithDiskon
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Menu by ID
const getMenuById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const menu = await prisma.menu.findUnique({
            where: { id: Number(id) },
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                        nama_pemilik: true
                    }
                },
                menu_diskon: {
                    include: {
                        diskon: true
                    }
                }
            }
        });

        if (!menu) {
            return res.status(404).json({
                message: "Menu not found"
            });
        }

        // Calculate active discounts
        const now = new Date();
        const activeDiscounts = (menu as any).menu_diskon
            .filter((md: any) => {
                const diskon = md.diskon;
                return diskon && diskon.tanggal_awal <= now && diskon.tanggal_akhir >= now;
            })
            .map((md: any) => md.diskon);

        let hargaSetelahDiskon = null;
        let diskonAktif = null;
        let hemat = null;
        
        if (activeDiscounts.length > 0) {
            const maxDiskon = activeDiscounts.reduce((max: any, current: any) => 
                current.persentase_diskon > max.persentase_diskon ? current : max
            );
            diskonAktif = {
                id: maxDiskon.id,
                nama_diskon: maxDiskon.nama_diskon,
                persentase_diskon: maxDiskon.persentase_diskon
            };
            hargaSetelahDiskon = Math.round(menu.harga * (1 - maxDiskon.persentase_diskon / 100));
            hemat = menu.harga - hargaSetelahDiskon;
        }

        const menuWithDiskon = {
            ...menu,
            harga_asli: menu.harga,
            harga_setelah_diskon: hargaSetelahDiskon,
            harga_final: hargaSetelahDiskon || menu.harga,
            hemat: hemat,
            diskon_aktif: diskonAktif,
            ada_diskon: activeDiscounts.length > 0
        };

        return res.status(200).json({
            message: "Success get menu",
            data: menuWithDiskon
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Update Menu
const updateMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama_masakan, harga, jenis, deskripsi } = req.body || {};
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

        // Check if menu exists and belongs to the user's stan
        const existingMenu = await prisma.menu.findUnique({
            where: { id: Number(id) }
        });

        if (!existingMenu) {
            return res.status(404).json({
                message: "Menu not found"
            });
        }

        if (existingMenu.id_stan !== stan.id) {
            return res.status(403).json({
                message: "Forbidden: You can only update your own stan's menu"
            });
        }

        // Build update data object with only provided fields
        const updateData: any = {};
        if (nama_masakan !== undefined) updateData.nama_masakan = nama_masakan;
        if (harga !== undefined) updateData.harga = parseFloat(harga);
        if (jenis !== undefined) updateData.jenis = jenis;
        if (deskripsi !== undefined) updateData.deskripsi = deskripsi;

        // Handle uploaded file if exists
        if (req.file) {
            updateData.foto = req.file.filename;
        }

        const updatedMenu = await prisma.menu.update({
            where: { id: Number(id) },
            data: updateData
        });

        return res.status(200).json({
            message: "Menu updated successfully",
            data: updatedMenu
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Delete Menu
const deleteMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
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

        // Check if menu exists and belongs to the user's stan
        const existingMenu = await prisma.menu.findUnique({
            where: { id: Number(id) }
        });

        if (!existingMenu) {
            return res.status(404).json({
                message: "Menu not found"
            });
        }

        if (existingMenu.id_stan !== stan.id) {
            return res.status(403).json({
                message: "Forbidden: You can only delete your own stan's menu"
            });
        }

        await prisma.menu.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json({
            message: "Menu deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export {
    createMenu,
    getAllMenu,
    getMenuByStan,
    getMenuById,
    updateMenu,
    deleteMenu
};
