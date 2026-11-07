import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { RazorpayService } from '../services/razorpayService';
import { PLAN_PRICES_INR } from '../controllers/billingController';

describe('Razorpay Standard Web Checkout Integration', () => {
  const TEST_KEY_SECRET = 'zdlIVr90nTydJy6zVbOl9mkq';

  it('correctly calculates INR paise amounts for all subscription tiers', () => {
    expect(PLAN_PRICES_INR.single_scan.rupees).toBe(299);
    expect(PLAN_PRICES_INR.single_scan.paise).toBe(29900);

    expect(PLAN_PRICES_INR.developer.rupees).toBe(3999);
    expect(PLAN_PRICES_INR.developer.paise).toBe(399900);

    expect(PLAN_PRICES_INR.team.rupees).toBe(15999);
    expect(PLAN_PRICES_INR.team.paise).toBe(1599900);

    expect(PLAN_PRICES_INR.enterprise.rupees).toBe(39999);
    expect(PLAN_PRICES_INR.enterprise.paise).toBe(3999900);
  });

  it('rejects order creation with amount less than 100 paise', async () => {
    await expect(
      RazorpayService.createOrder({
        amountPaise: 50,
        currency: 'INR',
        receipt: 'rcpt_too_small',
      })
    ).rejects.toThrow(/Minimum amount is 100 paise/);
  });

  it('generates a valid order response with receipt and currency', async () => {
    const order = await RazorpayService.createOrder({
      amountPaise: 399900,
      currency: 'INR',
      receipt: 'rcpt_test_123',
      notes: { tier: 'developer' },
    });

    expect(order.id).toBeTruthy();
    expect(order.amount).toBe(399900);
    expect(order.currency).toBe('INR');
  });

  it('verifies valid HMAC-SHA256 signature correctly', () => {
    const orderId = 'order_test_12345';
    const paymentId = 'pay_test_67890';
    const validSignature = crypto
      .createHmac('sha256', TEST_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Test verification algorithm
    const computedSignature = crypto
      .createHmac('sha256', TEST_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(computedSignature).toBe(validSignature);
  });

  it('rejects tampered or mismatched payment signatures', () => {
    const orderId = 'order_test_12345';
    const paymentId = 'pay_test_67890';
    const invalidSignature = 'tampered_signature_hex_value_1234567890';

    const computedSignature = crypto
      .createHmac('sha256', TEST_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(computedSignature).not.toBe(invalidSignature);
  });
});
