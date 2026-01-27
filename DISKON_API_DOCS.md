# API Documentation - Discount Management System

## Overview
Admin stan dapat membuat dan mengelola diskon dengan 2 cara:
1. **Diskon General** - Buat diskon dulu, lalu assign ke menu (flexibel)
2. **Diskon Per Menu** - Buat diskon dan langsung assign ke menu dalam 1 request (cepat dan praktis)

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication
Semua endpoint diskon (kecuali GET all dan GET active) memerlukan:
- JWT Token di header: `Authorization: Bearer <token>`
- Role: `admin_stan`

---

## Endpoints

### 1. Create Diskon (General)
**POST** `/diskon`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Description:** Membuat diskon general yang nanti bisa di-assign ke menu mana saja.

**Body:**
```json
{
  "nama_diskon": "Diskon Ramadhan",
  "persentase_diskon": 20,
  "tanggal_awal": "2026-03-01",
  "tanggal_akhir": "2026-03-31"
}
```

**Validation:**
- `nama_diskon`: string (required, min: 3, max: 100)
- `persentase_diskon`: number (required, min: 0, max: 100)
- `tanggal_awal`: date (required)
- `tanggal_akhir`: date (required, harus >= tanggal_awal)

**Success Response (201):**
```json
{
  "message": "Diskon created successfully",
  "data": {
    "id": 1,
    "nama_diskon": "Diskon Ramadhan",
    "persentase_diskon": 20,
    "tanggal_awal": "2026-03-01T00:00:00.000Z",
    "tanggal_akhir": "2026-03-31T00:00:00.000Z",
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:00:00.000Z"
  }
}
```

---

### 2. Create Diskon Per Menu ⭐ NEW
**POST** `/diskon/per-menu`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Description:** Membuat diskon dan langsung assign ke menu tertentu dalam 1 request. Menu harus milik stan admin yang login.

**Body:**
```json
{
  "nama_diskon": "Promo Makan Siang",
  "persentase_diskon": 15,
  "tanggal_awal": "2026-02-01",
  "tanggal_akhir": "2026-02-28",
  "id_menu": [1, 2, 3]
}
```

**Validation:**
- `nama_diskon`: string (required, min: 3, max: 100)
- `persentase_diskon`: number (required, min: 0, max: 100)
- `tanggal_awal`: date (required)
- `tanggal_akhir`: date (required, harus >= tanggal_awal)
- `id_menu`: array of numbers (required, min: 1 item)

**Success Response (201):**
```json
{
  "message": "Diskon created and assigned to menu successfully",
  "data": {
    "id": 1,
    "nama_diskon": "Promo Makan Siang",
    "persentase_diskon": 15,
    "tanggal_awal": "2026-02-01T00:00:00.000Z",
    "tanggal_akhir": "2026-02-28T00:00:00.000Z",
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:00:00.000Z",
    "menu_diskon": [
      {
        "id": 1,
        "id_menu": 1,
        "id_diskon": 1,
        "menu": {
          "id": 1,
          "nama_masakan": "Nasi Goreng",
          "harga": 15000,
          "jenis": "makanan",
          "foto": "foto-123.jpg"
        }
      },
      {
        "id": 2,
        "id_menu": 2,
        "id_diskon": 1,
        "menu": {
          "id": 2,
          "nama_masakan": "Mie Goreng",
          "harga": 12000,
          "jenis": "makanan",
          "foto": "foto-456.jpg"
        }
      }
    ]
  }
}
```

**Error Response (403):**
```json
{
  "message": "Some menus do not belong to your stan or do not exist"
}
```

---

### 3. Get All Diskon
**GET** `/diskon`

**No Authentication Required**

**Success Response (200):**
```json
{
  "message": "Success get all diskon",
  "data": [
    {
      "id": 1,
      "nama_diskon": "Diskon Ramadhan",
      "persentase_diskon": 20,
      "tanggal_awal": "2026-03-01T00:00:00.000Z",
      "tanggal_akhir": "2026-03-31T00:00:00.000Z",
      "createdAt": "2026-01-22T10:00:00.000Z",
      "updatedAt": "2026-01-22T10:00:00.000Z",
      "menu_diskon": [
        {
          "id": 1,
          "id_menu": 1,
          "id_diskon": 1,
          "menu": {
            "id": 1,
            "nama_masakan": "Nasi Goreng",
            "harga": 15000,
            "jenis": "makanan"
          }
        }
      ]
    }
  ]
}
```

---

### 3. Get Active Diskon
**GET** `/diskon/active`

**No Authentication Required**

**Description:** Mendapatkan semua diskon yang sedang berlaku (tanggal sekarang berada di antara tanggal_awal dan tanggal_akhir).

**Success Response (200):**
```json
{
  "message": "Success get active diskon",
  "data": [
    {
      "id": 1,
      "nama_diskon": "Diskon Ramadhan",
      "persentase_diskon": 20,
      "tanggal_awal": "2026-03-01T00:00:00.000Z",
      "tanggal_akhir": "2026-03-31T00:00:00.000Z",
      "menu_diskon": [
        {
          "id": 1,
          "id_menu": 1,
          "id_diskon": 1,
          "menu": {
            "id": 1,
            "nama_masakan": "Nasi Goreng",
            "harga": 15000,
            "jenis": "makanan",
            "foto": "foto-123.jpg"
          }
        }
      ]
    }
  ]
}
```

---

### 4. Get Diskon by ID
**GET** `/diskon/:id`

**No Authentication Required**

**Example Request:**
```
GET /api/admin/diskon/1
```

**Success Response (200):**
```json
{
  "message": "Success get diskon",
  "data": {
    "id": 1,
    "nama_diskon": "Diskon Ramadhan",
    "persentase_diskon": 20,
    "tanggal_awal": "2026-03-01T00:00:00.000Z",
    "tanggal_akhir": "2026-03-31T00:00:00.000Z",
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:00:00.000Z",
    "menu_diskon": [
      {
        "id": 1,
        "id_menu": 1,
        "id_diskon": 1,
        "menu": {
          "id": 1,
          "nama_masakan": "Nasi Goreng",
          "harga": 15000,
          "jenis": "makanan",
          "foto": "foto-123.jpg",
          "deskripsi": "Nasi goreng spesial"
        }
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "message": "Diskon not found"
}
```

---

### 5. Update Diskon
**PUT** `/diskon/:id`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body (All fields are optional):**
```json
{
  "nama_diskon": "Diskon Ramadhan Special",
  "persentase_diskon": 25,
  "tanggal_awal": "2026-03-01",
  "tanggal_akhir": "2026-04-01"
}
```

**Example Request:**
```
PUT /api/admin/diskon/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Body:
{
  "persentase_diskon": 25
}
```

**Success Response (200):**
```json
{
  "message": "Diskon updated successfully",
  "data": {
    "id": 1,
    "nama_diskon": "Diskon Ramadhan",
    "persentase_diskon": 25,
    "tanggal_awal": "2026-03-01T00:00:00.000Z",
    "tanggal_akhir": "2026-03-31T00:00:00.000Z",
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:15:00.000Z"
  }
}
```

---

### 6. Delete Diskon
**DELETE** `/diskon/:id`

**Headers:**
- `Authorization: Bearer <token>`

**Example Request:**
```
DELETE /api/admin/diskon/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "message": "Diskon deleted successfully"
}
```

**Note:** Ketika diskon dihapus, semua assignment diskon ke menu juga akan otomatis terhapus.

---

### 7. Assign Diskon to Menu
**POST** `/diskon/:id/assign`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Description:** Mengaitkan diskon dengan satu atau beberapa menu. Admin hanya bisa mengaitkan diskon ke menu yang dimiliki oleh stan mereka.

**Body:**
```json
{
  "id_menu": [1, 2, 3]
}
```

**Validation:**
- `id_menu`: array of numbers (required, min: 1 item)
- Semua menu harus milik stan dari admin yang login

**Example Request:**
```
POST /api/admin/diskon/1/assign
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Body:
{
  "id_menu": [1, 2, 3]
}
```

**Success Response (200):**
```json
{
  "message": "Diskon assigned to menu successfully",
  "data": {
    "id": 1,
    "nama_diskon": "Diskon Ramadhan",
    "persentase_diskon": 20,
    "tanggal_awal": "2026-03-01T00:00:00.000Z",
    "tanggal_akhir": "2026-03-31T00:00:00.000Z",
    "menu_diskon": [
      {
        "id": 1,
        "id_menu": 1,
        "id_diskon": 1,
        "menu": {
          "id": 1,
          "nama_masakan": "Nasi Goreng",
          "harga": 15000
        }
      },
      {
        "id": 2,
        "id_menu": 2,
        "id_diskon": 1,
        "menu": {
          "id": 2,
          "nama_masakan": "Mie Goreng",
          "harga": 12000
        }
      },
      {
        "id": 3,
        "id_menu": 3,
        "id_diskon": 1,
        "menu": {
          "id": 3,
          "nama_masakan": "Es Teh",
          "harga": 5000
        }
      }
    ]
  }
}
```

**Error Response (403):**
```json
{
  "message": "Some menus do not belong to your stan or do not exist"
}
```

---

### 8. Remove Diskon from Menu
**POST** `/diskon/:id/remove`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Description:** Menghapus kaitan diskon dengan menu tertentu.

**Body:**
```json
{
  "id_menu": [1, 2]
}
```

**Example Request:**
```
POST /api/admin/diskon/1/remove
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Body:
{
  "id_menu": [1, 2]
}
```

**Success Response (200):**
```json
{
  "message": "Diskon removed from menu successfully"
}
```

**Error Response (403):**
```json
{
  "message": "Some menus do not belong to your stan or do not exist"
}
```

---

## Use Cases

### Use Case 1: Membuat Diskon Per Menu (Cara Cepat) ⭐ RECOMMENDED
```
1. Login sebagai admin_stan
2. POST /api/admin/diskon/per-menu
   Body: {
     "nama_diskon": "Promo Siang",
     "persentase_diskon": 15,
     "tanggal_awal": "2026-02-01",
     "tanggal_akhir": "2026-02-28",
     "id_menu": [1, 2, 3]
   }
3. Selesai! Diskon sudah dibuat dan langsung aktif untuk menu yang dipilih
```

### Use Case 2: Membuat Diskon General (Cara Flexible)
```
1. Login sebagai admin_stan
2. POST /api/admin/diskon - Buat diskon general dulu
3. POST /api/admin/diskon/1/assign - Assign diskon ke menu tertentu
4. Bisa assign/remove menu kapan saja
```

### Use Case 3: Melihat Menu dengan Diskon Aktif
```
1. GET /api/admin/diskon/active - Lihat semua diskon aktif
2. Response akan include menu-menu yang mendapat diskon tersebut
```

### Use Case 3: Update Periode Diskon
```
1. Login sebagai admin_stan
2. PUT /api/admin/diskon/1 - Update tanggal_awal dan tanggal_akhir
```

### Use Case 4: Menghapus Diskon
```
1. Login sebagai admin_stan
2. DELETE /api/admin/diskon/1 - Diskon dan semua assignmentnya akan terhapus
```

---

## Error Responses

### Validation Errors (400)
```json
{
  "message": "Validation Error",
  "errors": [
    {
      "field": "persentase_diskon",
      "message": "Persentase diskon maksimal 100%"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthorized"
}
```

### Forbidden (403)
```json
{
  "message": "Some menus do not belong to your stan or do not exist"
}
```

### Not Found (404)
```json
{
  "message": "Diskon not found"
}
```

### Internal Server Error (500)
```json
{
  "message": "Internal Server Error"
}
```

---

## Business Logic Notes

1. **Perhitungan Harga Diskon:**
   - Harga setelah diskon = Harga asli × (1 - persentase_diskon/100)
   - Contoh: Harga 15000, diskon 20% = 15000 × 0.8 = 12000

2. **Status Diskon:**
   - Active: tanggal sekarang berada di antara tanggal_awal dan tanggal_akhir
   - Inactive: di luar rentang tanggal tersebut

3. **Multiple Diskon:**
   - Satu menu bisa memiliki beberapa diskon (jika ada overlap tanggal)
   - Frontend/siswa bisa memilih diskon mana yang ingin digunakan
   - Atau sistem bisa otomatis mengambil diskon terbesar

4. **Ownership:**
   - Admin stan hanya bisa assign diskon ke menu milik stan mereka sendiri
   - Sistem otomatis validasi kepemilikan berdasarkan JWT token

5. **Cascade Delete:**
   - Ketika diskon dihapus, semua menu_diskon terkait juga otomatis terhapus
   - Menu tetap ada, hanya hubungan diskonnya yang hilang

---

## Testing Flow

### Flow 1: Quick Test (Diskon Per Menu)
```
1. Setup
   POST /api/user/register (role: admin_stan)
   POST /api/user/login
   POST /api/admin/stan (buat stan)
   POST /api/admin/menu (buat beberapa menu)

2. Create Diskon Per Menu (All-in-One)
   POST /api/admin/diskon/per-menu
   Body: {
     "nama_diskon": "Flash Sale",
     "persentase_diskon": 30,
     "tanggal_awal": "2026-01-22",
     "tanggal_akhir": "2026-01-25",
     "id_menu": [1, 2]
   }

3. Verify
   GET /api/admin/diskon/active (cek diskon aktif)
   GET /api/admin/diskon/1 (lihat detail dengan menu)

4. Cleanup
   DELETE /api/admin/diskon/1
```

### Flow 2: Full Test (Diskon General)
```
1. Setup (sama seperti Flow 1)

2. Test Diskon CRUD
   POST /api/admin/diskon (buat diskon)
   GET /api/admin/diskon (lihat semua diskon)
   GET /api/admin/diskon/1 (lihat detail diskon)
   PUT /api/admin/diskon/1 (update diskon)

3. Test Assignment
   POST /api/admin/diskon/1/assign (assign ke menu)
   GET /api/admin/diskon/1 (verify assignment)
   POST /api/admin/diskon/1/remove (remove dari menu)
   GET /api/admin/diskon/1 (verify removal)

4. Test Active Diskon
   GET /api/admin/diskon/active (cek diskon yang sedang berlaku)

5. Cleanup
   DELETE /api/admin/diskon/1 (hapus diskon)
```

---

## Comparison: Diskon General vs Diskon Per Menu

| Feature | Diskon General | Diskon Per Menu |
|---------|----------------|-----------------|
| **Request** | 2 request (create + assign) | 1 request (all-in-one) |
| **Speed** | Slower | Faster ⚡ |
| **Flexibility** | High (assign/remove kapan saja) | Low (harus re-create) |
| **Use When** | Diskon untuk banyak menu yang berubah-ubah | Diskon tetap untuk menu tertentu |
| **Best For** | Campaign management | Quick promotion |

**Recommendation:** 
- Gunakan **Diskon Per Menu** untuk promo cepat dan sederhana
- Gunakan **Diskon General** untuk campaign besar yang butuh flexibility

