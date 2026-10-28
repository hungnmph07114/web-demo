const { describe, it } = require('node:test');
const assert = require('node:assert');
const { securityHeaders } = require('../src/middlewares/security');

describe('Security Headers & Hardening (SEC-08, SEC-10)', () => {
  it('securityHeaders middleware sets essential OWASP security headers', () => {
    const headers = {};
    const req = {};
    const res = {
      setHeader(k, v) {
        headers[k.toLowerCase()] = v;
      }
    };
    let nextCalled = false;

    securityHeaders(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(headers['x-frame-options'], 'SAMEORIGIN');
    assert.strictEqual(headers['x-xss-protection'], '1; mode=block');
    assert.strictEqual(headers['referrer-policy'], 'strict-origin-when-cross-origin');
  });

  it('sets Strict-Transport-Security in production', () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const headers = {};
    const res = {
      setHeader(k, v) {
        headers[k.toLowerCase()] = v;
      }
    };

    securityHeaders({}, res, () => {});
    assert.ok(headers['strict-transport-security']);
    assert.strictEqual(headers['strict-transport-security'], 'max-age=31536000; includeSubDomains');

    process.env.NODE_ENV = prevEnv;
  });
});

