import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ errorFormat: "minimal" });

// Get All Orders for Stan (by month)
const getOrdersForStan = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { month, year, status } = req.query;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get stan for this admin
        const stan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found for this admin"
            });
        }

        // Build where clause
        let whereClause: any = {
            id_stan: stan.id
        };

        // Filter by status if provided
        if (status && typeof status === 'string') {
            whereClause.status = status;
        }

        // Filter by month and year if provided
        if (month && year) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
            
            whereClause.tanggal = {
                gte: startDate,
                lte: endDate
            };
        }

        const orders = await prisma.transaksi.findMany({
            where: whereClause,
            include: {
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

        // Calculate total for each order
        const ordersWithTotal = orders.map(order => {
            const total_harga = order.detail_transaksi.reduce((sum, detail) => {
                return sum + (detail.harga_beli * detail.qty);
            }, 0);

            return {
                ...order,
                total_harga
            };
        });

        return res.status(200).json({
            message: "Success get orders for stan",
            data: ordersWithTotal
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Order by ID for Stan
const getOrderByIdForStan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get stan for this admin
        const stan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found for this admin"
            });
        }

        const order = await prisma.transaksi.findFirst({
            where: {
                id: Number(id),
                id_stan: stan.id
            },
            include: {
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
                message: "Order not found or does not belong to your stan"
            });
        }

        // Calculate total
        const total_harga = order.detail_transaksi.reduce((sum, detail) => {
            return sum + (detail.harga_beli * detail.qty);
        }, 0);

        return res.status(200).json({
            message: "Success get order",
            data: {
                ...order,
                total_harga
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Update Order Status
const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get stan for this admin
        const stan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found for this admin"
            });
        }

        // Check if order exists and belongs to this stan
        const order = await prisma.transaksi.findFirst({
            where: {
                id: Number(id),
                id_stan: stan.id
            }
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found or does not belong to your stan"
            });
        }

        // Update status
        const updatedOrder = await prisma.transaksi.update({
            where: { id: Number(id) },
            data: { status },
            include: {
                siswa: {
                    select: {
                        id: true,
                        nama_siswa: true,
                        alamat: true,
                        telp: true
                    }
                },
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
            }
        });

        // Calculate total
        const total_harga = updatedOrder.detail_transaksi.reduce((sum, detail) => {
            return sum + (detail.harga_beli * detail.qty);
        }, 0);

        return res.status(200).json({
            message: "Order status updated successfully",
            data: {
                ...updatedOrder,
                total_harga
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Monthly Income Recap
const getMonthlyIncomeRecap = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { month, year } = req.query;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        // Get stan for this admin
        const stan = await prisma.stan.findFirst({
            where: { id_user: userId }
        });

        if (!stan) {
            return res.status(404).json({
                message: "Stan not found for this admin"
            });
        }

        // Default to current month/year if not provided
        const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
        const targetYear = year ? Number(year) : new Date().getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        // Get all completed orders for the month
        const orders = await prisma.transaksi.findMany({
            where: {
                id_stan: stan.id,
                tanggal: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                detail_transaksi: true
            }
        });

        // Calculate statistics
        let total_pesanan = orders.length;
        let total_pemasukan = 0;
        let pesanan_belum_dikonfirm = 0;
        let pesanan_dimasak = 0;
        let pesanan_diantar = 0;
        let pesanan_sampai = 0;

        orders.forEach(order => {
            const orderTotal = order.detail_transaksi.reduce((sum, detail) => {
                return sum + (detail.harga_beli * detail.qty);
            }, 0);
            
            total_pemasukan += orderTotal;

            // Count by status
            switch (order.status) {
                case 'belum_dikonfirm':
                    pesanan_belum_dikonfirm++;
                    break;
                case 'dimasak':
                    pesanan_dimasak++;
                    break;
                case 'diantar':
                    pesanan_diantar++;
                    break;
                case 'sampai':
                    pesanan_sampai++;
                    break;
            }
        });

        return res.status(200).json({
            message: "Success get monthly income recap",
            data: {
                bulan: targetMonth,
                tahun: targetYear,
                nama_stan: stan.nama_stan,
                rekap: {
                    total_pesanan,
                    total_pemasukan,
                    pesanan_belum_dikonfirm,
                    pesanan_dimasak,
                    pesanan_diantar,
                    pesanan_sampai
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export { 
    getOrdersForStan,
    getOrderByIdForStan,
    updateOrderStatus,
    getMonthlyIncomeRecap
};
