# ElectroHub - Electrical & Hardware Shop

A full-stack MERN e-commerce application for an Electrical & Hardware Shop.

## Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Payment**: Razorpay
- **Cloud Storage**: Cloudinary
- **Charts**: Recharts

## Features

### Customer Features
- Browse products with advanced filtering and search
- Product categories (Electrical & Hardware)
- Shopping cart with quantity management
- Checkout with multiple payment options (COD, Razorpay, WhatsApp)
- Order tracking
- Customer account with order history
- WhatsApp ordering
- Product reviews and ratings
- Responsive design

### Admin Features
- Dashboard with sales analytics charts
- Product management (CRUD)
- Order management with status updates
- Customer management
- Coupon management
- Low stock alerts

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

Create `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/electrical_hardware_shop
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
WHATSAPP_NUMBER=919876543210
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Create `frontend/.env`:
```
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_WHATSAPP_NUMBER=919876543210
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Run Development Server

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

### Demo Accounts

**Admin:**
- Email: admin@electricalshop.com
- Password: admin123

**Customer:**
- Email: rahul@example.com
- Password: customer123

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- PUT /api/auth/profile
- PUT /api/auth/change-password
- POST /api/auth/address
- PUT /api/auth/address/:id
- DELETE /api/auth/address/:id

### Products
- GET /api/products
- GET /api/products/featured
- GET /api/products/best-sellers
- GET /api/products/new-arrivals
- GET /api/products/:slug
- POST /api/products (admin)
- PUT /api/products/:id (admin)
- DELETE /api/products/:id (admin)

### Categories
- GET /api/categories
- POST /api/categories (admin)
- PUT /api/categories/:id (admin)
- DELETE /api/categories/:id (admin)

### Cart
- GET /api/cart
- POST /api/cart/add
- PUT /api/cart/item/:productId
- DELETE /api/cart/item/:productId
- DELETE /api/cart/clear

### Orders
- POST /api/orders
- GET /api/orders/my-orders
- GET /api/orders/:id
- GET /api/orders/admin (admin)
- PUT /api/orders/:id/status (admin)
- PUT /api/orders/:id/cancel

### Reviews
- GET /api/reviews/product/:productId
- POST /api/reviews/product/:productId
- PUT /api/reviews/:id
- DELETE /api/reviews/:id

### Coupons
- POST /api/coupons/validate
- GET /api/coupons (admin)
- POST /api/coupons (admin)
- PUT /api/coupons/:id (admin)
- DELETE /api/coupons/:id (admin)

### Dashboard
- GET /api/dashboard (admin)

### Payments
- POST /api/payments/create-order
- POST /api/payments/verify

## Project Structure

```
shopwebsite/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seeds/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── common/
    │   │   └── layout/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   │   └── admin/
    │   ├── utils/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Production Deployment

### Backend (Render/Railway/Heroku)
1. Push code to GitHub
2. Create new project on hosting platform
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables
4. Configure API proxy

### MongoDB
Use MongoDB Atlas for production database.

## License

MIT
