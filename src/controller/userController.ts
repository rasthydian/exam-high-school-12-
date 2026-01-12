import { Request, Response } from "express";
import {PrismaClient, Role} from '@prisma/client'
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient({errorFormat: "minimal"});

const authentication = async (req: Request, res: Response) => {
    try {
        const {username, password} = req.body

        const findUser = await prisma.users.findFirst({
            where: {
                username
            }
        })

        if(!findUser){
            return res.status(404).json({
                message: "User not found"
            })
        }

        const isMatchPassword = await bcrypt.compare(password, findUser.password)

        if (!isMatchPassword) {
            return res.status(400).json({
                message: "Invalid password"
            })
        }

        const payload = {
            username: findUser.username,
            role: findUser.role
        }

        const signature = process.env.SECRET || ''

        const token = jwt.sign(payload, signature)

        return res.status(200).json({
            logged: true,
            token,
            id: findUser.id,
            username: findUser.username,
            role: findUser.role
        })
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const register = async (req: Request, res: Response) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const role: Role = req.body.role;

        const findUsername = await prisma.users.findFirst({
            where: {
                username: username
            }
        })

        if (findUsername) {
            return res.status(400).json({
                message: "Username already exists"
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.users.create({
            data: {
                username: username,
                password: hashPassword,
                role: role
            }
        });

        return res.status(200).json({
            message: "Success Register Account",
            data: newUser
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export { authentication, register };