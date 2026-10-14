# 🎓 ShopKart Lab 05 — Shopping Cart & State Management: Viva Preparation Guide

This guide contains the exact, high-scoring answers to all TA Viva questions for **Engineering Lab 05 (ShopKart: Shopping Cart — Cart State, Derived Data & Persistent APIs)**.

---

## 📌 Top 15 Mandatory TA Viva Questions & Word-for-Word Answers

---

### Q1: Why does Cart require global state management (Context API / Redux) whereas Wishlist was handled locally?
> **Answer:**
> - **Wishlist** is page-scoped: only the Wishlist page and a static heart icon need to know about saved items.
> - **Cart** is application-level global state:
>   1. The **Navbar** must display the real-time total quantity badge `Cart (5)` across every route.
>   2. The **Product Listing** and **Product Details** pages need to know if an item is in the cart, show quantity or "Add Another", and update the global cart without full-page reloads.
>   3. The **Cart Page** (`/cart`) displays the item list and computes the order summary.
>   4. The upcoming **Checkout Page** needs immediate access to the current cart snapshot.
> - Managing this through prop drilling would require passing cart state down 5–6 component levels, which makes code unmaintainable. Global state provides a single source of truth accessible anywhere via `useCart()`.

---

### Q2: What is the difference between Server State and Client/UI State in this lab?
> **Answer:**
> | State Type | Characteristics & Role in ShopKart |
> |---|---|
> | **Server State** | Persisted in MongoDB inside `customer.cart` (`product` ObjectId + `quantity`). It is asynchronous, shared across sessions/devices, and owned by the server. |
> | **Client / UI State** | In-memory React state in `CartContext`: `loading` (spinner flag), `error` message string, local quantity steppers, and transient UI transitions before network resolution. |
> - The React Context acts as an in-memory client-side cache and manager that synchronizes client actions with persistent server state.

---

### Q3: Why do we store `{ product: ObjectId, quantity: Number }` in Cart instead of a simple array of IDs like Wishlist?
> **Answer:**
> - A wishlist represents a binary preference: a product is either saved or not saved ($0$ or $1$).
> - A shopping cart represents a **transactional intent with multiplicity**: a customer can purchase multiple units of the same product.
> - Storing `{ product, quantity }` associates the product reference directly with its intended quantity in a clean subdocument schema.

---

### Q4: Why are `subtotal`, `totalUnits`, and `itemCount` NOT stored in MongoDB?
> **Answer:**
> - **Derived State Principle:** They can be calculated deterministically on-the-fly from `cartItems`:
>   - $\text{totalUnits} = \sum \text{item.quantity}$
>   - $\text{subtotal} = \sum (\text{item.quantity} \times \text{item.product.price})$
>   - $\text{itemCount} = \text{cart.length}$
> - **Prevents Stale / Inconsistent Data:** If an admin updates a product's price from \$100 to \$80, a stored subtotal in MongoDB would be stale and incorrect. By deriving subtotal dynamically at run-time, calculations are always 100% accurate.
> - **Eliminates Redundant State:** Storing derived values in separate React `useState` leads to synchronization bugs and unnecessary re-renders. We compute them using `useMemo` in `CartContext`.

---

### Q5: How does `CartContext.jsx` and the `useCart()` custom hook work?
> **Answer:**
> 1. `createContext()` creates the React context object.
> 2. `CartProvider` wraps the application tree in `App.jsx`, maintaining `cartItems`, `loading`, and `error` states, and fetching initial data via `getCart()` on mount.
> 3. Helper functions (`addItem`, `updateQuantity`, `removeItem`, `refreshCart`) wrap API calls and keep client state in sync with MongoDB.
> 4. `useCart()` is a custom hook exporting `useContext(CartContext)` with a safety check ensuring components are mounted inside `<CartProvider>`.

---

### Q6: Why did you choose React Context API over Redux Toolkit for ShopKart?
> **Answer:**
> 1. **Zero External Dependencies:** Context API is built directly into React core, reducing bundle size and build complexity.
> 2. **Right-Sized for Application Scale:** ShopKart’s state needs (auth, cart) are clean and moderate. Redux Toolkit introduces boilerplate (slices, reducers, extraReducers, dispatch) that is overkill for this scope.
> 3. **Familiarity & Readability:** Standard React hooks (`useState`, `useEffect`, `useMemo`) provide clear, readable code that matches modern React best practices.

---

### Q7: What happens if a user clicks "Add to Cart" on a product that is already in their cart?
> **Answer:**
> - Instead of adding a duplicate row, the backend detects the existing product:
>   ```javascript
>   const itemIndex = customer.cart.findIndex(item => item.product.toString() === productId);
>   if (itemIndex > -1) {
>     customer.cart[itemIndex].quantity += 1;
>   }
>   ```
> - It increments the quantity by 1 (as long as `newQuantity <= product.stock`) and returns the updated cart with status `200 OK`.
> - The cart row remains unique per product.

---

### Q8: How does stock validation work on both Frontend and Backend?
> **Answer:**
> - **Backend Validation (Mandatory for Security):** In `cart.controller.js`:
>   ```javascript
>   if (newQuantity > product.stock) {
>     return res.status(400).json({ success: false, message: `Only ${product.stock} units available in stock` });
>   }
>   ```
>   Even if a user bypasses the UI using Postman or curl, the server strictly blocks exceeding stock limits.
> - **Frontend UX:** In `CartItem.jsx`, the `[+]` button is automatically disabled when `item.quantity >= item.product.stock`, providing immediate visual feedback to the customer.

---

### Q9: What happens when the quantity is reduced to 0 or below 1?
> **Answer:**
> - In `PATCH /cart/:productId`, we enforce a minimum quantity validation:
>   ```javascript
>   if (!quantity || quantity < 1) {
>     return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
>   }
>   ```
> - In the frontend `CartItem.jsx`, the `[-]` button is disabled when `item.quantity === 1`.
> - If the user wants to remove the product, they must explicitly click the **"Remove"** button, triggering `DELETE /cart/:productId`. This prevents accidental deletions during quantity adjustments.

---

### Q10: What is the difference between Optimistic UI and Pessimistic UI updates? Which did you use?
> **Answer:**
> - **Pessimistic Updates (Implemented):** The UI waits for the backend API response to succeed before updating the displayed state or re-fetching via `refreshCart()`. This guarantees 100% accuracy with database stock and price changes.
> - **Optimistic Updates:** The UI immediately changes quantity on click before the server responds, and rolls back if the network request fails. While faster, it can cause transient display errors if stock validation fails on the backend.
> - We used reliable pessimistic updates with button loading indicators to ensure full data consistency and clear feedback.

---

### Q11: What HTTP methods and status codes are used for Cart REST APIs?
> **Answer:**
> | Operation | Endpoint | Method | Status |
> |---|---|---|---|
> | Add to Cart | `/cart/:productId` | `POST` | `200 OK` |
> | Get Current Cart | `/cart` | `GET` | `200 OK` |
> | Update Quantity | `/cart/:productId` | `PATCH` | `200 OK` |
> | Remove Item | `/cart/:productId` | `DELETE` | `200 OK` |
> | Unauthenticated Access | Any cart endpoint | `*` | `401 Unauthorized` |
> | Stock Exceeded / Invalid Qty | `/cart/:productId` | `POST` / `PATCH` | `400 Bad Request` |
> | Product Not Found / Not In Cart | `/cart/:productId` | `GET` / `DELETE` | `404 Not Found` |

---

### Q12: Why do we use `PATCH` instead of `PUT` for updating quantity?
> **Answer:**
> - **`PUT`** implies replacing the entire cart entity or resource representation.
> - **`PATCH`** represents a partial modification of an existing resource — here, we are modifying only the `quantity` field of a specific product inside the cart.

---

### Q13: What happens if a product in a user's cart is deleted by an admin or doesn't exist?
> **Answer:**
> - When `customer.cart` is populated via `.populate('cart.product')`, any deleted product resolves to `item.product = null`.
> - In `cart.controller.js` and in `CartContext.jsx`, we filter out null items:
>   ```javascript
>   const validItems = customer.cart.filter(item => item.product !== null);
>   ```
> - This prevents frontend crashes (`TypeError: Cannot read properties of null`) and maintains UI robustness.

---

### Q14: How does the Cart Page handle Loading, Error, and Empty states?
> **Answer:**
> 1. **Loading State:** While `loading === true`, displays a spinner and skeleton loading message.
> 2. **Error State:** If the fetch fails (e.g. backend down), displays the error banner with a **"Try Again"** button calling `refreshCart()`.
> 3. **Empty State:** When `cartItems.length === 0`, renders an empty cart graphic with the message *"Your cart is empty. Looks like you haven't added anything to your cart yet"* and a **"Continue Shopping"** button linking to `/products`.

---

### Q15: How are items formatted and calculated on the Cart page?
> **Answer:**
> - Each item displays:
>   - Image thumbnail, title, category, and unit price.
>   - Stock status tag (*In Stock* or *Low Stock*).
>   - Stepper: `[-]` current quantity `[+]`.
>   - Item Total: $\text{quantity} \times \text{unit price}$.
>   - Remove button (trash icon).
> - The **Order Summary** sidebar displays:
>   - Total items count.
>   - Subtotal amount formatted as currency (`$XX.XX`).
>   - Estimated Shipping (Free over \$50 or calculated).
>   - Estimated Tax (e.g. 8%).
>   - Final Total.
>   - **"Proceed to Checkout"** call to action button.

---

## ⚡ Quick 60-Second Viva Summary (Memorize This!)

> *"In Lab 05, we implemented persistent shopping cart functionality and global state management in ShopKart. On the backend, we extended the Customer Mongoose schema with a cart array storing product ObjectId references and integer quantities ($\ge 1$). We created four protected REST endpoints: `POST /cart/:productId` to add or increment items, `GET /cart` to retrieve populated items, `PATCH /cart/:productId` to update quantity with strict stock limit validation, and `DELETE /cart/:productId` to remove items.*
>
> *On the frontend, because cart data affects the Navbar counter, Product Cards, Product Details, and the Cart page simultaneously, we implemented global state management using the React Context API with `CartContext` and custom hook `useCart()`. Subtotals and item counts are derived state computed via `useMemo` to prevent stale data. The UI supports full Loading, Empty, and Error states, and all 41 test cases pass with 100% test coverage."*
