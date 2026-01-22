import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({ errorFormat: "minimal" });

// Create Student
const createSiswa = async (req: Request, res: Response) => {
    try {
        const { nama_siswa, alamat, telp, username, password } = req.body;
        const foto = req.file ? req.file.filename : null;

        // Check if username already exists
        const existingUser = await prisma.users.findFirst({
            where: { username }
        });

        if (existingUser) {
            // Delete uploaded file if validation fails
            if (foto) {
                const filePath = path.join(__dirname, '../../uploads', foto);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create user first with role siswa
        const newUser = await prisma.users.create({
            data: {
                username,
                password: hashPassword,
                role: "siswa"
            }
        });

        // Create siswa profile
        const newSiswa = await prisma.siswa.create({
            data: {
                nama_siswa,
                alamat,
                telp,
                foto: foto || "",
                id_user: newUser.id
            }
        });

        return res.status(201).json({
            message: "Student and user account created successfully",
            data: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    role: newUser.role
                },
                siswa: newSiswa
            }
        });
    } catch (error) {
        console.log(error);
        // Delete uploaded file if error occurs
        if (req.file) {
            const filePath = path.join(__dirname, '../../uploads', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get All Siswa
const getAllSiswa = async (req: Request, res: Response) => {
    try {
        const siswaList = await prisma.siswa.findMany({
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
            message: "Success get all students",
            data: siswaList
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Get Siswa by ID
const getSiswaById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const siswa = await prisma.siswa.findUnique({
            where: { id: Number(id) },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                },
                transaksi: true
            }
        });

        if (!siswa) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        return res.status(200).json({
            message: "Success get student",
            data: siswa
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Update Siswa
const updateSiswa = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama_siswa, alamat, telp } = req.body || {};
        const foto = req.file ? req.file.filename : null;

        // Check if siswa exists
        const existingSiswa = await prisma.siswa.findUnique({
            where: { id: Number(id) }
        });

        if (!existingSiswa) {
            // Delete uploaded file if validation fails
            if (foto) {
                const filePath = path.join(__dirname, '../../uploads', foto);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Build update data object with only provided fields
        const updateData: any = {};
        if (nama_siswa !== undefined) updateData.nama_siswa = nama_siswa;
        if (alamat !== undefined) updateData.alamat = alamat;
        if (telp !== undefined) updateData.telp = telp;
        
        // Handle photo update
        if (foto) {
            updateData.foto = foto;
            
            // Delete old photo if exists
            if (existingSiswa.foto) {
                const oldFilePath = path.join(__dirname, '../../uploads', existingSiswa.foto);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        }

        const updatedSiswa = await prisma.siswa.update({
            where: { id: Number(id) },
            data: updateData
        });

        return res.status(200).json({
            message: "Student updated successfully",
            data: updatedSiswa
        });
    } catch (error) {
        console.log(error);
        // Delete uploaded file if error occurs
        if (req.file) {
            const filePath = path.join(__dirname, '../../uploads', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

// Delete Siswa
const deleteSiswa = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if siswa exists
        const existingSiswa = await prisma.siswa.findUnique({
            where: { id: Number(id) }
        });

        if (!existingSiswa) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        // Delete photo file if exists
        if (existingSiswa.foto) {
            const filePath = path.join(__dirname, '../../uploads', existingSiswa.foto);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await prisma.siswa.delete({
            where: { id: Number(id) }
        });

        return res.status(200).json({
            message: "Student deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

export { createSiswa, getAllSiswa, getSiswaById, updateSiswa, deleteSiswa };
