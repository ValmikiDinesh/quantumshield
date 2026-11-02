import crypto from 'crypto';
import { env } from '../config/env';

export interface CreateOrderParams {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export class RazorpayService {
  private static readonly API_BASE = 'https://api.razorpay.com/v1';

  /**
   * Creates an order with Razorpay REST API or returns an authenticated test order in sandbox/dev mode.
   */
  public static async createOrder(params: CreateOrderParams): Promise<RazorpayOrderResponse> {
    const isLiveKey =
      env.RAZORPAY_KEY_ID &&
      !env.RAZORPAY_KEY_ID.includes('placeholder') &&
      env.RAZORPAY_KEY_SECRET &&
      !env.RAZORPAY_KEY_SECRET.includes('placeholder');

    if (isLiveKey) {
      try {
        const credentials = Buffer.from(
          `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
        ).toString('base64');

        const res = await fetch(`${this.API_BASE}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${credentials}`,
          },
          body: JSON.stringify({
            amount: params.amountPaise,
            currency: params.currency || 'INR',
            receipt: params.receipt,
            notes: params.notes || {},
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            `Razorpay Order API failed (${res.status}): ${JSON.stringify(errData)}`
          );
        }

        return (await res.json()) as RazorpayOrderResponse;
      } catch (err: any) {
        console.error('[RazorpayService] Live Order creation error:', err.message);
        throw err;
      }
    }

    // Development / Test fallback order
    const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    return {
      id: mockOrderId,
      entity: 'order',
      amount: params.amountPaise,
      amount_paid: 0,
      amount_due: params.amountPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      status: 'created',
      attempts: 0,
      notes: params.notes || {},
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Cryptographically verifies the Razorpay payment signature (HMAC-SHA256).
   */
  public static verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    const isLiveKey =
      env.RAZORPAY_KEY_SECRET &&
      !env.RAZORPAY_KEY_SECRET.includes('placeholder');

    if (!isLiveKey) {
      // In dev mode without live secret, accept if test signature provided or dev mock prefix
      if (params.signature.startsWith('simulated_') || params.paymentId.startsWith('pay_test_')) {
        return true;
      }
    }

    try {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${params.orderId}|${params.paymentId}`)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'utf-8'),
        Buffer.from(params.signature, 'utf-8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Verifies incoming webhook payloads from Razorpay.
   */
  public static verifyWebhookSignature(body: string, signature: string, secret?: string): boolean {
    const webhookSecret = secret || env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return false;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'utf-8'),
        Buffer.from(signature, 'utf-8')
      );
    } catch {
      return false;
    }
  }
}

