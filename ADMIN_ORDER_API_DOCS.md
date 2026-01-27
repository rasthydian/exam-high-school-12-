# API Documentation - Admin Stan Order Management

## Overview
Admin Stan dapat:
1. **Melihat Semua Pesanan** - Lihat semua pesanan untuk stan mereka dengan filter bulan dan status
2. **Mengubah Status Pesanan** - Update status pesanan melalui flow: belum_dikonfirm → dimasak → diantar → sampai
3. **Rekap Pemasukan Bulanan** - Lihat total pemasukan dan statistik pesanan per bulan

## Base URL
```
http://localhost:3000/api/admin
```

## Authentication
**All endpoints require authentication as admin_stan**

**Headers Required:**
- `Authorization: Bearer <token>` (admin_stan role)
- `Content-Type: application/json`

---

## Endpoints

### 1. Get All Orders for Stan
**GET** `/orders`

**Description:**
Admin stan dapat melihat semua pesanan yang masuk ke stan mereka. Dapat difilter berdasarkan bulan/tahun dan status.

**Headers:**
- `Authorization: Bearer <token>` (admin_stan role)

**Query Parameters (Optional):**
- `month`: Filter by month (1-12)
- `year`: Filter by year (e.g., 2026)
- `status`: Filter by status (`belum_dikonfirm` | `dimasak` | `diantar` | `sampai`)

**Example Requests:**
```
GET /api/admin/orders
GET /api/admin/orders?status=belum_dikonfirm
GET /api/admin/orders?month=1&year=2026
GET /api/admin/orders?month=1&year=2026&status=dimasak
```

**Success Response (200):**
```json
{
  "message": "Success get orders for stan",
  "data": [
    {
      "id": 1,
      "tanggal": "2026-01-22T12:30:00.000Z",
      "id_stan": 1,
      "id_siswa": 1,
      "status": "belum_dikonfirm",
      "createdAt": "2026-01-22T12:30:00.000Z",
      "updatedAt": "2026-01-22T12:30:00.000Z",
      "siswa": {
        "id": 1,
        "nama_siswa": "Ahmad Rizki",
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
          "createdAt": "2026-01-22T12:30:00.000Z",
          "updatedAt": "2026-01-22T12:30:00.000Z",
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
          "id_transaksi": 1,
          "id_menu": 2,
          "qty": 1,
          "harga_beli": 5000,
          "createdAt": "2026-01-22T12:30:00.000Z",
          "updatedAt": "2026-01-22T12:30:00.000Z",
          "menu": {
            "id": 2,
            "nama_masakan": "Es Teh Manis",
            "harga": 5000,
            "jenis": "minuman",
            "foto": "foto-456.jpg"
          }
        }
      ],
      "total_harga": 30500
    },
    {
      "id": 2,
      "tanggal": "2026-01-21T10:00:00.000Z",
      "id_stan": 1,
      "id_siswa": 2,
      "status": "sampai",
      "createdAt": "2026-01-21T10:00:00.000Z",
      "updatedAt": "2026-01-21T11:00:00.000Z",
      "siswa": {
        "id": 2,
        "nama_siswa": "Budi Santoso",
        "alamat": "Jl. Sudirman No. 5",
        "telp": "081234567898"
      },
      "detail_transaksi": [
        {
          "id": 3,
          "id_transaksi": 2,
          "id_menu": 3,
          "qty": 3,
          "harga_beli": 10000,
          "createdAt": "2026-01-21T10:00:00.000Z",
          "updatedAt": "2026-01-21T10:00:00.000Z",
          "menu": {
            "id": 3,
            "nama_masakan": "Mie Goreng",
            "harga": 10000,
            "jenis": "makanan",
            "foto": "foto-789.jpg"
          }
        }
      ],
      "total_harga": 30000
    }
  ]
}
```

**Notes:**
- Orders diurutkan dari yang terbaru (descending by tanggal)
- `total_harga` adalah jumlah dari semua `(harga_beli × qty)` dalam detail_transaksi
- `harga_beli` sudah include diskon jika ada

**Error Response (404):**
```json
{
  "message": "Stan not found for this admin"
}
```

---

### 2. Get Order by ID
**GET** `/orders/:id`

**Description:**
Admin stan dapat melihat detail pesanan tertentu. Hanya bisa melihat pesanan yang masuk ke stan mereka.

**Headers:**
- `Authorization: Bearer <token>` (admin_stan role)

**Example Request:**
```
GET /api/admin/orders/1
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
    "siswa": {
      "id": 1,
      "nama_siswa": "Ahmad Rizki",
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
        "createdAt": "2026-01-22T12:30:00.000Z",
        "updatedAt": "2026-01-22T12:30:00.000Z",
        "menu": {
          "id": 1,
          "nama_masakan": "Nasi Goreng",
          "harga": 15000,
          "jenis": "makanan",
          "foto": "foto-123.jpg",
          "deskripsi": "Nasi goreng spesial dengan telur dan ayam"
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
  "message": "Order not found or does not belong to your stan"
}
```

---

### 3. Update Order Status
**PUT** `/orders/:id/status`

**Description:**
Admin stan dapat mengubah status pesanan. Status flow: belum_dikonfirm → dimasak → diantar → sampai

**Headers:**
- `Authorization: Bearer <token>` (admin_stan role)
- `Content-Type: application/json`

**Body:**
```json
{
  "status": "dimasak"
}
```

**Validation:**
- `status`: string (required) - Must be one of: `belum_dikonfirm`, `dimasak`, `diantar`, `sampai`

**Example Request:**
```
PUT /api/admin/orders/1/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

Body:
{
  "status": "dimasak"
}
```

**Success Response (200):**
```json
{
  "message": "Order status updated successfully",
  "data": {
    "id": 1,
    "tanggal": "2026-01-22T12:30:00.000Z",
    "id_stan": 1,
    "id_siswa": 1,
    "status": "dimasak",
    "createdAt": "2026-01-22T12:30:00.000Z",
    "updatedAt": "2026-01-22T12:40:00.000Z",
    "siswa": {
      "id": 1,
      "nama_siswa": "Ahmad Rizki",
      "alamat": "Jl. Merdeka No. 10",
      "telp": "081234567899"
    },
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
        "createdAt": "2026-01-22T12:30:00.000Z",
        "updatedAt": "2026-01-22T12:30:00.000Z",
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
  }
}
```

**Error Responses:**

**Validation Error (400):**
```json
{
  "message": "Validation Error",
  "errors": [
    {
      "field": "status",
      "message": "Status must be one of: belum_dikonfirm, dimasak, diantar, sampai"
    }
  ]
}
```

**Order Not Found (404):**
```json
{
  "message": "Order not found or does not belong to your stan"
}
```

---

### 4. Get Monthly Income Recap
**GET** `/income/monthly`

**Description:**
Admin stan dapat melihat rekap pemasukan dan statistik pesanan per bulan. Default menggunakan bulan dan tahun saat ini.

**Headers:**
- `Authorization: Bearer <token>` (admin_stan role)

**Query Parameters (Optional):**
- `month`: Month (1-12). Default: current month
- `year`: Year (e.g., 2026). Default: current year

**Example Requests:**
```
GET /api/admin/income/monthly
GET /api/admin/income/monthly?month=1&year=2026
GET /api/admin/income/monthly?month=12&year=2025
```

**Success Response (200):**
```json
{
  "message": "Success get monthly income recap",
  "data": {
    "bulan": 1,
    "tahun": 2026,
    "nama_stan": "Stan Berkah",
    "rekap": {
      "total_pesanan": 15,
      "total_pemasukan": 450000,
      "pesanan_belum_dikonfirm": 3,
      "pesanan_dimasak": 4,
      "pesanan_diantar": 2,
      "pesanan_sampai": 6
    }
  }
}
```

**Response Fields:**
- `bulan`: Month number (1-12)
- `tahun`: Year
- `nama_stan`: Name of the stan
- `rekap.total_pesanan`: Total number of orders for the month
- `rekap.total_pemasukan`: Total income from all orders (in Rupiah)
- `rekap.pesanan_belum_dikonfirm`: Count of orders with status `belum_dikonfirm`
- `rekap.pesanan_dimasak`: Count of orders with status `dimasak`
- `rekap.pesanan_diantar`: Count of orders with status `diantar`
- `rekap.pesanan_sampai`: Count of orders with status `sampai`

**Error Response (404):**
```json
{
  "message": "Stan not found for this admin"
}
```

---

## Order Status Flow

Admin stan bertanggung jawab mengupdate status pesanan sesuai dengan progress pembuatan dan pengantaran:

```
belum_dikonfirm → dimasak → diantar → sampai
```

| Status | Kapan Digunakan | Aksi Admin |
|--------|-----------------|------------|
| `belum_dikonfirm` | Pesanan baru masuk | Review pesanan, konfirmasi ketersediaan menu |
| `dimasak` | Setelah konfirmasi | Mulai memasak pesanan |
| `diantar` | Makanan siap | Kirim pesanan ke siswa |
| `sampai` | Pesanan diterima siswa | Pesanan selesai |

**Best Practice:**
- Update status secara real-time agar siswa bisa tracking pesanan
- Jangan skip status (harus berurutan)
- Status `sampai` artinya transaksi sudah selesai

---

## Use Cases

### Use Case 1: Melihat Pesanan Baru
```
1. Login sebagai admin_stan
2. GET /api/admin/orders?status=belum_dikonfirm
3. Review pesanan yang perlu dikonfirmasi
```

### Use Case 2: Memproses Pesanan (Update Status)
```
1. GET /api/admin/orders?status=belum_dikonfirm
2. Pilih pesanan yang akan diproses
3. PUT /api/admin/orders/1/status
   Body: { "status": "dimasak" }
4. Setelah masakan siap:
   PUT /api/admin/orders/1/status
   Body: { "status": "diantar" }
5. Setelah sampai ke siswa:
   PUT /api/admin/orders/1/status
   Body: { "status": "sampai" }
```

### Use Case 3: Melihat Rekap Bulan Ini
```
1. Login sebagai admin_stan
2. GET /api/admin/income/monthly
3. Lihat total pemasukan dan breakdown status pesanan
```

### Use Case 4: Melihat Rekap Bulan Tertentu
```
1. Login sebagai admin_stan
2. GET /api/admin/income/monthly?month=12&year=2025
3. Analisis performa stan di bulan Desember 2025
```

### Use Case 5: Filter Pesanan Berdasarkan Bulan dan Status
```
1. Login sebagai admin_stan
2. GET /api/admin/orders?month=1&year=2026&status=dimasak
3. Lihat pesanan yang sedang dimasak di bulan Januari
```

---

## Business Logic Notes

1. **Admin Stan Access:**
   - Admin hanya bisa melihat dan mengelola pesanan untuk stan mereka sendiri
   - Sistem otomatis filter berdasarkan stan yang terkait dengan user

2. **Status Update:**
   - Admin bisa mengubah status ke status manapun (tidak ada validasi urutan)
   - Untuk best practice, ikuti urutan: belum_dikonfirm → dimasak → diantar → sampai

3. **Monthly Recap:**
   - Total pemasukan dihitung dari SEMUA pesanan di bulan tersebut (semua status)
   - Termasuk pesanan yang belum selesai (belum_dikonfirm, dimasak, dll)
   - Jika ingin hanya hitung pesanan yang selesai, filter manual di aplikasi

4. **Date Range:**
   - Filter bulan/tahun menggunakan range tanggal awal sampai akhir bulan
   - Timezone: Server timezone (UTC/Indonesia)

5. **Total Harga:**
   - Dihitung dari: Σ (harga_beli × qty) untuk setiap detail_transaksi
   - `harga_beli` sudah include diskon jika siswa menggunakan diskon

---

## Testing Flow

### Complete Testing Flow
```
1. Setup - Create Admin Stan
   POST /api/user/register (role: admin_stan)
   POST /api/user/login
   POST /api/admin/stan (create stan)
   Save token

2. Setup - Create Student and Order
   POST /api/user/register (role: siswa)
   POST /api/user/login
   POST /api/student/order (create some orders)

3. View All Orders (as Admin)
   GET /api/admin/orders
   GET /api/admin/orders?status=belum_dikonfirm

4. View Order Detail
   GET /api/admin/orders/1

5. Update Order Status
   PUT /api/admin/orders/1/status
   Body: { "status": "dimasak" }
   
   PUT /api/admin/orders/1/status
   Body: { "status": "diantar" }
   
   PUT /api/admin/orders/1/status
   Body: { "status": "sampai" }

6. View Monthly Recap
   GET /api/admin/income/monthly
   GET /api/admin/income/monthly?month=1&year=2026

7. View Orders by Month
   GET /api/admin/orders?month=1&year=2026
```

---

## Error Responses

### Validation Errors (400)
```json
{
  "message": "Validation Error",
  "errors": [
    {
      "field": "status",
      "message": "Status must be one of: belum_dikonfirm, dimasak, diantar, sampai"
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

### Not Found (404)
```json
{
  "message": "Order not found or does not belong to your stan"
}
```

### Internal Server Error (500)
```json
{
  "message": "Internal Server Error"
}
```

---

## Tips for Frontend Development

1. **Order Status Badge Colors:**
   ```javascript
   const statusColors = {
     'belum_dikonfirm': '#FFA500', // Orange
     'dimasak': '#3B82F6',         // Blue
     'diantar': '#8B5CF6',         // Purple
     'sampai': '#10B981'           // Green
   };
   
   const statusLabels = {
     'belum_dikonfirm': 'Belum Dikonfirmasi',
     'dimasak': 'Sedang Dimasak',
     'diantar': 'Sedang Diantar',
     'sampai': 'Selesai'
   };
   ```

2. **Format Currency:**
   ```javascript
   const formatRupiah = (amount) => {
     return new Intl.NumberFormat('id-ID', {
       style: 'currency',
       currency: 'IDR',
       minimumFractionDigits: 0
     }).format(amount);
   };
   // Output: Rp 30.500
   ```

3. **Next Status Button:**
   ```javascript
   const getNextStatus = (currentStatus) => {
     const statusFlow = {
       'belum_dikonfirm': 'dimasak',
       'dimasak': 'diantar',
       'diantar': 'sampai',
       'sampai': null // Final status
     };
     return statusFlow[currentStatus];
   };
   ```

4. **Filter by Current Month:**
   ```javascript
   const now = new Date();
   const month = now.getMonth() + 1;
   const year = now.getFullYear();
   
   const url = `/api/admin/orders?month=${month}&year=${year}`;
   ```

5. **Monthly Income Chart:**
   ```javascript
   // Fetch data for multiple months and display in chart
   const months = [1, 2, 3, 4, 5, 6];
   const incomeData = await Promise.all(
     months.map(month => 
       fetch(`/api/admin/income/monthly?month=${month}&year=2026`)
         .then(res => res.json())
     )
   );
   ```

---

## Integration with Student API

### Flow Lengkap dari Siswa ke Admin:

1. **Siswa membuat pesanan:**
   - `POST /api/student/order`
   - Status awal: `belum_dikonfirm`

2. **Admin menerima notifikasi (via polling/websocket):**
   - `GET /api/admin/orders?status=belum_dikonfirm`

3. **Admin konfirmasi dan update status:**
   - `PUT /api/admin/orders/:id/status` → `dimasak`
   - `PUT /api/admin/orders/:id/status` → `diantar`
   - `PUT /api/admin/orders/:id/status` → `sampai`

4. **Siswa tracking pesanan:**
   - `GET /api/student/order/:id`
   - Melihat status real-time

5. **Admin lihat rekap:**
   - `GET /api/admin/income/monthly`

---

## Security Notes

1. **Admin Stan Isolation:**
   - Setiap admin hanya bisa akses pesanan untuk stan mereka
   - Sistem otomatis filter berdasarkan `id_user` → `id_stan`

2. **Token Validation:**
   - Semua endpoint membutuhkan token valid
   - Role harus `admin_stan`

3. **No Cross-Stan Access:**
   - Admin Stan A tidak bisa lihat/edit pesanan Stan B
   - Validated via middleware

---

## Future Enhancements (Optional)

1. **Real-time Notifications:**
   - Implement WebSocket untuk notifikasi real-time ke admin saat ada pesanan baru
   - Notifikasi ke siswa saat status berubah

2. **Export Rekap:**
   - Download rekap bulanan dalam format PDF/Excel
   - `GET /api/admin/income/monthly/export?month=1&year=2026&format=pdf`

3. **Dashboard Analytics:**
   - Menu terlaris
   - Peak hours
   - Average order value
   - Customer retention

4. **Bulk Status Update:**
   - Update status multiple pesanan sekaligus
   - Useful untuk batch processing

5. **Order Notes:**
   - Admin bisa tambah catatan pada pesanan
   - Komunikasi dengan siswa

---

## Changelog

### Version 1.0.0 (January 26, 2026)
- Initial release
- Get all orders with filter by month/year/status
- Get order by ID
- Update order status
- Get monthly income recap
