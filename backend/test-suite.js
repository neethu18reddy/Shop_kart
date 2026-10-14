/**
 * Complete Verification Test Suite for ShopKart Labs (Lab 01 Auth, Lab 03 Products, Lab 04 Wishlist & Lab 05 Cart)
 * Uses mongodb-memory-server to run in-memory without requiring external MongoDB running.
 */
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

let mongoServer;
let server;
let baseUrl;
let authCookie = null;

const setupApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({ origin: true, credentials: true }));
  app.use('/customers', customerRoutes);
  app.use('/products', productRoutes);
  app.use('/wishlist', wishlistRoutes);
  app.use('/cart', cartRoutes);
  app.use('/orders', orderRoutes);

  app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'ShopKart API is running!' });
  });

  return app;
};

const makeRequest = (method, path, body = null, useCookie = true) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
    };

    if (body) {
      headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    if (useCookie && authCookie) {
      headers['Cookie'] = authCookie;
    }

    const req = http.request(
      `${baseUrl}${path}`,
      {
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          const cookieHeader = res.headers['set-cookie'];
          if (cookieHeader) {
            authCookie = cookieHeader[0].split(';')[0];
          }

          let json = {};
          try {
            json = JSON.parse(rawData);
          } catch (e) {
            json = { raw: rawData };
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: json,
          });
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(dataString);
    req.end();
  });
};

const runAllTests = async () => {
  console.log('🚀 Setting up In-Memory MongoDB & Test Server...');
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const app = setupApp();
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  console.log(`\n================================================================`);
  console.log(`🧪 SHOPKART LABS 01, 03, 04 & 05 — AUTOMATED EVALUATION SUITE`);
  console.log(`================================================================\n`);

  let passed = 0;
  let total = 0;

  const assertTest = (description, condition, details = '') => {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${description}`);
    } else {
      console.error(`❌ [FAIL] ${description} -> ${details}`);
    }
  };

  try {
    // ---------------- AUTH TESTS (LAB 01) ----------------
    console.log('--- 🔐 AUTHENTICATION MODULE TESTS ---');
    const health = await makeRequest('GET', '/');
    assertTest('Root Health Check (200 OK)', health.status === 200);

    const testEmail = 'customer@shopkart.com';
    const testPassword = 'password123';

    // Register missing fields
    const missingFields = await makeRequest('POST', '/customers/register', {
      fullName: 'John Doe',
      email: testEmail,
    });
    assertTest('Register: Missing fields rejected (400)', missingFields.status === 400);

    // Register short password
    const shortPass = await makeRequest('POST', '/customers/register', {
      fullName: 'John Doe',
      email: testEmail,
      password: '123',
      phone: '9876543210',
    });
    assertTest('Register: Password < 6 chars rejected (400)', shortPass.status === 400);

    // Register success
    const regSuccess = await makeRequest('POST', '/customers/register', {
      fullName: 'John Doe',
      email: testEmail,
      password: testPassword,
      phone: '9876543210',
    });
    assertTest('Register: Successful customer registration (201)', regSuccess.status === 201 && regSuccess.body.success === true);

    // Bcrypt verification in MongoDB
    const Customer = require('./models/customer.model');
    const dbCustomer = await Customer.findOne({ email: testEmail });
    assertTest('Database: Password stored as bcrypt hash ($2...)', dbCustomer?.password?.startsWith('$2'));

    // Duplicate email
    const dupReg = await makeRequest('POST', '/customers/register', {
      fullName: 'Jane Doe',
      email: testEmail,
      password: 'newpassword123',
      phone: '1234567890',
    });
    assertTest('Register: Duplicate email rejected (409)', dupReg.status === 409);

    // Invalid login
    const wrongLogin = await makeRequest('POST', '/customers/login', {
      email: testEmail,
      password: 'incorrectPassword',
    });
    assertTest('Login: Invalid credentials rejected (401)', wrongLogin.status === 401);

    // Valid login & cookie
    const loginSuccess = await makeRequest('POST', '/customers/login', {
      email: testEmail,
      password: testPassword,
    });
    assertTest('Login: Successful login returns 200 & sets HttpOnly cookie', loginSuccess.status === 200 && loginSuccess.headers['set-cookie']?.[0]?.includes('HttpOnly'));

    // Profile GET /customers/me
    const profile = await makeRequest('GET', '/customers/me', null, true);
    assertTest('Profile: /customers/me returns user profile (200)', profile.status === 200 && profile.body.email === testEmail && !('password' in profile.body));

    // ---------------- PRODUCT TESTS (LAB 03) ----------------
    console.log('\n--- 🛒 PRODUCT CATALOG & DISCOVERY TESTS ---');

    // 1. Create Product missing fields
    const missingProd = await makeRequest('POST', '/products', {
      name: 'Mechanical Keyboard',
    });
    assertTest('Products: Missing required fields rejected with status 400', missingProd.status === 400);

    // 2. Create Product invalid price <= 0
    const invalidPriceProd = await makeRequest('POST', '/products', {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard',
      price: -500,
      category: 'Electronics',
      image: 'https://example.com/kb.jpg',
      stock: 10,
    });
    assertTest('Products: Price <= 0 rejected with status 400', invalidPriceProd.status === 400);

    // 3. Create Product invalid stock < 0
    const invalidStockProd = await makeRequest('POST', '/products', {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard',
      price: 2999,
      category: 'Electronics',
      image: 'https://example.com/kb.jpg',
      stock: -5,
    });
    assertTest('Products: Stock < 0 rejected with status 400', invalidStockProd.status === 400);

    // 4. Create Product Success
    const createSuccess1 = await makeRequest('POST', '/products', {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches.',
      price: 2999,
      category: 'Electronics',
      image: 'https://example.com/keyboard.jpg',
      stock: 10,
    });
    assertTest('Products: Successfully created product with status 201', createSuccess1.status === 201 && createSuccess1.body.success === true);
    const createdId1 = createSuccess1.body.product?._id;

    // Create a 2nd product
    const createSuccess2 = await makeRequest('POST', '/products', {
      name: 'Noise Cancelling Headphones',
      description: 'Wireless over-ear headphones with active noise cancellation.',
      price: 4999,
      category: 'Electronics',
      image: 'https://example.com/headphones.jpg',
      stock: 5,
    });
    assertTest('Products: Created 2nd product with status 201', createSuccess2.status === 201);
    const createdId2 = createSuccess2.body.product?._id;

    // Create a 3rd product in different category
    const createSuccess3 = await makeRequest('POST', '/products', {
      name: 'Classic Denim Jacket',
      description: 'Regular fit cotton denim jacket.',
      price: 1999,
      category: 'Fashion',
      image: 'https://example.com/jacket.jpg',
      stock: 15,
    });
    assertTest('Products: Created 3rd product in Fashion category (201)', createSuccess3.status === 201);
    const createdId3 = createSuccess3.body.product?._id;

    // 5. Get All Products
    const allProducts = await makeRequest('GET', '/products');
    assertTest('Products: GET /products returns all products with count (200)', allProducts.status === 200 && allProducts.body.count === 3);

    // 6. Get Single Product by ID
    const singleProduct = await makeRequest('GET', `/products/${createdId1}`);
    assertTest('Products: GET /products/:id returns product details (200)', singleProduct.status === 200 && singleProduct.body.product?.name === 'Mechanical Keyboard');

    // 7. Get Single Product with Invalid ID format
    const invalidIdRes = await makeRequest('GET', '/products/invalid-id-format');
    assertTest('Products: Invalid product ID rejected with status 400', invalidIdRes.status === 400);

    // 8. Get Single Product Not Found
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const notFoundRes = await makeRequest('GET', `/products/${nonExistentId}`);
    assertTest('Products: Non-existent product ID returns status 404', notFoundRes.status === 404);

    // 9. Search Products by Name
    const searchRes = await makeRequest('GET', '/products?search=keyboard');
    assertTest('Products: Search query /products?search=keyboard returns match (200)', searchRes.status === 200 && searchRes.body.count === 1);

    // 10. Filter Products by Category
    const catRes = await makeRequest('GET', '/products?category=Electronics');
    assertTest('Products: Category filter /products?category=Electronics returns 2 items (200)', catRes.status === 200 && catRes.body.count === 2);

    // 11. Combined Search & Category Filter
    const combinedRes = await makeRequest('GET', '/products?search=headphones&category=Electronics');
    assertTest('Products: Combined search & category query returns exact match (200)', combinedRes.status === 200 && combinedRes.body.count === 1);

    // 12. Bonus Challenge: Sorting
    const sortAscRes = await makeRequest('GET', '/products?sort=price_asc');
    const isSortedAsc = sortAscRes.body.products[0].price <= sortAscRes.body.products[1].price && sortAscRes.body.products[1].price <= sortAscRes.body.products[2].price;
    assertTest('Bonus: GET /products?sort=price_asc sorts lowest to highest (200)', sortAscRes.status === 200 && isSortedAsc);

    // ---------------- WISHLIST TESTS (LAB 04) ----------------
    console.log('\n--- ❤️ WISHLIST MODULE TESTS ---');

    // Unauthenticated wishlist access (401)
    const unauthAdd = await makeRequest('POST', `/wishlist/${createdId1}`, null, false);
    assertTest('Wishlist: Unauthenticated POST /wishlist/:id rejected with status 401', unauthAdd.status === 401);

    // Add product to wishlist
    const addSuccess1 = await makeRequest('POST', `/wishlist/${createdId1}`, null, true);
    assertTest('Wishlist: POST /wishlist/:productId adds product successfully (201)', addSuccess1.status === 201 && addSuccess1.body.success === true);

    // Duplicate check
    const duplicateAdd = await makeRequest('POST', `/wishlist/${createdId1}`, null, true);
    assertTest('Wishlist: Duplicate product addition rejected with status 409 Conflict', duplicateAdd.status === 409);

    // Populate check
    const getWishlistRes = await makeRequest('GET', '/wishlist', null, true);
    assertTest('Wishlist: GET /wishlist returns populated items (200)', getWishlistRes.status === 200 && getWishlistRes.body.wishlist[0].name === 'Mechanical Keyboard');

    // Remove check
    const removeRes = await makeRequest('DELETE', `/wishlist/${createdId1}`, null, true);
    assertTest('Wishlist: DELETE /wishlist/:productId removes product (200)', removeRes.status === 200);

    // ---------------- CART TESTS (LAB 05) ----------------
    console.log('\n--- 🛒 SHOPPING CART MODULE TESTS ---');

    // 1. Unauthenticated cart requests (401)
    const unauthCartGet = await makeRequest('GET', '/cart', null, false);
    assertTest('Cart: Unauthenticated GET /cart rejected with status 401', unauthCartGet.status === 401);

    const unauthCartPost = await makeRequest('POST', `/cart/${createdId1}`, null, false);
    assertTest('Cart: Unauthenticated POST /cart/:productId rejected with status 401', unauthCartPost.status === 401);

    // 2. Add product with invalid ID format (400)
    const invalidCartId = await makeRequest('POST', '/cart/invalid-id-xyz', null, true);
    assertTest('Cart: Invalid product ID format rejected with status 400', invalidCartId.status === 400);

    // 3. Add non-existent product to cart (404)
    const notFoundCartProd = await makeRequest('POST', `/cart/${nonExistentId}`, null, true);
    assertTest('Cart: Non-existent product rejected with status 404', notFoundCartProd.status === 404);

    // 4. Add new product to cart (Task 2: initial quantity = 1)
    const addCart1 = await makeRequest('POST', `/cart/${createdId1}`, null, true);
    const addedItem1 = addCart1.body.cart?.find(item => item.product._id === createdId1 || item.product === createdId1);
    assertTest('Cart: POST /cart/:productId adds new product with quantity 1 (200)', addCart1.status === 200 && addedItem1?.quantity === 1);

    // 5. Re-adding the same product increments quantity to 2 (Task 2)
    const addCartSame = await makeRequest('POST', `/cart/${createdId1}`, null, true);
    const updatedItem1 = addCartSame.body.cart?.find(item => (item.product._id || item.product).toString() === createdId1.toString());
    assertTest('Cart: Re-adding same product increments quantity to 2 without duplicates (200)', addCartSame.status === 200 && updatedItem1?.quantity === 2);

    // 6. Add second product to cart
    const addCart2 = await makeRequest('POST', `/cart/${createdId2}`, null, true);
    assertTest('Cart: Added second product (Headphones, stock 5) with quantity 1 (200)', addCart2.status === 200 && addCart2.body.cart.length === 2);

    // 7. Get Cart API (Task 3: populates product details)
    const getCartRes = await makeRequest('GET', '/cart', null, true);
    const firstCartProd = getCartRes.body.cart?.[0]?.product;
    const isCartPopulated = firstCartProd && firstCartProd.name && firstCartProd.price;
    assertTest('Cart: GET /cart returns authenticated user cart with populated products (200)', getCartRes.status === 200 && isCartPopulated);

    // 8. Update Quantity (Task 4: PATCH /cart/:productId with valid quantity)
    const updateQtyRes = await makeRequest('PATCH', `/cart/${createdId1}`, { quantity: 4 }, true);
    const patchedItem = updateQtyRes.body.cart?.find(item => (item.product._id || item.product).toString() === createdId1.toString());
    assertTest('Cart: PATCH /cart/:productId updates quantity to 4 (200)', updateQtyRes.status === 200 && patchedItem?.quantity === 4);

    // 9. Quantity validation: Reject quantity < 1 (Task 4)
    const updateInvalidQty = await makeRequest('PATCH', `/cart/${createdId1}`, { quantity: 0 }, true);
    assertTest('Cart: Quantity < 1 rejected with status 400 Bad Request', updateInvalidQty.status === 400);

    // 10. Stock limit validation: Reject quantity > product.stock (Task 4)
    // createdId2 has stock 5 -> requesting 10 should be rejected
    const exceedStockQty = await makeRequest('PATCH', `/cart/${createdId2}`, { quantity: 10 }, true);
    assertTest('Cart: Quantity > stock rejected with status 400 Bad Request', exceedStockQty.status === 400);

    // 11. Remove product from cart (Task 5: DELETE /cart/:productId)
    const removeCartRes = await makeRequest('DELETE', `/cart/${createdId1}`, null, true);
    const remainingInCart = removeCartRes.body.cart?.some(item => (item.product._id || item.product).toString() === createdId1.toString());
    assertTest('Cart: DELETE /cart/:productId removes item from cart (200)', removeCartRes.status === 200 && !remainingInCart && removeCartRes.body.cart.length === 1);

    // 12. Removing product not in cart returns 404 (Task 5)
    const removeNonExistentCart = await makeRequest('DELETE', `/cart/${createdId1}`, null, true);
    assertTest('Cart: Removing product not in cart returns status 404', removeNonExistentCart.status === 404);

    // --- 💳 LAB 06: CHECKOUT, ORDERS & PAYMENT MODULE TESTS ---
    console.log(`\n--- 💳 CHECKOUT, ORDERS & RAZORPAY PAYMENT TESTS ---`);

    // 1. Unauthenticated request rejected (401)
    const unauthOrder = await makeRequest('POST', '/orders/create-payment-order', {
      shippingAddress: {
        fullName: 'Test User',
        phone: '9876543210',
        addressLine1: '123 Main St',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
    }, false);
    assertTest('Orders: Unauthenticated create payment order rejected with status 401', unauthOrder.status === 401);

    // 2. Empty shipping address rejected (400)
    const emptyShipping = await makeRequest('POST', '/orders/create-payment-order', {}, true);
    assertTest('Orders: Empty shipping address rejected with status 400', emptyShipping.status === 400);

    // 3. Invalid phone format rejected (400)
    const invalidPhone = await makeRequest('POST', '/orders/create-payment-order', {
      shippingAddress: {
        fullName: 'Test User',
        phone: '123',
        addressLine1: '123 Main St',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
    }, true);
    assertTest('Orders: Invalid phone format (<10 digits) rejected with status 400', invalidPhone.status === 400);

    // 4. Invalid pincode format rejected (400)
    const invalidPin = await makeRequest('POST', '/orders/create-payment-order', {
      shippingAddress: {
        fullName: 'Test User',
        phone: '9876543210',
        addressLine1: '123 Main St',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '123',
      },
    }, true);
    assertTest('Orders: Invalid pincode (!= 6 digits) rejected with status 400', invalidPin.status === 400);

    // Empty cart check: first clear cart to test rejection
    await makeRequest('DELETE', `/cart/${createdId2}`, null, true);
    const emptyCartOrder = await makeRequest('POST', '/orders/create-payment-order', {
      shippingAddress: {
        fullName: 'Sneet Sharma',
        phone: '9876543210',
        addressLine1: '123 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
      },
    }, true);
    assertTest('Orders: Empty cart checkout rejected with status 400 Bad Request', emptyCartOrder.status === 400);

    // Add items to cart for checkout
    // createdId1 (Keyboard: $2999, stock 10) -> add 2 ($5998)
    // createdId2 (Headphones: $1499, stock 5) -> add 1 ($1499)
    // Expected Total: 5998 + 1499 = $7497
    await makeRequest('POST', `/cart/${createdId1}`, null, true);
    await makeRequest('PATCH', `/cart/${createdId1}`, { quantity: 2 }, true);
    await makeRequest('POST', `/cart/${createdId2}`, null, true); // qty 1

    const validShipping = {
      fullName: 'Sneet Sharma',
      phone: '9876543210',
      addressLine1: '123 MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    };

    // 5. Create Payment Order with fake total sent from frontend (must be ignored!)
    const createOrderRes = await makeRequest('POST', '/orders/create-payment-order', {
      shippingAddress: validShipping,
      totalAmount: 1, // Fake total - server must ignore and calculate real total: 10997 (2999*2 + 4999)
    }, true);

    const createdShopOrderId = createOrderRes.body.shopKartOrderId;
    const createdRzpOrderId = createOrderRes.body.razorpayOrderId;
    const orderData = createOrderRes.body.order;

    assertTest(
      'Orders: POST /orders/create-payment-order calculates server total & creates snapshot (200)',
      createOrderRes.status === 200 &&
      createdShopOrderId &&
      createdRzpOrderId &&
      orderData.totalAmount === 10997 &&
      createOrderRes.body.amount === 1099700 && // In paise
      orderData.items.length === 2 &&
      orderData.items[0].name &&
      orderData.items[0].price &&
      orderData.status === 'PENDING_PAYMENT'
    );

    // 6. Verify cart remains untouched before payment verification
    const cartBeforePayment = await makeRequest('GET', '/cart', null, true);
    assertTest(
      'Orders: Cart remains untouched before payment verification (not cleared prematurely)',
      cartBeforePayment.body.cart.length === 2
    );

    // 7. Verify payment with fake/invalid signature rejected (400)
    const fakeSigRes = await makeRequest('POST', '/orders/verify-payment', {
      shopKartOrderId: createdShopOrderId,
      razorpay_order_id: createdRzpOrderId,
      razorpay_payment_id: 'pay_fake123',
      razorpay_signature: 'fake_tampered_signature_hex',
    }, true);
    assertTest('Orders: Payment verification with fake signature rejected with status 400', fakeSigRes.status === 400);

    // Cart must still be intact after failed verification
    const cartAfterFailedSig = await makeRequest('GET', '/cart', null, true);
    assertTest('Orders: Cart preserved when payment verification fails', cartAfterFailedSig.body.cart.length === 2);

    // 8. Generate valid HMAC-SHA256 signature and verify payment
    const secret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_razorpay_secret_key_2026';
    const testPaymentId = 'pay_test_valid_12345';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${createdRzpOrderId}|${testPaymentId}`)
      .digest('hex');

    const verifySuccessRes = await makeRequest('POST', '/orders/verify-payment', {
      shopKartOrderId: createdShopOrderId,
      razorpay_order_id: createdRzpOrderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: validSignature,
    }, true);

    assertTest(
      'Orders: Valid signature verifies payment & marks order PAID / PLACED (200)',
      verifySuccessRes.status === 200 &&
      verifySuccessRes.body.order?.paymentStatus === 'PAID' &&
      verifySuccessRes.body.order?.status === 'PLACED' &&
      verifySuccessRes.body.order?.razorpayPaymentId === testPaymentId
    );

    // 9. Confirm user cart is cleared in database after verified payment
    const cartAfterSuccess = await makeRequest('GET', '/cart', null, true);
    assertTest(
      'Orders: User cart cleared in database only after verified payment',
      cartAfterSuccess.body.cart.length === 0
    );

    // 10. Confirm product stock was properly decremented
    const prod1After = await makeRequest('GET', `/products/${createdId1}`);
    // initial stock was 10, ordered 2 -> remaining should be 8
    assertTest(
      'Orders: Product stock decremented after verified purchase (10 - 2 = 8)',
      prod1After.body.product.stock === 8
    );

    // 11. GET /orders returns user order history (newest first)
    const getOrdersRes = await makeRequest('GET', '/orders', null, true);
    assertTest(
      'Orders: GET /orders returns authenticated user order history (200)',
      getOrdersRes.status === 200 &&
      getOrdersRes.body.orders.length >= 1 &&
      getOrdersRes.body.orders[0]._id.toString() === createdShopOrderId.toString()
    );

    // 12. GET /orders/:id returns single order
    const singleOrderRes = await makeRequest('GET', `/orders/${createdShopOrderId}`, null, true);
    assertTest(
      'Orders: GET /orders/:id returns single order details (200)',
      singleOrderRes.status === 200 &&
      singleOrderRes.body.order._id.toString() === createdShopOrderId.toString()
    );

    // 13. Prevent another user from accessing this order (IDOR protection)
    const originalAuthCookie = authCookie;
    await makeRequest('POST', '/customers/register', {
      fullName: 'Second Customer',
      email: 'second_user@shopkart.com',
      password: 'password123',
      phone: '9123456789',
    }, false);

    // Log in as second user to set second user cookie
    await makeRequest('POST', '/customers/login', {
      email: 'second_user@shopkart.com',
      password: 'password123',
    }, false);

    // Attempt to access first user's order with second user's cookie
    const otherUserAccess = await makeRequest('GET', `/orders/${createdShopOrderId}`, null, true);
    assertTest(
      'Orders: Unauthorized access to another user order rejected with status 403 Forbidden',
      otherUserAccess.status === 403
    );

    // Restore original user's auth cookie
    authCookie = originalAuthCookie;

    // 14. Bonus: PATCH /orders/:id/status updates progression
    const updateStatusRes = await makeRequest('PATCH', `/orders/${createdShopOrderId}/status`, {
      status: 'CONFIRMED',
    }, true);
    assertTest(
      'Orders: Bonus PATCH /orders/:id/status updates progression to CONFIRMED (200)',
      updateStatusRes.status === 200 && updateStatusRes.body.order.status === 'CONFIRMED'
    );

    console.log(`\n================================================================`);
    console.log(`🎯 TOTAL TEST RESULTS: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
    console.log(`================================================================\n`);

    if (passed === total) {
      console.log('🏆 ALL LAB 01, LAB 03, LAB 04, LAB 05 & LAB 06 CRITERIA MET 100%!');
    }
  } catch (error) {
    console.error('❌ Test suite failed with exception:', error);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  }
};

runAllTests();
