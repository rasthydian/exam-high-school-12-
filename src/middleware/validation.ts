import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validateRequest = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            return res.status(400).json({
                message: "Validasi gagal",
                errors: error.details.map(detail => detail.message)
            });
        }
        
        next();
    };
};
