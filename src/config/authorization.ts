import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

// Extend Express Request type to include user data
declare global {
    namespace Express {
        interface Request {
            user?: {
                username: string;
                role: string;
                id?: number;
            }
        }
    }
}

const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const header = req.headers.authorization
        const [type, token] = header ? header.split(" ") : []

        if (!token) {
            return res.status(401).json({
                message: "Token tidak ditemukan"
            })
        }

        // Verify token
        const signature = process.env.SECRET || ''
        const isVerified = jwt.verify(token, signature) as any
        
        if (!isVerified) {
            return res.status(401).json({
                message: "Token tidak valid"
            })
        }

        // Attach user data to request
        req.user = {
            username: isVerified.username,
            role: isVerified.role,
            id: isVerified.id
        }

        next()
    } catch (error) {
        return res.status(401).json({
            message: "Token tidak valid atau expired"
        })
    }
}

// Middleware to verify admin_stan role
const verifyAdminStan = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        if (req.user.role !== 'admin_stan') {
            return res.status(403).json({
                message: "Akses ditolak. Hanya admin stan yang diizinkan"
            })
        }

        next()
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// Middleware to verify admin role (admin_stan)
// Use this for endpoints that require admin access
const verifyAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        if (req.user.role !== 'admin_stan') {
            return res.status(403).json({
                message: "Akses ditolak. Hanya admin yang diizinkan"
            })
        }

        next()
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export { verifyToken, verifyAdminStan, verifyAdmin }