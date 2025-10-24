import { PaymentIntent, Escrow, TradeOffer } from '../types';

export class PaymentService {
  static async createPaymentIntent(tradeOffer: TradeOffer): Promise<PaymentIntent> {
    // Mock payment intent creation - no Stripe integration
    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}`,
      trade_offer_id: tradeOffer.id,
      amount: tradeOffer.total_price + tradeOffer.contractor_fee,
      status: 'completed', // Auto-complete for mock
      created_at: new Date().toISOString(),
    };
    
    return paymentIntent;
  }

  static async createEscrow(tradeOffer: TradeOffer): Promise<Escrow> {
    // Mock escrow creation - no Stripe integration
    const escrow: Escrow = {
      id: `esc_${Date.now()}`,
      trade_offer_id: tradeOffer.id,
      contractor_id: tradeOffer.contractor_id,
      subcontractor_id: tradeOffer.subcontractor_id,
      total_price: tradeOffer.total_price,
      platform_fee_contractor: tradeOffer.contractor_fee,
      platform_fee_subcontractor: tradeOffer.subcontractor_fee,
      net_to_subcontractor: tradeOffer.total_price - tradeOffer.subcontractor_fee,
      status: 'funded', // Auto-fund for mock
      created_at: new Date().toISOString(),
    };
    
    return escrow;
  }

  static async releaseEscrow(escrowId: string): Promise<boolean> {
    // Mock escrow release - no Stripe integration
    console.log(`Mock releasing escrow ${escrowId}`);
    return true;
  }

  static async processPayment(paymentIntentId: string): Promise<boolean> {
    // Mock payment processing - no Stripe integration
    console.log(`Mock processing payment ${paymentIntentId}`);
    return true;
  }
}