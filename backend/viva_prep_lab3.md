# 🎓 ShopKart Lab 03 — Product Catalog & Discovery: Viva Preparation Guide

This guide contains clear, concise, and high-scoring answers to all TA Viva questions for **Engineering Lab 03 (ShopKart: Product Catalog & Discovery)**.

---

## 📌 Top 8 Mandatory TA Viva Questions & Word-for-Word Answers

---

### Q1: Why should product data come from MongoDB instead of being hardcoded in React?
> **Answer:**
> - **Single Source of Truth & Real-Time Updates:** When an admin adds a product or stock changes, updating MongoDB immediately reflects across all users without rebuilding or redeploying the frontend.
> - **Scalability & Performance:** Hardcoding thousands of products in JavaScript bundles increases bundle size and download times. Storing in MongoDB allows on-demand pagination, indexing, and efficient querying.
> - **Data Integrity & Relationships:** MongoDB enforces schemas, data types (e.g. `price > 0`, `stock >= 0`), and enables future relational features like carts and orders.

---

### Q2: What is the difference between a URL parameter and a query parameter?
> **Answer:**
> | Aspect | **URL Parameter (Route Param)** | **Query Parameter** |
> |---|---|---|
> | **Syntax** | `/products/:id` (e.g., `/products/66d123abc456`) | `/products?category=Electronics&search=keyboard` |
> | **Purpose** | Identifies a **specific individual resource**. | Used for **filtering, searching, sorting, or paginating** a collection. |
> | **Requirement** | Mandatory part of the route path. | Optional modifier; omitting them returns default results. |
> | **React Hook** | `useParams()` | `useSearchParams()` or URL query parsing. |

---

### Q3: When would you use `/products/:id` vs `/products?category=Electronics`?
> **Answer:**
> - Use **`/products/:id`** when you want to retrieve and view the detailed specifications of **one exact product**.
> - Use **`/products?category=Electronics`** when you want to filter and display a **list/subset of multiple products** belonging to a specific category.

---

### Q4: How does `.map()` help us render products dynamically?
> **Answer:**
> - `.map()` is a non-mutating JavaScript array method that iterates through the `products` array returned by the API and transforms each product JSON object into a JSX `<ProductCard key={product._id} product={product} />`.
> - By passing the unique `product._id` as the **`key` prop**, React's Virtual DOM can efficiently track, re-render, and update individual cards when data changes.

---

### Q5: Why do we need Loading, Error, and Empty states in a frontend application?
> **Answer:**
> - **Loading State (`loading = true`):** Provides immediate visual feedback (e.g. spinner/skeleton) so users know an asynchronous network request is in progress rather than thinking the app is frozen.
> - **Error State (`error != null`):** Gracefully informs the user when a network failure or server crash occurs, offering recovery actions like a "Try Again" button instead of crashing with a blank white screen.
> - **Empty State (`products.length === 0`):** Clearly explains that the query returned 0 matches (e.g., "No products found") and provides a call-to-action like "Reset Filters".

---

### Q6: What happens when the backend returns an empty array `[]`?
> **Answer:**
> - The HTTP response is still a successful `200 OK` with `{ success: true, count: 0, products: [] }`.
> - In React, `products.map()` will simply execute 0 times and render nothing.
> - Because we check `if (products.length === 0)`, our UI cleanly transitions to the **Empty State** component explaining that no items matched the user's search.

---

### Q7: Why should search & filtering be handled by the backend instead of filtering a huge dataset only in React?
> **Answer:**
> 1. **Memory & Bandwidth Efficiency:** Transferring 100,000 products to the client browser consumes massive bandwidth and can crash mobile browsers. Backend filtering only transmits the relevant matching results.
> 2. **Database Indexing:** MongoDB uses B-tree indexes and regex/text indexes to filter millions of records in milliseconds.
> 3. **Pagination & Security:** Backend querying pairs naturally with server-side pagination (`limit` & `skip`) to deliver fast responses.

---

### Q8: Why should API/service logic be separated from UI components (`api.js` vs `.jsx`)?
> **Answer:**
> - **Separation of Concerns:** UI components focus exclusively on presentation, user interactions, and state, while service files (`api.js`) handle network configurations, base URLs, headers, and endpoints.
> - **Reusability & Maintainability:** If the API endpoint changes from `/products` to `/v1/products`, we only update `api.js` once rather than modifying dozens of React components.
> - **Centralized Configuration:** Enables global settings like `withCredentials: true` and interceptors in one place.

---

## 🚀 Bonus Challenge (+10 Marks): How Sorting is Implemented

### Q9: How does the sorting query parameter work?
> **Answer:**
> - The client sends `GET /products?sort=price_asc` (lowest to highest) or `GET /products?sort=price_desc` (highest to lowest).
> - In `product.controller.js`, we dynamically map the `sort` query parameter to Mongoose sort objects:
>   - `price_asc` $\rightarrow$ `.sort({ price: 1 })`
>   - `price_desc` $\rightarrow$ `.sort({ price: -1 })`
>   - `newest` $\rightarrow$ `.sort({ createdAt: -1 })`

---

## 📋 Quick Demo Flow for TA Evaluation

1. **Step 1: Run Backend**
   ```bash
   cd backend
   npm run dev
   ```
2. **Step 2: Run Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
3. **Step 3: Open Product Discovery**
   - Navigate to `http://localhost:5173/products`.
   - Show dynamic products rendered from MongoDB with images, prices in ₹, stock counts, and categories.
4. **Step 4: Search & Category Filter Demo**
   - Type `"Keyboard"` in the search bar $\rightarrow$ Instant filter to Mechanical Keyboard.
   - Select `"Fashion"` category from the dropdown $\rightarrow$ Shows Denim Jacket and Backpack.
   - Select `"Price: Low to High"` $\rightarrow$ Shows products sorted ascendingly.
5. **Step 5: Product Details Demo**
   - Click **"View Details"** on any product.
   - Show URL transition to `/products/:id` (e.g. `/products/66d123...`).
   - Show large image, description, stock status, and working "Back to Products" button.
6. **Step 6: States Demo**
   - Type `"xyznonexistent"` in search $\rightarrow$ Shows **"No products found"** empty state with Reset button.
