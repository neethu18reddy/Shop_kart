# 🛍️ ShopKart — Full Stack Engineering Labs

Complete implementation for **Engineering Lab 01 (Backend)** and **Engineering Lab 02 (Frontend)**.

---

## 📁 Repository Overview

```
Project 1/
├── backend/                  # Lab 01 — Customer Authentication Service (Node/Express/MongoDB/JWT)
│   ├── controllers/
│   │   └── customer.controller.js
│   ├── models/
│   │   └── customer.model.js
│   ├── routes/
│   │   └── customer.routes.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── test-suite.js         # Automated test suite (18/18 tests passed)
│   ├── viva_prep_guide.md    # Lab 01 Viva Q&A Guide
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── frontend/                 # Lab 02 — Login → Home Flow (React/Vite/React Router/Axios)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Register.jsx  # /register page with validation & auto-redirect
│   │   │   ├── Login.jsx     # /login page with credentials & error handling
│   │   │   └── Home.jsx      # /home protected profile dashboard
│   │   ├── components/
│   │   │   └── Navbar.jsx    # Sticky navigation with logout
│   │   ├── services/
│   │   │   └── api.js        # Axios instance configured with withCredentials: true
│   │   ├── App.jsx           # React Router DOM configuration
│   │   ├── index.css         # Modern responsive UI design
│   │   └── main.jsx
│   ├── viva_prep_lab2.md     # Lab 02 Viva Q&A Guide
│   └── package.json
│
└── package.json              # Root helper scripts
```

---

## 🚀 How to Run the Full Application

### 1. Start the Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```
*Backend runs at `http://localhost:5000`.*

### 2. Start the Frontend Application (Terminal 2)
```bash
cd frontend
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 🎓 Viva Preparation Guides

- **Lab 01 (Backend Viva):** See [`backend/viva_prep_guide.md`](./backend/viva_prep_guide.md)
- **Lab 02 (Frontend Viva):** See [`frontend/viva_prep_lab2.md`](./frontend/viva_prep_lab2.md)
