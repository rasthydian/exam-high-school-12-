import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ errorFormat: "minimal" });

// Create Order (Transaksi)
const createOrder = async (req: Request, res: Response) => {
    try {
        const { id_stan, items } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get or create siswa profile
        let siswa = await prisma.siswa.findFirst({
            where: { id_user: userId }
        });

        if (!siswa) {
            // Auto-create siswa profile if user has role siswa
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (!user || user.role !== 'siswa') {
                return res.status(403).json({
                    message: "Only users with role 'siswa' can create orders"
                });
            }

            // Create default siswa profile
            siswa = await prisma.siswa.create({
                data: {
                    nama_siswa: user.username,
                    alamat: "",
                    telp: "",
                    foto: "",
                    id_user: userId
                }
            });
        }

        // Verify stan exists
        const stan = await prisma.stan.findUnique({
            where: { id: Number(id_stan) }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found"
            });
        }

        // Validate all menu items and calculate prices
        const orderDetails = [];
        for (const item of items) {
            const menu = await prisma.menu.findUnique({
                where: { id: item.id_menu },
                include: {
                    menu_diskon: {
                        include: {
                            diskon: true
                        }
                    }
                }
            });

            if (!menu) {
                return res.status(404).json({
                    message: `Menu with ID ${item.id_menu} not found`
                });
            }

            if (menu.id_stan !== Number(id_stan)) {
                return res.status(400).json({
                    message: `Menu ${menu.nama_masakan} does not belong to the selected stan`
                });
            }

            let finalPrice = menu.harga;

            // Apply discount if provided
            if (item.id_diskon) {
                const diskon = await prisma.diskon.findUnique({
                    where: { id: item.id_diskon }
                });

                if (!diskon) {
                    return res.status(404).json({
                        message: `Diskon with ID ${item.id_diskon} not found`
                    });
                }

                // Check if discount is active
                const now = new Date();
                if (now < diskon.tanggal_awal || now > diskon.tanggal_akhir) {
                    return res.status(400).json({
                        message: `Diskon ${diskon.nama_diskon} is not active`
                    });
                }

                // Check if discount is valid for this menu
                const menuDiskon = await prisma.menu_diskon.findFirst({
                    where: {
                        id_menu: item.id_menu,
                        id_diskon: item.id_diskon
                    }
                });

                if (!menuDiskon) {
                    return res.status(400).json({
                        message: `Diskon ${diskon.nama_diskon} is not valid for menu ${menu.nama_masakan}`
                    });
                }

                // Calculate discounted price
                finalPrice = menu.harga * (1 - diskon.persentase_diskon / 100);
            }

            orderDetails.push({
                id_menu: item.id_menu,
                qty: item.qty,
                harga_beli: finalPrice
            });
        }

        // Create transaksi
        const transaksi = await prisma.transaksi.create({
            data: {
                tanggal: new Date(),
                id_stan: Number(id_stan),
                id_siswa: siswa.id,
                status: "belum_dikonfirm"
            }
        });

        // Create detail transaksi
        const detailTransaksiData = orderDetails.map(detail => ({
            id_transaksi: transaksi.id,
            id_menu: detail.id_menu,
            qty: detail.qty,
            harga_beli: detail.harga_beli
        }));

        await prisma.detail_transaksi.createMany({
            data: detailTransaksiData
        });

        // Get complete order data
        const completeOrder = await prisma.transaksi.findUnique({
            where: { id: transaksi.id },
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                        nama_pemilik: true
                    }
                },
                siswa: {
                    select: {
                        id: true,
                        nama_siswa: true
                    }
                },
                detail_transaksi: {
                    include: {
                        menu: {
                            select: {
                                id: true,
                                nama_masakan: true,
                                jenis: true,
                                foto: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate total
        const total = completeOrder?.detail_transaksi.reduce((sum, detail) => {
            return sum + (detail.harga_beli * detail.qty);
        }, 0) || 0;

        return res.status(201).json({
            message: "Order created successfully",
            data: {
                ...completeOrder,
                total_harga: total
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get My Orders (untuk siswa)
const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { status } = req.query;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get or create siswa profile
        let siswa = await prisma.siswa.findFirst({
            where: { id_user: userId }
        });

        if (!siswa) {
            // Auto-create siswa profile if user has role siswa
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (!user || user.role !== 'siswa') {
                return res.status(403).json({
                    message: "Only users with role 'siswa' can view orders"
                });
            }

            // Create default siswa profile
            siswa = await prisma.siswa.create({
                data: {
                    nama_siswa: user.username,
                    alamat: "",
                    telp: "",
                    foto: "",
                    id_user: userId
                }
            });
        }

        // Build filter
        const filter: any = { id_siswa: siswa.id };
        if (status) filter.status = status;

        const orders = await prisma.transaksi.findMany({
            where: filter,
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                        nama_pemilik: true,
                        telp: true
                    }
                },
                detail_transaksi: {
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
            },
            orderBy: {
                tanggal: 'desc'
            }
        });

        // Add total to each order
        const ordersWithTotal = orders.map(order => {
            const total = order.detail_transaksi.reduce((sum, detail) => {
                return sum + (detail.harga_beli * detail.qty);
            }, 0);

            return {
                ...order,
                total_harga: total
            };
        });

        return res.status(200).json({
            message: "Success get my orders",
            data: ordersWithTotal
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Order by ID
const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get or create siswa profile
        let siswa = await prisma.siswa.findFirst({
            where: { id_user: userId }
        });

        if (!siswa) {
            // Auto-create siswa profile if user has role siswa
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (!user || user.role !== 'siswa') {
                return res.status(403).json({
                    message: "Only users with role 'siswa' can view orders"
                });
            }

            // Create default siswa profile
            siswa = await prisma.siswa.create({
                data: {
                    nama_siswa: user.username,
                    alamat: "",
                    telp: "",
                    foto: "",
                    id_user: userId
                }
            });
        }

        const order = await prisma.transaksi.findUnique({
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
                siswa: {
                    select: {
                        id: true,
                        nama_siswa: true,
                        alamat: true,
                        telp: true
                    }
                },
                detail_transaksi: {
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

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Verify ownership
        if (order.id_siswa !== siswa.id) {
            return res.status(403).json({
                message: "Forbidden: You can only view your own orders"
            });
        }

        // Calculate total
        const total = order.detail_transaksi.reduce((sum, detail) => {
            return sum + (detail.harga_beli * detail.qty);
        }, 0);

        return res.status(200).json({
            message: "Success get order",
            data: {
                ...order,
                total_harga: total
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Orders History by Month
const getOrdersByMonth = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { month, year } = req.query;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get or create siswa profile
        let siswa = await prisma.siswa.findFirst({
            where: { id_user: userId }
        });

        if (!siswa) {
            // Auto-create siswa profile if user has role siswa
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (!user || user.role !== 'siswa') {
                return res.status(403).json({
                    message: "Only users with role 'siswa' can view orders"
                });
            }

            // Create default siswa profile
            siswa = await prisma.siswa.create({
                data: {
                    nama_siswa: user.username,
                    alamat: "",
                    telp: "",
                    foto: "",
                    id_user: userId
                }
            });
        }

        // Default to current month/year if not provided
        const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
        const targetYear = year ? Number(year) : new Date().getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const orders = await prisma.transaksi.findMany({
            where: {
                id_siswa: siswa.id,
                tanggal: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                        nama_pemilik: true,
                        telp: true
                    }
                },
                detail_transaksi: {
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
            },
            orderBy: {
                tanggal: 'desc'
            }
        });

        // Add total to each order and calculate summary
        let totalPembelian = 0;
        const ordersWithTotal = orders.map(order => {
            const total = order.detail_transaksi.reduce((sum, detail) => {
                return sum + (detail.harga_beli * detail.qty);
            }, 0);
            totalPembelian += total;

            return {
                ...order,
                total_harga: total
            };
        });

        return res.status(200).json({
            message: "Success get orders history by month",
            data: {
                bulan: targetMonth,
                tahun: targetYear,
                total_transaksi: orders.length,
                total_pembelian: totalPembelian,
                orders: ordersWithTotal
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Print Order Receipt/Nota
const printOrderReceipt = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get or create siswa profile
        let siswa = await prisma.siswa.findFirst({
            where: { id_user: userId }
        });

        if (!siswa) {
            // Auto-create siswa profile if user has role siswa
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (!user || user.role !== 'siswa') {
                return res.status(403).json({
                    message: "Only users with role 'siswa' can print receipt"
                });
            }

            // Create default siswa profile
            siswa = await prisma.siswa.create({
                data: {
                    nama_siswa: user.username,
                    alamat: "",
                    telp: "",
                    foto: "",
                    id_user: userId
                }
            });
        }

        const order = await prisma.transaksi.findUnique({
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
                siswa: {
                    select: {
                        id: true,
                        nama_siswa: true,
                        alamat: true,
                        telp: true
                    }
                },
                detail_transaksi: {
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

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        // Verify ownership
        if (order.id_siswa !== siswa.id) {
            return res.status(403).json({
                message: "Forbidden: You can only print your own order receipt"
            });
        }

        // Calculate total and subtotals
        let totalHarga = 0;
        const items = order.detail_transaksi.map(detail => {
            const subtotal = detail.harga_beli * detail.qty;
            totalHarga += subtotal;

            return {
                nama_menu: detail.menu.nama_masakan,
                jenis: detail.menu.jenis,
                harga_satuan: detail.harga_beli,
                qty: detail.qty,
                subtotal: subtotal
            };
        });

        // Format receipt data
        const receipt = {
            nota: {
                no_transaksi: order.id,
                tanggal: order.tanggal,
                status: order.status
            },
            stan: {
                nama_stan: order.stan.nama_stan,
                nama_pemilik: order.stan.nama_pemilik,
                telp: order.stan.telp
            },
            pembeli: {
                nama: order.siswa.nama_siswa,
                alamat: order.siswa.alamat,
                telp: order.siswa.telp
            },
            items: items,
            total_harga: totalHarga
        };

        return res.status(200).json({
            message: "Receipt data retrieved successfully",
            data: receipt
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export {
    createOrder,
    getMyOrders,
    getOrderById,
    getOrdersByMonth,
    printOrderReceipt
};
