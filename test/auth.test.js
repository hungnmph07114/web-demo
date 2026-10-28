const { describe, it } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const { authenticate, optionalAuth, requireAdmin } = require('../src/middlewares/auth');

const TEST_SECRET = 'techpulse_modular_jwt_secret_key_2026';

describe('Authentication & Authorization Middlewares (SEC-04)', () => {
  it('should reject requests without Authorization header', () => {
    let statusCode = null;
    let jsonBody = null;
    const req = { headers: {} };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(body) {
        jsonBody = body;
        return this;
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authenticate(req, res, next);
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(jsonBody.success, false);
  });

  it('should accept valid JWT token and populate req.user', () => {
    const payload = { id: 10, email: 'test@techpulse.vn', role: 'customer' };
    const token = jwt.sign(payload, TEST_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    authenticate(req, res, next);
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.id, 10);
    assert.strictEqual(req.user.role, 'customer');
  });

  it('should reject invalid or expired JWT token', () => {
    let statusCode = null;
    const req = { headers: { authorization: 'Bearer invalid.token.signature' } };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json() { return this; }
    };
    let nextCalled = false;
    authenticate(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 401);
  });

  it('requireAdmin should allow admin role and reject customer role', () => {
    const adminReq = { user: { id: 1, role: 'admin' } };
    let adminNext = false;
    requireAdmin(adminReq, {}, () => { adminNext = true; });
    assert.strictEqual(adminNext, true);

    let deniedCode = null;
    const userReq = { user: { id: 2, role: 'customer' } };
    const res = {
      status(code) {
        deniedCode = code;
        return this;
      },
      json() { return this; }
    };
    let userNext = false;
    requireAdmin(userReq, res, () => { userNext = true; });
    assert.strictEqual(userNext, false);
    assert.strictEqual(deniedCode, 403);
  });
});

