import Joi from "joi";

export const registerValidation = Joi.object({
    username: Joi.string().min(3).max(50).required().messages({
        "string.empty": "Username tidak boleh kosong",
        "string.min": "Username minimal 3 karakter",
        "string.max": "Username maksimal 50 karakter",
        "any.required": "Username harus diisi"
    }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password tidak boleh kosong",
        "string.min": "Password minimal 6 karakter",
        "any.required": "Password harus diisi"
    }),
    role: Joi.string().valid('admin_stan', 'siswa').required().messages({
        "string.empty": "Role tidak boleh kosong",
        "any.only": "Role harus salah satu dari: admin_stan, siswa",
        "any.required": "Role harus diisi"
    })
});

export const loginValidation = Joi.object({
    username: Joi.string().min(3).max(50).required().messages({
        "string.empty": "Username tidak boleh kosong",
        "string.min": "Username minimal 3 karakter",
        "string.max": "Username maksimal 50 karakter",
        "any.required": "Username harus diisi"
    }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password tidak boleh kosong",
        "string.min": "Password minimal 6 karakter",
        "any.required": "Password harus diisi"
    })
})
