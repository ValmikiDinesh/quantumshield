import { describe, it, expect } from 'vitest';
import { RazorpayService } from '../services/razorpayService';
import { PLAN_PRICES_INR } from '../controllers/billingController';

describe('Razorpay Service & Billing Architecture', () => {
  it('correctly calculates INR paise amounts for all subscription tiers', () => {
    expect(PLAN_PRICES_INR.developer.rupees).toBe(3999);
    expect(PLAN_PRICES_INR.developer.paise).toBe(399900);

    expect(PLAN_PRICES_INR.team.rupees).toBe(15999);
    expect(PLAN_PRICES_INR.team.paise).toBe(1599900);

    expect(PLAN_PRICES_INR.enterprise.rupees).toBe(39999);
    expect(PLAN_PRICES_INR.enterprise.paise).toBe(3999900);
  });

  it('generates a valid order response with receipt and currency', async () => {
    const order = await RazorpayService.createOrder({
      amountPaise: 399900,
      currency: 'INR',
      receipt: 'rcpt_test_123',
      notes: { tier: 'developer' },
    });

    expect(order.id).toMatch(/^order_/);
    expect(order.amount).toBe(399900);
    expect(order.currency).toBe('INR');
    expect(order.receipt).toBe('rcpt_test_123');
    expect(order.notes.tier).toBe('developer');
  });

  it('verifies development test signatures correctly in mock mode', () => {
    const isValid = RazorpayService.verifyPaymentSignature({
      orderId: 'order_123',
      paymentId: 'pay_test_456',
      signature: 'simulated_test_sig',
    });

    expect(isValid).toBe(true);
  });
});

