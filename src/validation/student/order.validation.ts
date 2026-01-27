import Joi from "joi";

export const createOrderValidation = Joi.object({
    id_stan: Joi.number().integer().positive().required().messages({
        "number.base": "ID stan harus berupa angka",
        "number.positive": "ID stan harus positif",
        "any.required": "ID stan harus diisi"
    }),
    items: Joi.array().items(
        Joi.object({
            id_menu: Joi.number().integer().positive().required().messages({
                "number.base": "ID menu harus berupa angka",
                "number.positive": "ID menu harus positif",
                "any.required": "ID menu harus diisi"
            }),
            qty: Joi.number().integer().min(1).required().messages({
                "number.base": "Quantity harus berupa angka",
                "number.min": "Quantity minimal 1",
                "any.required": "Quantity harus diisi"
            }),
            id_diskon: Joi.number().integer().positive().optional().allow(null).messages({
                "number.base": "ID diskon harus berupa angka",
                "number.positive": "ID diskon harus positif"
            })
        })
    ).min(1).required().messages({
        "array.base": "Items harus berupa array",
        "array.min": "Minimal 1 item harus dipesan",
        "any.required": "Items harus diisi"
    })
});
