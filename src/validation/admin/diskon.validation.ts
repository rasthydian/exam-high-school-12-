import Joi from "joi";

export const createDiskonValidation = Joi.object({
    nama_diskon: Joi.string().min(3).max(100).required().messages({
        "string.empty": "Nama diskon tidak boleh kosong",
        "string.min": "Nama diskon minimal 3 karakter",
        "string.max": "Nama diskon maksimal 100 karakter",
        "any.required": "Nama diskon harus diisi"
    }),
    persentase_diskon: Joi.number().min(0).max(100).required().messages({
        "number.base": "Persentase diskon harus berupa angka",
        "number.min": "Persentase diskon minimal 0%",
        "number.max": "Persentase diskon maksimal 100%",
        "any.required": "Persentase diskon harus diisi"
    }),
    tanggal_awal: Joi.date().required().messages({
        "date.base": "Tanggal awal harus berupa tanggal yang valid",
        "any.required": "Tanggal awal harus diisi"
    }),
    tanggal_akhir: Joi.date().min(Joi.ref('tanggal_awal')).required().messages({
        "date.base": "Tanggal akhir harus berupa tanggal yang valid",
        "date.min": "Tanggal akhir harus setelah atau sama dengan tanggal awal",
        "any.required": "Tanggal akhir harus diisi"
    })
});

export const updateDiskonValidation = Joi.object({
    nama_diskon: Joi.string().min(3).max(100).optional().messages({
        "string.empty": "Nama diskon tidak boleh kosong",
        "string.min": "Nama diskon minimal 3 karakter",
        "string.max": "Nama diskon maksimal 100 karakter"
    }),
    persentase_diskon: Joi.number().min(0).max(100).optional().messages({
        "number.base": "Persentase diskon harus berupa angka",
        "number.min": "Persentase diskon minimal 0%",
        "number.max": "Persentase diskon maksimal 100%"
    }),
    tanggal_awal: Joi.date().optional().messages({
        "date.base": "Tanggal awal harus berupa tanggal yang valid"
    }),
    tanggal_akhir: Joi.date().optional().messages({
        "date.base": "Tanggal akhir harus berupa tanggal yang valid"
    })
});

export const assignDiskonValidation = Joi.object({
    id_menu: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        "array.base": "ID menu harus berupa array",
        "array.min": "Minimal 1 menu harus dipilih",
        "any.required": "ID menu harus diisi"
    })
});

export const createDiskonPerMenuValidation = Joi.object({
    nama_diskon: Joi.string().min(3).max(100).required().messages({
        "string.empty": "Nama diskon tidak boleh kosong",
        "string.min": "Nama diskon minimal 3 karakter",
        "string.max": "Nama diskon maksimal 100 karakter",
        "any.required": "Nama diskon harus diisi"
    }),
    persentase_diskon: Joi.number().min(0).max(100).required().messages({
        "number.base": "Persentase diskon harus berupa angka",
        "number.min": "Persentase diskon minimal 0%",
        "number.max": "Persentase diskon maksimal 100%",
        "any.required": "Persentase diskon harus diisi"
    }),
    tanggal_awal: Joi.date().required().messages({
        "date.base": "Tanggal awal harus berupa tanggal yang valid",
        "any.required": "Tanggal awal harus diisi"
    }),
    tanggal_akhir: Joi.date().min(Joi.ref('tanggal_awal')).required().messages({
        "date.base": "Tanggal akhir harus berupa tanggal yang valid",
        "date.min": "Tanggal akhir harus setelah atau sama dengan tanggal awal",
        "any.required": "Tanggal akhir harus diisi"
    }),
    id_menu: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        "array.base": "ID menu harus berupa array",
        "array.min": "Minimal 1 menu harus dipilih",
        "any.required": "ID menu harus diisi"
    })
});
