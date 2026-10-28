const { describe, it } = require('node:test');
const assert = require('node:assert');
const webhookService = require('../src/modules/webhook/webhookService');
const webhookController = require('../src/modules/webhook/webhookController');

describe('Webhook & Payment Security (SEC-02)', () => {
  it('extractOrderCode should parse standard and alphanumeric display IDs', () => {
    assert.strictEqual(webhookService.extractOrderCode('TP-8801 GD THANH TOAN'), 'TP-8801');
    assert.strictEqual(webhookService.extractOrderCode('Chuyen tien TP8801 cho don hang'), 'TP-8801');
    assert.strictEqual(webhookService.extractOrderCode('TP-9124AB5 GD'), 'TP-9124AB5');
    assert.strictEqual(webhookService.extractOrderCode('KHONG CO MA DON HANG'), null);
  });

  it('handleBankTransfer should reject webhook when secret is mismatched', async () => {
    process.env.WEBHOOK_SECRET = 'super_secret_webhook_key_2026';
    let statusCode = null;
    let jsonBody = null;

    const req = {
      headers: { 'x-api-key': 'wrong_secret' },
      query: {},
      body: {}
    };
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

    await webhookController.handleBankTransfer(req, res, () => {});
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(jsonBody.success, false);
    delete process.env.WEBHOOK_SECRET;
  });

  it('simulateTransfer should be blocked in production environment', async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    let statusCode = null;
    let jsonBody = null;

    const req = {
      body: { display_id: 'TP-9999' }
    };
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

    await webhookController.simulateTransfer(req, res, () => {});
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonBody.success, false);

    process.env.NODE_ENV = prevEnv;
  });
});

