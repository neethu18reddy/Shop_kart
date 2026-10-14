# 🛒 ShopKart: Customer Authentication Service (Lab 01)

A secure, production-grade Customer Authentication REST API built for ShopKart following strict **MVC Architecture** with Express.js, MongoDB/Mongoose, JWT, and HttpOnly cookies.

---

## 📁 Project Structure

```
backend/
│
├── controllers/
│   └── customer.controller.js   # Handles registration, login, profile, logout & password changes
│
├── models/
│   └── customer.model.js        # Customer Mongoose schema with bcrypt pre-save hash & methods
│
├── routes/
│   └── customer.routes.js       # Customer API route definitions
│
├── middlewares/
│   └── auth.middleware.js       # JWT & HttpOnly cookie verification middleware
│
├── utils/
│   └── generateToken.js         # Signs JWT and configures HttpOnly cookie
│
├── .env                         # Environment variables (PORT, MONGO_URI, JWT_SECRET)
├── .env.example                 # Example template for environment configuration
├── index.js                     # Server entry point, DB connection, and middleware configuration
└── package.json                 # Project dependencies and npm scripts
```

---

## ⚙️ Prerequisites & Setup

1. **Ensure MongoDB is running locally** (or provide your MongoDB Atlas URI in `.env`):
   ```bash
   mongod
   ```
2. **Navigate to the backend directory and install dependencies**:
   ```bash
   cd backend
   npm install
   ```
3. **Start the server**:
   - For Development (with auto-reload):
     ```bash
     npm run dev
     ```
   - For Production:
     ```bash
     npm start
     ```
   The server will start on `http://localhost:5000`.

---

## 🧪 Testing APIs in Postman (Demo Step-by-Step)

### 1. Register a Customer
- **Method:** `POST`
- **URL:** `http://localhost:5000/customers/register`
- **Body (`raw JSON`):**
  ```json
  {
    "fullName": "John Doe",
    "email": "john@gmail.com",
    "password": "john123",
    "phone": "9876543210"
  }
  ```
- **Expected Status:** `201 Created`
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Customer registered successfully",
    "customer": {
      "_id": "66d8...",
      "fullName": "John Doe",
      "email": "john@gmail.com",
      "phone": "9876543210"
    }
  }
  ```

---

### 2. Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/customers/login`
- **Body (`raw JSON`):**
  ```json
  {
    "email": "john@gmail.com",
    "password": "john123"
  }
  ```
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Login successful"
  }
  ```
- **Cookie:** Postman automatically stores the `token` cookie.

---

### 3. Get Authenticated Profile
- **Method:** `GET`
- **URL:** `http://localhost:5000/customers/me`
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  {
    "_id": "66d8...",
    "fullName": "John Doe",
    "email": "john@gmail.com",
    "phone": "9876543210"
  }
  ```

---

### 4. Change Password (Bonus Challenge +10 Marks)
- **Method:** `PATCH`
- **URL:** `http://localhost:5000/customers/change-password`
- **Body (`raw JSON`):**
  ```json
  {
    "oldPassword": "john123",
    "newPassword": "newsecret123"
  }
  ```
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```

---

### 5. Logout
- **Method:** `POST`
- **URL:** `http://localhost:5000/customers/logout`
- **Expected Status:** `200 OK`
- **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- After logout, trying `GET /customers/me` returns `401 Unauthorized`.
