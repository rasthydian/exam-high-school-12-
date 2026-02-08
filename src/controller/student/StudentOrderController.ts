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
            const now = new Date();

            // Apply discount if provided or auto-apply best available discount
            if (item.id_diskon) {
                // Use specified discount
                const diskon = await prisma.diskon.findUnique({
                    where: { id: item.id_diskon }
                });

                if (!diskon) {
                    return res.status(404).json({
                        message: `Diskon with ID ${item.id_diskon} not found`
                    });
                }

                // Check if discount is active
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
                finalPrice = Math.round(menu.harga * (1 - diskon.persentase_diskon / 100));
            } else {
                // Auto-apply best available discount
                const activeDiscounts = (menu as any).menu_diskon
                    .filter((md: any) => {
                        const diskon = md.diskon;
                        return diskon && diskon.tanggal_awal <= now && diskon.tanggal_akhir >= now;
                    })
                    .map((md: any) => md.diskon);

                if (activeDiscounts.length > 0) {
                    // Find the highest discount
                    const maxDiskon = activeDiscounts.reduce((max: any, current: any) => 
                        current.persentase_diskon > max.persentase_diskon ? current : max
                    );
                    // Calculate discounted price with best discount
                    finalPrice = Math.round(menu.harga * (1 - maxDiskon.persentase_diskon / 100));
                }
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

        // Generate HTML Receipt
        const formatRupiah = (amount: number) => {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        };

        const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'full',
                timeStyle: 'short'
            }).format(new Date(date));
        };

        const statusLabel: Record<string, string> = {
            'belum_dikonfirm': 'Belum Dikonfirmasi',
            'dimasak': 'Sedang Dimasak',
            'diantar': 'Sedang Diantar',
            'sampai': 'Pesanan Sampai'
        };

        const statusColor: Record<string, string> = {
            'belum_dikonfirm': '#ffc107',
            'dimasak': '#2196F3',
            'diantar': '#ff9800',
            'sampai': '#4CAF50'
        };

        const itemsHTML = items.map((item, index) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${index + 1}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
                    ${item.nama_menu}
                    <span style="display: block; font-size: 12px; color: #666; margin-top: 4px;">
                        (${item.jenis})
                    </span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatRupiah(item.harga_satuan)}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.qty}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: 600;">${formatRupiah(item.subtotal)}</td>
            </tr>
        `).join('');

        const htmlReceipt = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nota Pemesanan #${order.id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .receipt-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .receipt-header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .receipt-header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .receipt-body {
            padding: 30px;
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 20px;
        }
        .info-box {
            flex: 1;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .info-box h3 {
            color: #667eea;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 12px;
            letter-spacing: 1px;
        }
        .info-box p {
            color: #333;
            font-size: 14px;
            line-height: 1.6;
            margin: 5px 0;
        }
        .info-box .label {
            color: #666;
            font-size: 12px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
        }
        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        thead th {
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        tbody tr:hover {
            background-color: #f8f9fa;
        }
        .total-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .total-section .label {
            font-size: 18px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .total-section .amount {
            font-size: 32px;
            font-weight: 700;
        }
        .receipt-footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #666;
            font-size: 13px;
            line-height: 1.8;
        }
        .receipt-footer strong {
            color: #333;
            display: block;
            margin-top: 15px;
            font-size: 16px;
        }
        @media print {
            body { background: white; padding: 0; }
            .receipt-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <h1>🧾 NOTA PEMESANAN</h1>
            <p>No. Transaksi: #${order.id}</p>
        </div>
        
        <div class="receipt-body">
            <div class="info-section">
                <div class="info-box">
                    <h3>📍 Informasi Stan</h3>
                    <p><strong>${order.stan.nama_stan}</strong></p>
                    <p class="label">Pemilik</p>
                    <p>${order.stan.nama_pemilik}</p>
                    <p class="label">Telepon</p>
                    <p>${order.stan.telp || '-'}</p>
                </div>
                
                <div class="info-box">
                    <h3>👤 Informasi Pembeli</h3>
                    <p><strong>${order.siswa.nama_siswa}</strong></p>
                    <p class="label">Alamat</p>
                    <p>${order.siswa.alamat || '-'}</p>
                    <p class="label">Telepon</p>
                    <p>${order.siswa.telp || '-'}</p>
                </div>
                
                <div class="info-box">
                    <h3>📅 Informasi Pesanan</h3>
                    <p class="label">Tanggal</p>
                    <p><strong>${formatDate(order.tanggal)}</strong></p>
                    <p class="label">Status</p>
                    <div class="status-badge" style="background-color: ${statusColor[order.status]}; color: white;">
                        ${statusLabel[order.status]}
                    </div>
                </div>
            </div>
            
            <h3 style="color: #667eea; margin-bottom: 15px; font-size: 18px;">🍽️ Detail Pesanan</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 50px;">No</th>
                        <th>Nama Menu</th>
                        <th style="text-align: right; width: 120px;">Harga</th>
                        <th style="text-align: center; width: 80px;">Qty</th>
                        <th style="text-align: right; width: 150px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <div class="total-section">
                <span class="label">Total Pembayaran</span>
                <span class="amount">${formatRupiah(totalHarga)}</span>
            </div>
        </div>
        
        <div class="receipt-footer">
            <p>Terima kasih atas pesanan Anda! 🙏</p>
            <p>Semoga makanan dan minuman yang Anda pesan dapat dinikmati dengan baik.</p>
            <strong>Selamat Menikmati! 😊</strong>
            <p style="margin-top: 20px; font-size: 11px; color: #999;">
                Nota ini dicetak pada: ${formatDate(new Date())}
            </p>
        </div>
    </div>
</body>
</html>
        `;

        return res.status(200).send(htmlReceipt);
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
