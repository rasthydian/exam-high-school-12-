import { Request, Response } from "express";

const createUser =  async (req: Request, res: Response) => {
    try {
        const user_name: string = req.body.user_name
        const user_password: string = req.body.user_password
        return res.status(200).json({message: 'new user has be created'})
    } catch (error) {
        console.log(error)

        return res.status(500).json(error)
    }
}

export {createUser}