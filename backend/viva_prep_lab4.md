# 🎓 ShopKart Lab 04 — Wishlist Experience: Viva Preparation Guide

This guide contains the exact, high-scoring answers to all TA Viva questions for **Engineering Lab 04 (ShopKart: Wishlist — MongoDB Relationships & Protected APIs)**.

---

## 📌 Top 12 Mandatory TA Viva Questions & Word-for-Word Answers

---

### Q1: Why are we storing `ObjectId` references instead of duplicating entire Product objects in the User's wishlist?
> **Answer:**
> - **Product is the Single Source of Truth:** If an admin updates a product's price, stock, description, or image, storing only `ObjectId` references ensures the user's wishlist automatically reflects the latest real-time data without needing synchronization.
> - **Eliminates Data Duplication & Stale Data:** If we embedded `{ name, price, stock }` inside the user document, a price drop or an item going out of stock would leave the user seeing outdated information.
> - **Storage Efficiency:** An `ObjectId` is only 12 bytes, keeping the User document lightweight and compact.

---

### Q2: What does `ref: "Product"` do in the Mongoose schema?
> **Answer:**
> - `ref: "Product"` informs Mongoose which model/collection the stored `ObjectId` belongs to.
> - It acts as a foreign key hint that tells Mongoose's `.populate()` method which collection (`products`) to query when resolving the reference into a full document.

---

### Q3: What is the difference between Embedding and Referencing in MongoDB?
> **Answer:**
> | Feature | **Embedding (Subdocuments)** | **Referencing (Normalization)** |
> |---|---|---|
> | **Structure** | Nested document stored directly inside parent document. | Stores only the `ObjectId` pointing to another collection. |
> | **When to Use** | "Contains" relationships where child data belongs strictly to one parent and rarely changes independently (e.g., shipping address). | Many-to-many or shared entities where the referenced item is independently updated (e.g., Products in Wishlists/Orders). |
> | **Data Consistency**| Risk of stale/duplicated data across multiple users. | Guarantees 100% real-time consistency. |

---

### Q4: Why do we use Mongoose `populate()`?
> **Answer:**
> - `populate()` performs a client-side join in Mongoose. It reads the `ObjectId`s stored in `customer.wishlist`, queries the `products` collection behind the scenes, and replaces those IDs with the actual populated product documents.
> - We can also use field projection like `.populate({ path: 'wishlist', select: 'name price category image stock' })` to only fetch fields required by the UI.

---

### Q5: Why must all wishlist endpoints be protected with authentication middleware?
> **Answer:**
> - Wishlists are **user-specific private resources**. A customer's saved items should only be accessible, modifiable, and viewable by that specific authenticated customer.
> - The `protect` middleware ensures that only requests with a valid, unexpired JWT cookie or Bearer token can execute wishlist operations.

---

### Q6: Why should the server extract the user ID from the JWT instead of accepting `userId` from the client?
> **Answer:**
> - **Critical Security Rule (IDOR Prevention):** If the server accepted `userId` from the request body or URL (`POST /wishlist/:userId/:productId`), a malicious user could tamper with the parameter and manipulate or view another customer's wishlist (Insecure Direct Object Reference).
> - Extracting the ID cryptographically from the verified JWT (`req.user._id`) guarantees the request is authentic and cannot be spoofed.

---

### Q7: How are duplicate wishlist entries prevented, and what HTTP status is returned?
> **Answer:**
> - In `wishlist.controller.js`, before adding a product, we verify whether the `productId` already exists in the customer's array using:
>   ```javascript
>   const isAlreadyWishlisted = customer.wishlist.some(id => id.toString() === productId);
>   ```
> - If it already exists, the server immediately halts and returns **`409 Conflict`** with `{ success: false, message: "Product already in wishlist" }`.

---

### Q8: What HTTP status code is returned when attempting to remove a product not in the wishlist?
> **Answer:**
> - **`404 Not Found`** with `{ success: false, message: "Product not in wishlist" }`, because the specified resource relationship does not exist for this customer.

---

### Q9: Why should the Wishlist page fetch from the backend instead of storing it in React state/localStorage?
> **Answer:**
> 1. **Cross-Device Persistence:** The wishlist persists across devices (mobile, laptop) and survives page reloads and browser restarts because it is saved in MongoDB.
> 2. **Real-Time Inventory & Price Check:** Fetching from the backend checks if products are still in stock or have changed prices.
> 3. **Security:** `localStorage` is vulnerable to XSS and client-side tampering.

---

### Q10: Why do we need Loading, Error, and Empty states on the Wishlist page?
> **Answer:**
> - **Loading State:** Displays a spinner (`Loading your wishlist...`) so the user knows an asynchronous network call is running rather than thinking the app is broken.
> - **Error State:** Informs the user when network or server issues occur and offers a **"Try Again"** button for immediate recovery.
> - **Empty State:** When `wishlist.length === 0`, an empty screen is poor UX. We display a clean illustration with a **"Browse Products"** button to guide the user back to shopping.

---

### Q11: How does the Bonus Toggle feature work (`PATCH /wishlist/:productId/toggle`)?
> **Answer:**
> - A single atomic endpoint checks if the product is in `customer.wishlist`:
>   - If **already present**: removes the `ObjectId`, saves user, and returns `{ success: true, saved: false }`.
>   - If **not present**: pushes the `ObjectId`, saves user, and returns `{ success: true, saved: true }`.
> - This allows the frontend to toggle the heart icon seamlessly without needing separate add and remove button states.

---

### Q12: How does the Bonus Wishlist Count in the Navbar work?
> **Answer:**
> - In `Navbar.jsx`, when an authenticated user is active, it calls `GET /wishlist` to retrieve the real-time count (`res.data.count`) from the backend and renders a badge `Wishlist (3)`.
> - Whenever items are added or removed, the count automatically synchronizes with the database.

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
3. **Step 3: Test Wishlist on Product Card**
   - Open `http://localhost:5173/products`.
   - Click the **♡ Wishlist** button on any card $\rightarrow$ Button changes to `⏳ Saving...` then `♥ Wishlisted` with filled red heart.
   - Click it again $\rightarrow$ Toggles back to unsaved seamlessly!
4. **Step 4: Test Duplicate Prevention via Postman (or API)**
   - Calling `POST /wishlist/:productId` twice returns `409 Conflict`.
5. **Step 5: Open Wishlist Page (`/wishlist`)**
   - Navigate to `/wishlist` via the Navbar link.
   - Shows total saved count: *"2 products saved in your personal collection"*.
   - Each card displays large image, price in ₹, stock units, **[ View ]**, and **[ Remove ]**.
6. **Step 6: Remove an Item**
   - Click **[ Remove ]** on an item $\rightarrow$ Card disappears smoothly without a full page refresh.
7. **Step 7: Empty State**
   - Remove all items $\rightarrow$ Page transitions to the **"Your wishlist is empty ❤️"** screen with a working **[ Browse Products ]** button.
8. **Step 8: Navbar Count Badge**
   - Show the dynamic count badge next to Wishlist in the navigation bar!
