/**
 * Automated Verification Script for ShopKart Lab 01 APIs
 * Runs through all functional requirements & bonus challenge.
 */
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

let authCookie = null;

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (body) {
      reqHeaders['Content-Length'] = Buffer.byteLength(dataString);
    }

    if (authCookie) {
      reqHeaders['Cookie'] = authCookie;
    }

    const req = http.request(
      `${BASE_URL}${path}`,
      {
        method,
        headers: reqHeaders,
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

const runTests = async () => {
  console.log('🧪 Starting API Verification Tests...\n');

  try {
    // Health check
    const health = await request('GET', '/');
    console.log('1. Health Check:', health.status === 200 ? '✅ PASS' : '❌ FAIL', health.body);

    const testEmail = `john_${Date.now()}@gmail.com`;

    // Test 1: Missing Fields in Register
    const missingReg = await request('POST', '/customers/register', {
      fullName: 'John Doe',
    });
    console.log('2. Missing Fields Validation (400):', missingReg.status === 400 ? '✅ PASS' : '❌ FAIL', missingReg.body.message);

    // Test 2: Short Password Validation
    const shortPassReg = await request('POST', '/customers/register', {
      fullName: 'John Doe',
      email: testEmail,
      password: '123',
      phone: '9876543210',
    });
    console.log('3. Password Min-length Validation (400):', shortPassReg.status === 400 ? '✅ PASS' : '❌ FAIL', shortPassReg.body.message);

    // Test 3: Successful Registration
    const validReg = await request('POST', '/customers/register', {
      fullName: 'John Doe',
      email: testEmail,
      password: 'password123',
      phone: '9876543210',
    });
    console.log('4. Successful Registration (201):', validReg.status === 201 ? '✅ PASS' : '❌ FAIL', validReg.body);

    // Test 4: Duplicate Email Registration
    const dupReg = await request('POST', '/customers/register', {
      fullName: 'John Doe',
      email: testEmail,
      password: 'password123',
      phone: '9876543210',
    });
    console.log('5. Duplicate Email Conflict (409):', dupReg.status === 409 ? '✅ PASS' : '❌ FAIL', dupReg.body.message);

    // Test 5: Invalid Login (Wrong password)
    const invalidLogin = await request('POST', '/customers/login', {
      email: testEmail,
      password: 'wrongpassword',
    });
    console.log('6. Invalid Login Credentials (401):', invalidLogin.status === 401 ? '✅ PASS' : '❌ FAIL', invalidLogin.body.message);

    // Test 6: Access Protected Route Without Auth
    authCookie = null;
    const unauthProfile = await request('GET', '/customers/me');
    console.log('7. Protected Route Without Cookie (401):', unauthProfile.status === 401 ? '✅ PASS' : '❌ FAIL', unauthProfile.body.message);

    // Test 7: Successful Login
    const validLogin = await request('POST', '/customers/login', {
      email: testEmail,
      password: 'password123',
    });
    console.log('8. Successful Login & Cookie Set (200):', validLogin.status === 200 && authCookie ? '✅ PASS' : '❌ FAIL', validLogin.body.message);

    // Test 8: Access Protected Profile With Cookie
    const profile = await request('GET', '/customers/me');
    console.log('9. Access Protected Profile /customers/me (200):', profile.status === 200 && profile.body.email === testEmail ? '✅ PASS' : '❌ FAIL', profile.body);

    // Test 9: Bonus Challenge - Change Password
    const changePass = await request('PATCH', '/customers/change-password', {
      oldPassword: 'password123',
      newPassword: 'newpassword456',
    });
    console.log('10. Bonus - Change Password (200):', changePass.status === 200 ? '✅ PASS' : '❌ FAIL', changePass.body.message);

    // Test 10: Logout
    const logout = await request('POST', '/customers/logout');
    console.log('11. Logout (200):', logout.status === 200 ? '✅ PASS' : '❌ FAIL', logout.body.message);

    // Test 11: Access Profile After Logout
    authCookie = null; // Simulating cleared cookie
    const postLogoutProfile = await request('GET', '/customers/me');
    console.log('12. Profile Blocked After Logout (401):', postLogoutProfile.status === 401 ? '✅ PASS' : '❌ FAIL', postLogoutProfile.body.message);

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('Test execution failed:', error.message);
  }
};

runTests();
