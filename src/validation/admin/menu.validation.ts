import Joi from "joi";

export const createMenuValidation = Joi.object({
    nama_masakan: Joi.string().min(3).max(100).required().messages({
        "string.empty": "Nama masakan/minuman tidak boleh kosong",
        "string.min": "Nama masakan/minuman minimal 3 karakter",
        "string.max": "Nama masakan/minuman maksimal 100 karakter",
        "any.required": "Nama masakan/minuman harus diisi"
    }),
    harga: Joi.number().min(0).required().messages({
        "number.base": "Harga harus berupa angka",
        "number.min": "Harga minimal 0",
        "any.required": "Harga harus diisi"
    }),
    jenis: Joi.string().valid("makanan", "minuman").required().messages({
        "string.empty": "Jenis tidak boleh kosong",
        "any.only": "Jenis harus makanan atau minuman",
        "any.required": "Jenis harus diisi"
    }),
    deskripsi: Joi.string().max(500).optional().messages({
        "string.max": "Deskripsi maksimal 500 karakter"
    })
});

export const updateMenuValidation = Joi.object({
    nama_masakan: Joi.string().min(3).max(100).optional().messages({
        "string.empty": "Nama masakan/minuman tidak boleh kosong",
        "string.min": "Nama masakan/minuman minimal 3 karakter",
        "string.max": "Nama masakan/minuman maksimal 100 karakter"
    }),
    harga: Joi.number().min(0).optional().messages({
        "number.base": "Harga harus berupa angka",
        "number.min": "Harga minimal 0"
    }),
    jenis: Joi.string().valid("makanan", "minuman").optional().messages({
        "string.empty": "Jenis tidak boleh kosong",
        "any.only": "Jenis harus makanan atau minuman"
    }),
    deskripsi: Joi.string().max(500).optional().messages({
        "string.max": "Deskripsi maksimal 500 karakter"
    })
});
