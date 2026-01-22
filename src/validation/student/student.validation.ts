import Joi from "joi";

export const createSiswaValidation = Joi.object({
    nama_siswa: Joi.string().min(3).max(100).required().messages({
        "string.empty": "Nama siswa tidak boleh kosong",
        "string.min": "Nama siswa minimal 3 karakter",
        "string.max": "Nama siswa maksimal 100 karakter",
        "any.required": "Nama siswa harus diisi"
    }),
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
    alamat: Joi.string().max(255).optional().allow('').messages({
        "string.max": "Alamat maksimal 255 karakter"
    }),
    telp: Joi.string().min(10).max(15).optional().allow('').messages({
        "string.min": "Nomor telepon minimal 10 digit",
        "string.max": "Nomor telepon maksimal 15 digit"
    })
});

export const updateSiswaValidation = Joi.object({
    nama_siswa: Joi.string().min(3).max(100).optional().messages({
        "string.empty": "Nama siswa tidak boleh kosong",
        "string.min": "Nama siswa minimal 3 karakter",
        "string.max": "Nama siswa maksimal 100 karakter"
    }),
    alamat: Joi.string().max(255).optional().allow('').messages({
        "string.max": "Alamat maksimal 255 karakter"
    }),
    telp: Joi.string().min(10).max(15).optional().allow('').messages({
        "string.min": "Nomor telepon minimal 10 digit",
        "string.max": "Nomor telepon maksimal 15 digit"
    })
});
