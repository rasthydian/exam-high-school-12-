# API Documentation - Menu Management (Makanan & Minuman)

## Overview
Admin stan dapat melakukan CRUD (Create, Read, Update, Delete) data menu makanan dan minuman untuk stan mereka.

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication
Semua endpoint menu (kecuali GET all dan GET by ID) memerlukan:
- JWT Token di header: `Authorization: Bearer <token>`
- Role: `admin_stan`

---

## Endpoints

### 1. Create Menu (Makanan/Minuman)
**POST** `/menu`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
```
nama_masakan: string (required, min: 3, max: 100)
harga: number (required, min: 0)
jenis: string (required, enum: "makanan" | "minuman")
deskripsi: string (optional, max: 500)
foto: file (optional, image: jpeg|jpg|png|gif, max: 5MB)
```

**Example Request:**
```
POST /api/admin/menu
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Form Data:
- nama_masakan: "Nasi Goreng"
- harga: 15000
- jenis: "makanan"
- deskripsi: "Nasi goreng spesial dengan telur"
- foto: [file]
```

**Success Response (201):**
```json
{
  "message": "Menu created successfully",
  "data": {
    "id": 1,
    "nama_masakan": "Nasi Goreng",
    "harga": 15000,
    "jenis": "makanan",
    "foto": "foto-1234567890-123456789.jpg",
    "deskripsi": "Nasi goreng spesial dengan telur",
    "id_stan": 1,
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:00:00.000Z"
  }
}
```

---

### 2. Get All Menu
**GET** `/menu`

**No Authentication Required**

**Success Response (200):**
```json
{
  "message": "Success get all menu",
  "data": [
    {
      "id": 1,
      "nama_masakan": "Nasi Goreng",
      "harga": 15000,
      "jenis": "makanan",
      "foto": "foto-1234567890-123456789.jpg",
      "deskripsi": "Nasi goreng spesial dengan telur",
      "id_stan": 1,
      "stan": {
        "id": 1,
        "nama_stan": "Stan Berkah",
        "nama_pemilik": "John Doe"
      },
      "createdAt": "2026-01-22T10:00:00.000Z",
      "updatedAt": "2026-01-22T10:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Menu by My Stan
**GET** `/menu/my-stan`

**Headers:**
- `Authorization: Bearer <token>`

**Description:** Mendapatkan semua menu milik stan yang dimiliki oleh admin yang login.

**Success Response (200):**
```json
{
  "message": "Success get menu by stan",
  "data": [
    {
      "id": 1,
      "nama_masakan": "Nasi Goreng",
      "harga": 15000,
      "jenis": "makanan",
      "foto": "foto-1234567890-123456789.jpg",
      "deskripsi": "Nasi goreng spesial dengan telur",
      "id_stan": 1,
      "stan": {
        "id": 1,
        "nama_stan": "Stan Berkah",
        "nama_pemilik": "John Doe"
      },
      "createdAt": "2026-01-22T10:00:00.000Z",
      "updatedAt": "2026-01-22T10:00:00.000Z"
    }
  ]
}
```

---

### 4. Get Menu by ID
**GET** `/menu/:id`

**No Authentication Required**

**Example Request:**
```
GET /api/admin/menu/1
```

**Success Response (200):**
```json
{
  "message": "Success get menu",
  "data": {
    "id": 1,
    "nama_masakan": "Nasi Goreng",
    "harga": 15000,
    "jenis": "makanan",
    "foto": "foto-1234567890-123456789.jpg",
    "deskripsi": "Nasi goreng spesial dengan telur",
    "id_stan": 1,
    "stan": {
      "id": 1,
      "nama_stan": "Stan Berkah",
      "nama_pemilik": "John Doe"
    },
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "Menu not found"
}
```

---

### 5. Update Menu
**PUT** `/menu/:id`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data) - All fields are optional:**
```
nama_masakan: string (optional, min: 3, max: 100)
harga: number (optional, min: 0)
jenis: string (optional, enum: "makanan" | "minuman")
deskripsi: string (optional, max: 500)
foto: file (optional, image: jpeg|jpg|png|gif, max: 5MB)
```

**Example Request:**
```
PUT /api/admin/menu/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Form Data:
- harga: 17000
- deskripsi: "Nasi goreng spesial dengan telur dan ayam"
```

**Success Response (200):**
```json
{
  "message": "Menu updated successfully",
  "data": {
    "id": 1,
    "nama_masakan": "Nasi Goreng",
    "harga": 17000,
    "jenis": "makanan",
    "foto": "foto-1234567890-123456789.jpg",
    "deskripsi": "Nasi goreng spesial dengan telur dan ayam",
    "id_stan": 1,
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:05:00.000Z"
  }
}
```

**Error Response (403):**
```json
{
  "message": "Forbidden: You can only update your own stan's menu"
}
```

---

### 6. Delete Menu
**DELETE** `/menu/:id`

**Headers:**
- `Authorization: Bearer <token>`

**Example Request:**
```
DELETE /api/admin/menu/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "message": "Menu deleted successfully"
}
```

**Error Response (403):**
```json
{
  "message": "Forbidden: You can only delete your own stan's menu"
}
```

**Error Response (404):**
```json
{
  "message": "Menu not found"
}
```

---

## Error Responses

### Validation Errors (400)
```json
{
  "message": "Validation Error",
  "errors": [
    {
      "field": "nama_masakan",
      "message": "Nama masakan/minuman minimal 3 karakter"
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
  "message": "Forbidden: You can only update your own stan's menu"
}
```

### Not Found (404)
```json
{
  "message": "Stan not found. Please create a stan first."
}
```

### Internal Server Error (500)
```json
{
  "message": "Internal Server Error"
}
```

---

## Notes

1. **Foto Upload**: 
   - Field name: `foto`
   - Accepted formats: JPEG, JPG, PNG, GIF
   - Max size: 5MB
   - Files saved to: `/uploads` directory
   - Access foto: `http://localhost:3000/uploads/<filename>`

2. **Authorization**:
   - Admin stan hanya bisa create, update, dan delete menu milik stan mereka sendiri
   - Sistem akan otomatis memeriksa kepemilikan stan berdasarkan token

3. **Jenis Menu**:
   - `makanan`: untuk item makanan
   - `minuman`: untuk item minuman

4. **Stan Requirement**:
   - Admin harus sudah memiliki stan sebelum bisa membuat menu
   - Jika belum punya stan, akan muncul error: "Stan not found. Please create a stan first."
