export interface PricingCalculation {
  basePrice: number;
  finalPrice: number;
  netToRenter: number;
  platformFeeTotal: number;
  contractorFee: number;
  renterFee: number;
}

export class CommissionPricingService {
  private static readonly TOTAL_COMMISSION_RATE = 0.10; // 10%
  private static readonly CONTRACTOR_FEE_RATE = 0.03; // 3%
  private static readonly RENTER_FEE_RATE = 0.07; // 7%

  /**
   * Calculate pricing with invisible commission
   * @param basePrice - Original price from machinery owner
   * @returns Complete pricing breakdown
   */
  static calculatePricing(basePrice: number): PricingCalculation {
    const finalPrice = basePrice * (1 + this.TOTAL_COMMISSION_RATE);
    const netToRenter = basePrice * (1 - this.RENTER_FEE_RATE);
    const platformFeeTotal = basePrice * this.TOTAL_COMMISSION_RATE;
    const contractorFee = basePrice * this.CONTRACTOR_FEE_RATE;
    const renterFee = basePrice * this.RENTER_FEE_RATE;

    return {
      basePrice,
      finalPrice: Math.round(finalPrice * 100) / 100,
      netToRenter: Math.round(netToRenter * 100) / 100,
      platformFeeTotal: Math.round(platformFeeTotal * 100) / 100,
      contractorFee: Math.round(contractorFee * 100) / 100,
      renterFee: Math.round(renterFee * 100) / 100
    };
  }

  /**
   * Get final price shown to contractor (includes commission)
   */
  static getFinalPrice(basePrice: number): number {
    return Math.round(basePrice * (1 + this.TOTAL_COMMISSION_RATE) * 100) / 100;
  }

  /**
   * Get net payout to machinery owner (commission deducted)
   */
  static getNetToRenter(basePrice: number): number {
    return Math.round(basePrice * (1 - this.RENTER_FEE_RATE) * 100) / 100;
  }

  /**
   * Get platform fee breakdown for reporting
   */
  static getCommissionBreakdown(basePrice: number, bookingId: string) {
    const calculation = this.calculatePricing(basePrice);
    return {
      booking_id: bookingId,
      contractor_fee: calculation.contractorFee,
      renter_fee: calculation.renterFee,
      total_fee: calculation.platformFeeTotal,
      created_at: new Date().toISOString()
    };
  }
}