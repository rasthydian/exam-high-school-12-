# Admin Stan - Order Management Implementation Summary

## ✅ Task Completed

Implementasi lengkap untuk fitur admin stan dalam mengelola pesanan:

1. ✅ Admin stan dapat mengkonfirmasi dan mengubah status pesanannya
2. ✅ Admin stan dapat melihat semua data pemesanan berdasarkan bulan
3. ✅ Admin stan dapat melihat rekap pemasukan perbulan

---

## 📁 Files Created/Modified

### 1. Controller - `src/controller/admin/adminController.ts`
**4 New Functions Added:**

#### a. `getOrdersForStan`
- Get all orders for admin's stan
- Filter by month, year, and status
- Returns orders with siswa info and detail_transaksi

#### b. `getOrderByIdForStan`
- Get specific order detail
- Verify order belongs to admin's stan
- Returns complete order information

#### c. `updateOrderStatus`
- Update order status
- Validates order ownership
- Supports all status: belum_dikonfirm, dimasak, diantar, sampai

#### d. `getMonthlyIncomeRecap`
- Calculate monthly income recap
- Statistics breakdown by status
- Default to current month/year if not specified

### 2. Router - `src/router/admin/admin.router.ts`
**4 New Routes Added:**

```typescript
// Order Management routes
GET    /api/admin/orders                    - Get all orders (with filters)
GET    /api/admin/orders/:id                - Get order by ID
PUT    /api/admin/orders/:id/status         - Update order status

// Income Recap route
GET    /api/admin/income/monthly            - Get monthly income recap
```

### 3. Validation - `src/validation/admin/order.validation.ts`
**New File Created:**

```typescript
export const updateOrderStatusValidation = Joi.object({
    status: Joi.string()
        .valid('belum_dikonfirm', 'dimasak', 'diantar', 'sampai')
        .required()
});
```

### 4. Documentation - `ADMIN_ORDER_API_DOCS.md`
**Comprehensive API Documentation:**
- Complete endpoint documentation
- Request/response examples
- Use cases and testing flow
- Business logic notes
- Frontend development tips

---

## 🔑 Key Features

### 1. Order Management
- **View Orders:** Admin can see all orders for their stan
- **Filter Options:**
  - By status (belum_dikonfirm, dimasak, diantar, sampai)
  - By month and year
  - Combined filters
- **Security:** Auto-filtered by stan ownership

### 2. Status Updates
- **Flexible:** Can update to any status
- **Recommended Flow:** belum_dikonfirm → dimasak → diantar → sampai
- **Real-time:** Siswa can track status changes
- **Validation:** Status must be valid enum value

### 3. Monthly Recap
- **Total Orders:** Count all orders in month
- **Total Income:** Sum of all order values
- **Status Breakdown:** Count by each status
- **Flexible Period:** Default current month or specify month/year

---

## 🎯 API Endpoints Summary

### Get All Orders
```bash
GET /api/admin/orders
GET /api/admin/orders?status=belum_dikonfirm
GET /api/admin/orders?month=1&year=2026
GET /api/admin/orders?month=1&year=2026&status=dimasak
```

**Response includes:**
- Order info (id, tanggal, status)
- Siswa info (nama, alamat, telp)
- Detail transaksi with menu info
- Calculated total_harga

### Get Order by ID
```bash
GET /api/admin/orders/1
```

**Response includes:**
- Complete order details
- Siswa information
- All menu items with descriptions
- Total calculated price

### Update Order Status
```bash
PUT /api/admin/orders/1/status
Content-Type: application/json

{
  "status": "dimasak"
}
```

**Supported Status:**
- `belum_dikonfirm` - New order, waiting confirmation
- `dimasak` - Confirmed, being prepared
- `diantar` - Ready, being delivered
- `sampai` - Delivered successfully

### Get Monthly Income Recap
```bash
GET /api/admin/income/monthly
GET /api/admin/income/monthly?month=1&year=2026
```

**Response includes:**
```json
{
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
```

---

## 🔒 Security Features

1. **Authentication Required:**
   - All endpoints require valid JWT token
   - Must have role `admin_stan`

2. **Stan Ownership:**
   - Admin can only access orders for their own stan
   - Auto-filtered by user's stan_id

3. **Order Ownership Validation:**
   - Each endpoint verifies order belongs to admin's stan
   - Returns 404 if trying to access other stan's orders

---

## 💡 Business Logic

### 1. Order Total Calculation
```typescript
total_harga = Σ (harga_beli × qty)
```
- `harga_beli` already includes discount
- Calculated on the fly for each request

### 2. Monthly Recap
- Includes ALL orders in the month (regardless of status)
- Based on `tanggal` field (order date)
- Uses server timezone

### 3. Status Flow
```
belum_dikonfirm → dimasak → diantar → sampai
```
- System allows any status change (flexible)
- Recommended to follow the flow for UX

---

## 🧪 Testing Guide

### Step 1: Create Admin Stan and Stan
```bash
# Register as admin_stan
POST /api/user/register
{
  "username": "admin1",
  "password": "password",
  "role": "admin_stan"
}

# Login
POST /api/user/login
{
  "username": "admin1",
  "password": "password"
}

# Create Stan
POST /api/admin/stan
Authorization: Bearer <token>
{
  "nama_stan": "Stan Berkah",
  "nama_pemilik": "John Doe",
  "telp": "081234567890"
}
```

### Step 2: Create Student Order
```bash
# Register and login as student
# Then create order
POST /api/student/order
Authorization: Bearer <student_token>
{
  "id_stan": 1,
  "items": [
    { "id_menu": 1, "qty": 2, "id_diskon": null }
  ]
}
```

### Step 3: Admin Manages Orders
```bash
# View new orders
GET /api/admin/orders?status=belum_dikonfirm
Authorization: Bearer <admin_token>

# Update to dimasak
PUT /api/admin/orders/1/status
Authorization: Bearer <admin_token>
{
  "status": "dimasak"
}

# Update to diantar
PUT /api/admin/orders/1/status
{
  "status": "diantar"
}

# Update to sampai
PUT /api/admin/orders/1/status
{
  "status": "sampai"
}
```

### Step 4: View Monthly Recap
```bash
# Current month recap
GET /api/admin/income/monthly
Authorization: Bearer <admin_token>

# Specific month
GET /api/admin/income/monthly?month=1&year=2026
```

---

## 📊 Example Use Cases

### Use Case 1: Morning Routine - Check New Orders
```typescript
// Admin opens dashboard in the morning
const response = await fetch('/api/admin/orders?status=belum_dikonfirm', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Shows all orders waiting confirmation
```

### Use Case 2: Processing Orders
```typescript
// 1. Confirm order
await updateStatus(orderId, 'dimasak');

// 2. When food is ready
await updateStatus(orderId, 'diantar');

// 3. When delivered
await updateStatus(orderId, 'sampai');
```

### Use Case 3: End of Month - Check Performance
```typescript
const recap = await fetch('/api/admin/income/monthly?month=1&year=2026');
// Shows total income and order statistics
```

### Use Case 4: Search Past Orders
```typescript
// Find December 2025 orders that were delivered
const orders = await fetch('/api/admin/orders?month=12&year=2025&status=sampai');
```

---

## 🎨 Frontend Integration Tips

### 1. Status Colors
```javascript
const statusConfig = {
  'belum_dikonfirm': { 
    color: '#FFA500', 
    label: 'Menunggu Konfirmasi',
    icon: '⏳'
  },
  'dimasak': { 
    color: '#3B82F6', 
    label: 'Sedang Dimasak',
    icon: '🍳'
  },
  'diantar': { 
    color: '#8B5CF6', 
    label: 'Sedang Diantar',
    icon: '🚴'
  },
  'sampai': { 
    color: '#10B981', 
    label: 'Selesai',
    icon: '✅'
  }
};
```

### 2. Quick Status Update Component
```jsx
function OrderCard({ order }) {
  const nextStatus = {
    'belum_dikonfirm': 'dimasak',
    'dimasak': 'diantar',
    'diantar': 'sampai'
  }[order.status];

  return (
    <div>
      <h3>Order #{order.id}</h3>
      <p>Status: {order.status}</p>
      {nextStatus && (
        <button onClick={() => updateStatus(order.id, nextStatus)}>
          Ubah ke {nextStatus}
        </button>
      )}
    </div>
  );
}
```

### 3. Monthly Income Chart
```javascript
// Fetch 6 months data
const months = [8, 9, 10, 11, 12, 1];
const data = await Promise.all(
  months.map(async (month) => {
    const year = month > 6 ? 2025 : 2026;
    const res = await fetch(`/api/admin/income/monthly?month=${month}&year=${year}`);
    const json = await res.json();
    return {
      month: `${year}-${month}`,
      income: json.data.rekap.total_pemasukan
    };
  })
);

// Use in Chart.js or Recharts
```

---

## ✨ Next Steps

1. **Test the endpoints** using Postman or Thunder Client
2. **Create sample data** for testing
3. **Build frontend** using the documentation
4. **Add real-time notifications** (optional enhancement)

---

## 📞 Need Help?

Check the full documentation:
- [ADMIN_ORDER_API_DOCS.md](./ADMIN_ORDER_API_DOCS.md) - Complete API reference
- [STUDENT_API_DOCS.md](./STUDENT_API_DOCS.md) - Student API (for integration)

---

## 🎉 Implementation Complete!

All required features have been successfully implemented:
✅ Order management with filters
✅ Status updates
✅ Monthly income recap
✅ Comprehensive documentation
✅ Security and validation
✅ Zero errors

Ready for testing and deployment! 🚀
