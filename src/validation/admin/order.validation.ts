import Joi from "joi";

export const updateOrderStatusValidation = Joi.object({
    status: Joi.string()
        .valid('belum_dikonfirm', 'dimasak', 'diantar', 'sampai')
        .required()
        .messages({
            'any.only': 'Status must be one of: belum_dikonfirm, dimasak, diantar, sampai',
            'any.required': 'Status is required'
        })
});
