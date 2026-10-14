# 🎓 ShopKart Frontend Lab 02 — Viva Preparation Guide & Answers

This guide contains the exact, high-scoring answers for all TA Viva questions for **Engineering Lab 02 (ShopKart: Login → Home Flow)**.

---

## 📌 Top 5 Mandatory TA Viva Questions for Lab 02

---

### Q1: Why do we use `withCredentials: true` in Axios / Fetch?
> **Answer:**
> - By default, web browsers block Cross-Origin Resource Sharing (CORS) requests from sending or receiving credentials (like **HttpOnly cookies** or authorization headers) between different origins (e.g., frontend running on `http://localhost:5173` and backend on `http://localhost:5000`).
> - Setting `withCredentials: true` on our Axios instance instructs the browser to:
>   1. **Capture & Store:** Automatically save the `Set-Cookie` header sent back by the backend upon login.
>   2. **Include on Requests:** Automatically attach that stored HttpOnly cookie to every subsequent cross-origin request (such as `GET /customers/me` or `POST /customers/logout`).
> - Without `withCredentials: true`, cookies are ignored, and protected route calls like `/customers/me` will always fail with `401 Unauthorized`.

---

### Q2: Why can't JavaScript read an `HttpOnly` cookie?
> **Answer:**
> - When the backend sets a cookie with the `HttpOnly` flag (`res.cookie('token', token, { httpOnly: true })`), the browser enforces a strict security sandbox.
> - Client-side scripts running in the browser (via `document.cookie`) are completely blocked from accessing, reading, or modifying the cookie value.
> - **Security Benefit:** This is the primary defense against **Cross-Site Scripting (XSS)** attacks. Even if a malicious attacker manages to inject JavaScript into your web app, they cannot steal the user's JWT authentication token.

---

### Q3: Why is `/home` called a "protected route"?
> **Answer:**
> - `/home` is called a protected route because access is restricted exclusively to **authenticated customers**.
> - When a user navigates to `/home`, the page initiates an immediate verification request: `GET /customers/me`.
> - If the backend confirms a valid JWT session via the HttpOnly cookie, the customer's data is loaded and displayed.
> - If the token is missing, expired, or invalid (backend returns `401 Unauthorized`), the component intercepts the failure and **automatically redirects the user back to `/login`**, preventing unauthorized access to the page content.

---

### Q4: Why do we fetch `/customers/me` instead of storing the user manually in `localStorage`?
> **Answer:**
> 1. **Single Source of Truth & Real-Time Validity:** The backend database is the ultimate authority. Fetching `/customers/me` ensures the session token has not expired, been revoked, or belonged to a deleted user.
> 2. **Security Vulnerability of `localStorage`:** Storing sensitive user data or tokens in `localStorage` makes them accessible to any JavaScript on the page, leaving them vulnerable to XSS theft.
> 3. **Fresh State on Refresh:** When the user refreshes the browser, fetching `/customers/me` re-verifies session integrity immediately from the HttpOnly cookie without relying on stale client-side storage.

---

### Q5: What is the difference between Authentication and Authorization?
> **Answer:**
> | Aspect | **Authentication (AuthN)** | **Authorization (AuthZ)** |
> |---|---|---|
> | **Definition** | Verifying **WHO** you are (Identity). | Verifying **WHAT** you are allowed to do (Permissions). |
> | **Example in ShopKart** | Entering email & password at `/login` to prove you are "John Doe". | Checking if John Doe has permission to edit another customer's profile or access an admin dashboard. |
> | **Key Mechanism** | Passwords, bcrypt hashing, JWT issuance, `/customers/login`. | Role checks (e.g., `role === 'admin'`), access control policies. |
> | **HTTP Status** | `401 Unauthorized` (Not logged in / invalid credentials). | `403 Forbidden` (Logged in, but lacking permission). |

---

## 🚀 Bonus Counter-Questions TAs Frequently Ask

### Q6: What is a "Controlled Component" in React?
> **Answer:**
> - A controlled component is a form element (like `<input>`) whose value is controlled by React state (`value={formData.email}`) rather than the DOM.
> - Every change triggers an `onChange` handler that updates the state (`setFormData`), providing instantaneous validation, formatted display, and predictable state management.

### Q7: What happens in the browser during the Logout flow?
> **Answer:**
> 1. User clicks the "Logout" button.
> 2. Frontend calls `POST /customers/logout` with `withCredentials: true`.
> 3. Backend calls `res.clearCookie('token')`, instructing the browser to delete the cookie.
> 4. React clears user state (`setUser(null)`) and uses React Router's `navigate('/login')` to redirect the user to the login screen.

---

## 📋 Quick Demo Flow for TA Evaluation

1. **Step 1: Start Backend**
   ```bash
   cd backend
   npm run dev
   ```
2. **Step 2: Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   *(Opens `http://localhost:5173`)*
3. **Step 3: Registration Test (`/register`)**
   - Fill in: Full Name, Email, Password (>=6 chars), Phone.
   - Click "Create Account" -> Shows green success alert and redirects to `/login`.
4. **Step 4: Login Test (`/login`)**
   - Try wrong password -> Shows red "Invalid Credentials" alert.
   - Enter correct password -> Logs in & redirects to `/home`.
5. **Step 5: Protected Home (`/home`)**
   - Displays Customer Name, Email, Phone, and Member ID.
   - Open DevTools -> Application -> Cookies -> Show the `token` cookie with `HttpOnly` checked!
6. **Step 6: Logout Test**
   - Click "Logout" in Navbar -> Cookie cleared, redirects to `/login`.
   - Try manually entering `http://localhost:5173/home` -> Automatically redirects back to `/login`!
