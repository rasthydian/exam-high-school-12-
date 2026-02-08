import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ errorFormat: "minimal" });

// Get All Menu (untuk siswa)
const getAllMenuForSiswa = async (req: Request, res: Response) => {
    try {
        const { jenis, id_stan } = req.query;

        // Build filter
        const filter: any = {};
        if (jenis) filter.jenis = jenis;
        if (id_stan) filter.id_stan = Number(id_stan);

        const menus = await prisma.menu.findMany({
            where: filter,
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
                // Find the highest discount
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
                id: menu.id,
                nama_masakan: menu.nama_masakan,
                harga_asli: menu.harga,
                harga_setelah_diskon: hargaSetelahDiskon,
                harga_final: hargaSetelahDiskon || menu.harga,
                hemat: hemat,
                diskon_aktif: diskonAktif,
                jenis: menu.jenis,
                foto: menu.foto,
                deskripsi: menu.deskripsi,
                stan: menu.stan,
                ada_diskon: activeDiscounts.length > 0
            };
        });

        return res.status(200).json({
            message: "Success get all menu",
            data: menusWithDiskon
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Menu by ID with Discount Info
const getMenuByIdForSiswa = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const menu = await prisma.menu.findUnique({
            where: { id: Number(id) },
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                        nama_pemilik: true,
                        telp: true
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

        const now = new Date();
        const activeDiscounts = (menu as any).menu_diskon
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
            // Find the highest discount
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
            id: menu.id,
            nama_masakan: menu.nama_masakan,
            harga_asli: menu.harga,
            harga_setelah_diskon: hargaSetelahDiskon,
            harga_final: hargaSetelahDiskon || menu.harga,
            hemat: hemat,
            diskon_aktif: diskonAktif,
            jenis: menu.jenis,
            foto: menu.foto,
            deskripsi: menu.deskripsi,
            stan: menu.stan,
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

export {
    getAllMenuForSiswa,
    getMenuByIdForSiswa
};
