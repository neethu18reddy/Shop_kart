# 🎓 ShopKart Authentication Service — Viva Preparation Guide & Answers

This guide contains clear, concise, and technically accurate answers to all TA Viva questions for **Engineering Lab 01 (ShopKart: Customer Authentication Service)**.

---

## 📌 Top 5 Mandatory TA Viva Questions

### Q1: Why do we use bcrypt instead of encrypting passwords?
> **Answer:**
> - **Encryption is two-way (reversible):** Encrypted data can be decrypted back into plain text if the secret key is leaked or compromised. Passwords should never be reversible.
> - **Bcrypt is one-way hashing (irreversible):** A bcrypt hash cannot be mathematically reversed to retrieve the original password.
> - **Salt & Slow Hashing:** Bcrypt automatically incorporates a **salt** (random string) to prevent *rainbow table attacks* (precomputed hashes) and uses a configurable **cost/work factor** (iterations) to make brute-force and dictionary attacks computationally infeasible.

---

### Q2: What information is typically stored inside a JWT payload?
> **Answer:**
> - The payload typically stores **non-sensitive identity and authorization claims**, such as:
>   - **Subject / User Identifier:** e.g., `id: customer._id`
>   - **Roles / Permissions (if applicable):** e.g., `role: "customer"` or `role: "admin"`
>   - **Standard JWT claims:** `iat` (Issued At timestamp), `exp` (Expiration timestamp).
> - **Crucial Rule:** Sensitive data like raw passwords, credit card numbers, or confidential personal data should **never** be stored in the payload because JWT payloads are only Base64Url-encoded (not encrypted) and can be easily decoded by anyone who has the token.

---

### Q3: Why is the `HttpOnly` flag important for cookies?
> **Answer:**
> - The `httpOnly: true` flag instructs the browser that the cookie **cannot be accessed by client-side JavaScript** (e.g., via `document.cookie`).
> - This provides critical protection against **Cross-Site Scripting (XSS)** attacks. Even if an attacker executes malicious JavaScript on the web page, they cannot read or steal the authentication token stored in an HttpOnly cookie.

---

### Q4: Why should passwords never be returned to the frontend (even as hashes)?
> **Answer:**
> - Returning raw or hashed passwords creates a severe security vulnerability.
> - If password hashes are intercepted in HTTP responses or visible in browser developer tools / logs, attackers can run offline brute-force or dictionary cracking attacks using tools like Hashcat or John the Ripper.
> - Following the **Principle of Least Privilege and Information Hiding**, the client only needs to know the user's identity details (`fullName`, `email`, `phone`, `_id`), never the credential secrets.

---

### Q5: What is the purpose of authentication middleware?
> **Answer:**
> - **Separation of Concerns & Reusability:** Authentication middleware (`protect`) acts as a gatekeeper between the incoming request and protected route handlers.
> - **Token Verification & Protection:** It extracts the token from cookies (`req.cookies.token`), verifies its signature and expiration using `jwt.verify()`, retrieves the user document from MongoDB (omitting password), and attaches it to `req.user`.
> - If the token is missing, expired, or invalid, it immediately blocks the request with `401 Unauthorized` without executing downstream business logic.

---

## 🚀 Bonus / Follow-up Questions TAs Might Ask

### Q6: How does the MVC architecture apply to this project?
> **Answer:**
> - **Model (`customer.model.js`):** Defines the Mongoose schema, validation rules, bcrypt pre-save hashing, and DB operations.
> - **View:** In a REST API, the View is the JSON response sent back to the client (`res.json(...)`).
> - **Controller (`customer.controller.js`):** Contains the business logic for registering, logging in, retrieving profile, changing passwords, and error responses.
> - **Routes (`customer.routes.js`):** Defines endpoint paths and attaches appropriate middleware and controllers.

### Q7: Why do we use `sameSite: 'strict'` and `secure: process.env.NODE_ENV === 'production'`?
> **Answer:**
> - `sameSite: 'strict'` prevents the browser from sending the cookie in cross-site requests, protecting against **Cross-Site Request Forgery (CSRF)** attacks.
> - `secure: true` ensures the cookie is only transmitted over encrypted HTTPS connections in production, preventing man-in-the-middle packet sniffing.

### Q8: Why return a generic `401 Invalid credentials` message during login instead of saying "User not found" or "Incorrect password"?
> **Answer:**
> - To prevent **User Enumeration attacks**. If the API tells the attacker that an email doesn't exist vs password was wrong, attackers can harvest valid registered emails of your customers.

---

## 📋 Quick API Reference Sheet for Demo / Postman

| Method | Endpoint | Headers | Body (JSON) | Status | Protected? |
|---|---|---|---|---|---|
| **POST** | `/customers/register` | `Content-Type: application/json` | `{"fullName": "John Doe", "email": "john@gmail.com", "password": "john123", "phone": "9876543210"}` | `201 Created` | ❌ No |
| **POST** | `/customers/login` | `Content-Type: application/json` | `{"email": "john@gmail.com", "password": "john123"}` | `200 OK` (Sets cookie) | ❌ No |
| **GET** | `/customers/me` | *Cookie sent automatically* | *None* | `200 OK` | ✅ Yes |
| **PATCH** | `/customers/change-password` | `Content-Type: application/json` | `{"oldPassword": "john123", "newPassword": "newpassword123"}` | `200 OK` | ✅ Yes (Bonus) |
| **POST** | `/customers/logout` | *Cookie sent automatically* | *None* | `200 OK` (Clears cookie) | ✅ Yes |
