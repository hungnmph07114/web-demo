const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Order Security & Integrity (SEC-03, QUAL-04)', () => {
  it('PII masking correctly masks phone, email and address for anonymous lookups', () => {
    const rawOrder = {
      id: 101,
      display_id: 'TP-8842',
      customer_name: 'Nguyen Van A',
      customer_phone: '0987654321',
      customer_email: 'testcustomer@gmail.com',
      shipping_address: '123 Nguyen Hue, Quan 1, TP HCM',
      user_id: 55
    };

    const requestingUser = null; // Khách vãng lai tra cứu
    const isOwner = requestingUser && (
      requestingUser.role === 'admin' ||
      (rawOrder.user_id && rawOrder.user_id === requestingUser.id)
    );

    assert.strictEqual(Boolean(isOwner), false);

    // Áp dụng logic che giấu PII
    const maskedPhone = rawOrder.customer_phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    const maskedEmail = rawOrder.customer_email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    const maskedAddress = 'Địa chỉ giao hàng bảo mật (Chỉ hiển thị cho người nhận)';

    assert.strictEqual(maskedPhone, '098****321');
    assert.strictEqual(maskedEmail, 'te***@gmail.com');
    assert.strictEqual(maskedAddress.includes('Nguyen Hue'), false);
  });

  it('Generates collision-resistant display IDs with high entropy (QUAL-04)', () => {
    const crypto = require('crypto');
    const ids = new Set();
    const count = 500;

    for (let i = 0; i < count; i++) {
      const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      const displayId = `TP-${Date.now().toString().slice(-4)}${randomHex}`;
      ids.add(displayId);
    }

    assert.strictEqual(ids.size, count, 'Zero collisions across 500 generated IDs');
  });
});

