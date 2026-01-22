import Joi from "joi";

export const createStanValidation = Joi.object({
    nama_stan: Joi.string().min(3).max(100).required().messages({
        "string.empty": "Nama stan tidak boleh kosong",
        "string.min": "Nama stan minimal 3 karakter",
        "string.max": "Nama stan maksimal 100 karakter",
        "any.required": "Nama stan harus diisi"
    }),
    nama_pemilik: Joi.string().min(3).max(100).required().messages({
        "string.empty": "Nama pemilik tidak boleh kosong",
        "string.min": "Nama pemilik minimal 3 karakter",
        "string.max": "Nama pemilik maksimal 100 karakter",
        "any.required": "Nama pemilik harus diisi"
    }),
    telp: Joi.string().min(10).max(15).optional().messages({
        "string.min": "Nomor telepon minimal 10 digit",
        "string.max": "Nomor telepon maksimal 15 digit"
    })
});

export const updateStanValidation = Joi.object({
    nama_stan: Joi.string().min(3).max(100).optional().messages({
        "string.empty": "Nama stan tidak boleh kosong",
        "string.min": "Nama stan minimal 3 karakter",
        "string.max": "Nama stan maksimal 100 karakter"
    }),
    nama_pemilik: Joi.string().min(3).max(100).optional().messages({
        "string.empty": "Nama pemilik tidak boleh kosong",
        "string.min": "Nama pemilik minimal 3 karakter",
        "string.max": "Nama pemilik maksimal 100 karakter"
    }),
    telp: Joi.string().min(10).max(15).optional().messages({
        "string.min": "Nomor telepon minimal 10 digit",
        "string.max": "Nomor telepon maksimal 15 digit"
    })
});
