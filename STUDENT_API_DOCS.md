# API Documentation - Student (Siswa) Features

## Overview
Siswa dapat:
1. **Melihat Menu** - Browse menu makanan dan minuman dengan info diskon
2. **Membuat Pesanan** - Order menu dengan atau tanpa diskon
3. **Tracking Pesanan** - Lihat status dan history pesanan

## Base URL
```
http://localhost:3000/api/student
```

## Authentication
- **Public endpoints**: View menu (tidak perlu login)
- **Protected endpoints**: Create order & view orders (perlu login sebagai siswa)

---

## Endpoints

### 1. Get All Menu (Public)
**GET** `/menu`

**No Authentication Required**

**Query Parameters (Optional):**
- `jenis`: Filter by type (`makanan` | `minuman`)
- `id_stan`: Filter by stan ID

**Example Request:**
```
GET /api/student/menu
GET /api/student/menu?jenis=makanan
GET /api/student/menu?id_stan=1
GET /api/student/menu?jenis=minuman&id_stan=2
```

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
      "foto": "foto-123.jpg",
      "deskripsi": "Nasi goreng spesial dengan telur",
      "stan": {
        "id": 1,
        "nama_stan": "Stan Berkah",
        "nama_pemilik": "John Doe"
      },
      "diskon_tersedia": [
        {
          "id": 1,
          "nama_diskon": "Promo Makan Siang",
          "persentase_diskon": 15,
          "tanggal_awal": "2026-01-20T00:00:00.000Z",
          "tanggal_akhir": "2026-01-31T00:00:00.000Z"
        }
      ]
    },
    {
      "id": 2,
      "nama_masakan": "Es Teh Manis",
      "harga": 5000,
      "jenis": "minuman",
      "foto": "foto-456.jpg",
      "deskripsi": "Es teh manis segar",
      "stan": {
        "id": 1,
        "nama_stan": "Stan Berkah",
        "nama_pemilik": "John Doe"
      },
      "diskon_tersedia": []
    }
  ]
}
```

**Note:** Field `diskon_tersedia` hanya menampilkan diskon yang sedang aktif (tanggal hari ini berada dalam periode diskon).

---

### 2. Get Menu by ID (Public)
**GET** `/menu/:id`

**No Authentication Required**

**Example Request:**
```
GET /api/student/menu/1
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
    "foto": "foto-123.jpg",
    "deskripsi": "Nasi goreng spesial dengan telur dan ayam",
    "stan": {
      "id": 1,
      "nama_stan": "Stan Berkah",
      "nama_pemilik": "John Doe",
      "telp": "081234567890"
    },
    "diskon_tersedia": [
      {
        "id": 1,
        "nama_diskon": "Promo Makan Siang",
        "persentase_diskon": 15,
        "tanggal_awal": "2026-01-20T00:00:00.000Z",
        "tanggal_akhir": "2026-01-31T00:00:00.000Z",
        "createdAt": "2026-01-22T10:00:00.000Z",
        "updatedAt": "2026-01-22T10:00:00.000Z"
      }
    ]
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

### 3. Create Order (Protected - Siswa Only)
**POST** `/order`

**Headers:**
- `Authorization: Bearer <token>` (siswa role)
- `Content-Type: application/json`

**Description:** 
Siswa membuat pesanan. Dapat menggunakan diskon jika tersedia. Sistem akan validasi:
- Menu ada dan milik stan yang dipilih
- Diskon (jika digunakan) valid dan aktif
- Diskon berlaku untuk menu yang dipesan

**Body:**
```json
{
  "id_stan": 1,
  "items": [
    {
      "id_menu": 1,
      "qty": 2,
      "id_diskon": 1
    },
    {
      "id_menu": 2,
      "qty": 1,
      "id_diskon": null
    }
  ]
}
```

**Validation:**
- `id_stan`: number (required)
- `items`: array (required, min: 1)
  - `id_menu`: number (required)
  - `qty`: number (required, min: 1)
  - `id_diskon`: number (optional, null if no discount)

**Example Request:**
```
POST /api/student/order
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Body:
{
  "id_stan": 1,
  "items": [
    {
      "id_menu": 1,
      "qty": 2,
      "id_diskon": 1
    },
    {
      "id_menu": 3,
      "qty": 1,
      "id_diskon": null
    }
  ]
}
```

**Success Response (201):**
```json
{
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "tanggal": "2026-01-22T12:30:00.000Z",
    "id_stan": 1,
    "id_siswa": 1,
    "status": "belum_dikonfirm",
    "createdAt": "2026-01-22T12:30:00.000Z",
    "updatedAt": "2026-01-22T12:30:00.000Z",
    "stan": {
      "id": 1,
      "nama_stan": "Stan Berkah",
      "nama_pemilik": "John Doe"
    },
    "siswa": {
      "id": 1,
      "nama_siswa": "Ahmad"
    },
    "detail_transaksi": [
      {
        "id": 1,
        "id_transaksi": 1,
        "id_menu": 1,
        "qty": 2,
        "harga_beli": 12750,
        "menu": {
          "id": 1,
          "nama_masakan": "Nasi Goreng",
          "jenis": "makanan",
          "foto": "foto-123.jpg"
        }
      },
      {
        "id": 2,
        "id_transaksi": 1,
        "id_menu": 3,
        "qty": 1,
        "harga_beli": 5000,
        "menu": {
          "id": 3,
          "nama_masakan": "Es Teh Manis",
          "jenis": "minuman",
          "foto": "foto-789.jpg"
        }
      }
    ],
    "total_harga": 30500
  }
}
```

**Calculation Example:**
- Menu 1 (Nasi Goreng): Rp 15.000 dengan diskon 15% = Rp 12.750 × 2 = Rp 25.500
- Menu 3 (Es Teh): Rp 5.000 × 1 = Rp 5.000
- **Total: Rp 30.500**

**Error Responses:**

**Menu not found (404):**
```json
{
  "message": "Menu with ID 999 not found"
}
```

**Menu not in selected stan (400):**
```json
{
  "message": "Menu Nasi Goreng does not belong to the selected stan"
}
```

**Discount not active (400):**
```json
{
  "message": "Diskon Promo Ramadhan is not active"
}
```

**Discount not valid for menu (400):**
```json
{
  "message": "Diskon Flash Sale is not valid for menu Nasi Goreng"
}
```

---

### 4. Get My Orders (Protected - Siswa Only)
**GET** `/order`

**Headers:**
- `Authorization: Bearer <token>` (siswa role)

**Query Parameters (Optional):**
- `status`: Filter by status (`belum_dikonfirm` | `dimasak` | `diantar` | `sampai`)

**Example Request:**
```
GET /api/student/order
GET /api/student/order?status=belum_dikonfirm
GET /api/student/order?status=dimasak
```

**Success Response (200):**
```json
{
  "message": "Success get my orders",
  "data": [
    {
      "id": 1,
      "tanggal": "2026-01-22T12:30:00.000Z",
      "id_stan": 1,
      "id_siswa": 1,
      "status": "dimasak",
      "createdAt": "2026-01-22T12:30:00.000Z",
      "updatedAt": "2026-01-22T12:35:00.000Z",
      "stan": {
        "id": 1,
        "nama_stan": "Stan Berkah",
        "nama_pemilik": "John Doe",
        "telp": "081234567890"
      },
      "detail_transaksi": [
        {
          "id": 1,
          "id_transaksi": 1,
          "id_menu": 1,
          "qty": 2,
          "harga_beli": 12750,
          "menu": {
            "id": 1,
            "nama_masakan": "Nasi Goreng",
            "harga": 15000,
            "jenis": "makanan",
            "foto": "foto-123.jpg"
          }
        }
      ],
      "total_harga": 25500
    },
    {
      "id": 2,
      "tanggal": "2026-01-21T10:00:00.000Z",
      "id_stan": 2,
      "id_siswa": 1,
      "status": "sampai",
      "createdAt": "2026-01-21T10:00:00.000Z",
      "updatedAt": "2026-01-21T10:45:00.000Z",
      "stan": {
        "id": 2,
        "nama_stan": "Stan Jaya",
        "nama_pemilik": "Jane Smith",
        "telp": "081234567891"
      },
      "detail_transaksi": [
        {
          "id": 3,
          "id_transaksi": 2,
          "id_menu": 5,
          "qty": 1,
          "harga_beli": 20000,
          "menu": {
            "id": 5,
            "nama_masakan": "Mie Ayam",
            "harga": 20000,
            "jenis": "makanan",
            "foto": "foto-567.jpg"
          }
        }
      ],
      "total_harga": 20000
    }
  ]
}
```

**Note:** Orders diurutkan dari yang terbaru (descending by tanggal).

---

### 5. Get Order by ID (Protected - Siswa Only)
**GET** `/order/:id`

**Headers:**
- `Authorization: Bearer <token>` (siswa role)

**Description:** Melihat detail pesanan. Siswa hanya bisa melihat pesanan mereka sendiri.

**Example Request:**
```
GET /api/student/order/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "message": "Success get order",
  "data": {
    "id": 1,
    "tanggal": "2026-01-22T12:30:00.000Z",
    "id_stan": 1,
    "id_siswa": 1,
    "status": "dimasak",
    "createdAt": "2026-01-22T12:30:00.000Z",
    "updatedAt": "2026-01-22T12:35:00.000Z",
    "stan": {
      "id": 1,
      "nama_stan": "Stan Berkah",
      "nama_pemilik": "John Doe",
      "telp": "081234567890"
    },
    "siswa": {
      "id": 1,
      "nama_siswa": "Ahmad",
      "alamat": "Jl. Merdeka No. 10",
      "telp": "081234567899"
    },
    "detail_transaksi": [
      {
        "id": 1,
        "id_transaksi": 1,
        "id_menu": 1,
        "qty": 2,
        "harga_beli": 12750,
        "menu": {
          "id": 1,
          "nama_masakan": "Nasi Goreng",
          "harga": 15000,
          "jenis": "makanan",
          "foto": "foto-123.jpg",
          "deskripsi": "Nasi goreng spesial"
        }
      }
    ],
    "total_harga": 25500
  }
}
```

**Error Response (404):**
```json
{
  "message": "Order not found"
}
```

**Error Response (403):**
```json
{
  "message": "Forbidden: You can only view your own orders"
}
```

---

## Order Status Flow

Status pesanan mengikuti alur:

```
belum_dikonfirm → dimasak → diantar → sampai
```

| Status | Deskripsi |
|--------|-----------|
| `belum_dikonfirm` | Pesanan baru dibuat, menunggu konfirmasi stan |
| `dimasak` | Stan sudah konfirmasi, sedang dimasak |
| `diantar` | Makanan sedang diantar ke siswa |
| `sampai` | Pesanan sudah sampai ke siswa |

**Note:** Update status dilakukan oleh admin stan (bukan siswa).

---

## Use Cases

### Use Case 1: Browse Menu dan Order Tanpa Diskon
```
1. GET /api/student/menu (browse menu)
2. GET /api/student/menu/1 (lihat detail menu)
3. Login sebagai siswa
4. POST /api/student/order
   Body: {
     "id_stan": 1,
     "items": [
       { "id_menu": 1, "qty": 2, "id_diskon": null }
     ]
   }
5. GET /api/student/order (cek pesanan)
```

### Use Case 2: Order Dengan Diskon
```
1. GET /api/student/menu (lihat menu dengan diskon_tersedia)
2. Pilih menu yang ada diskonnya
3. Login sebagai siswa
4. POST /api/student/order
   Body: {
     "id_stan": 1,
     "items": [
       { "id_menu": 1, "qty": 2, "id_diskon": 1 }  // gunakan diskon
     ]
   }
5. Sistem otomatis hitung harga dengan diskon
```

### Use Case 3: Tracking Pesanan
```
1. Login sebagai siswa
2. GET /api/student/order (lihat semua pesanan)
3. GET /api/student/order?status=dimasak (filter by status)
4. GET /api/student/order/1 (lihat detail pesanan)
```

### Use Case 4: Order Multiple Items dari Stan Berbeda
**TIDAK BISA!** Satu order hanya bisa dari satu stan.

Solusi: Buat 2 order terpisah
```
Order 1:
POST /api/student/order
Body: { "id_stan": 1, "items": [...] }

Order 2:
POST /api/student/order
Body: { "id_stan": 2, "items": [...] }
```

---

## Error Responses

### Validation Errors (400)
```json
{
  "message": "Validation Error",
  "errors": [
    {
      "field": "items",
      "message": "Minimal 1 item harus dipesan"
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
  "message": "Forbidden: You can only view your own orders"
}
```

### Not Found (404)
```json
{
  "message": "Menu not found"
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

1. **Harga Diskon:**
   - `harga_beli` di detail transaksi adalah harga SETELAH diskon (jika ada)
   - Harga asli menu tetap tersimpan di tabel menu
   - Contoh: Menu Rp 15.000, diskon 15% → harga_beli = Rp 12.750

2. **Validasi Diskon:**
   - Diskon harus aktif (tanggal sekarang dalam periode diskon)
   - Diskon harus valid untuk menu yang dipesan
   - Jika validasi gagal, order ditolak

3. **Status Pesanan:**
   - Status awal selalu `belum_dikonfirm`
   - Update status dilakukan oleh admin stan (endpoint berbeda)
   - Siswa hanya bisa melihat status, tidak bisa mengubah

4. **Total Harga:**
   - Dihitung dari: Σ (harga_beli × qty) untuk setiap item
   - Sudah include diskon jika ada

5. **Ownership:**
   - Siswa hanya bisa melihat pesanan mereka sendiri
   - Sistem otomatis filter berdasarkan id_siswa dari token

---

## Testing Flow

### Complete Testing Flow
```
1. Setup
   POST /api/user/register (role: siswa)
   POST /api/user/login
   Save token

2. Browse Menu
   GET /api/student/menu
   GET /api/student/menu?jenis=makanan
   GET /api/student/menu/1

3. Create Order (Without Discount)
   POST /api/student/order
   Headers: Authorization: Bearer <token>
   Body: {
     "id_stan": 1,
     "items": [
       { "id_menu": 1, "qty": 2, "id_diskon": null }
     ]
   }

4. Create Order (With Discount)
   POST /api/student/order
   Body: {
     "id_stan": 1,
     "items": [
       { "id_menu": 1, "qty": 1, "id_diskon": 1 }
     ]
   }

5. View Orders
   GET /api/student/order
   GET /api/student/order?status=belum_dikonfirm
   GET /api/student/order/1
```

---

## Tips for Frontend Development

1. **Display Discount Badge:**
   ```javascript
   if (menu.diskon_tersedia.length > 0) {
     const maxDiscount = Math.max(...menu.diskon_tersedia.map(d => d.persentase_diskon));
     // Show badge: "Diskon hingga {maxDiscount}%"
   }
   ```

2. **Calculate Discounted Price:**
   ```javascript
   const originalPrice = menu.harga;
   const discount = selectedDiskon ? selectedDiskon.persentase_diskon : 0;
   const finalPrice = originalPrice * (1 - discount / 100);
   ```

3. **Order Status Color:**
   ```javascript
   const statusColor = {
     'belum_dikonfirm': 'yellow',
     'dimasak': 'blue',
     'diantar': 'orange',
     'sampai': 'green'
   };
   ```

4. **Disable Expired Discounts:**
   ```javascript
   const isDiscountActive = (diskon) => {
     const now = new Date();
     return now >= new Date(diskon.tanggal_awal) && 
            now <= new Date(diskon.tanggal_akhir);
   };
   ```
