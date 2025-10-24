import { GuaranteeClaim, GuaranteeConfig, MachineryBookingRequest } from '../types';

export class GuaranteeService {
  private static config: GuaranteeConfig = {
    fee_percentage: 2, // 2% of total booking cost
    max_coverage_amount: 5000, // $5000 max coverage
    terms: 'Covers minor damage, loss, or equipment malfunction up to coverage amount'
  };

  static getConfig(): GuaranteeConfig {
    return this.config;
  }

  static calculateGuaranteeFee(totalCost: number): number {
    return Math.round((totalCost * this.config.fee_percentage / 100) * 100) / 100;
  }

  static async applyGuarantee(orderId: string): Promise<boolean> {
    try {
      // Mock API call - would update booking with guarantee enabled
      console.log(`Applying guarantee to order ${orderId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error applying guarantee:', error);
      return false;
    }
  }

  static async submitClaim(
    orderId: string, 
    reason: string, 
    photoUrl?: string
  ): Promise<GuaranteeClaim | null> {
    try {
      // Mock API call - would create new guarantee claim
      const claim: GuaranteeClaim = {
        id: `claim_${Date.now()}`,
        booking_id: orderId,
        contractor_id: 'contractor_123', // Would get from context
        renter_id: 'renter_456', // Would get from booking
        reason,
        photo_url: photoUrl,
        claim_amount: this.config.max_coverage_amount,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return claim;
    } catch (error) {
      console.error('Error submitting claim:', error);
      return null;
    }
  }

  static async getGuaranteeStatus(orderId: string): Promise<string> {
    try {
      // Mock API call - would fetch guarantee status for order
      console.log(`Fetching guarantee status for order ${orderId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock response
      return 'active';
    } catch (error) {
      console.error('Error fetching guarantee status:', error);
      return 'not_requested';
    }
  }

  static async getGuaranteeClaims(): Promise<GuaranteeClaim[]> {
    try {
      // Mock API call - would fetch all guarantee claims for admin
      const mockClaims: GuaranteeClaim[] = [
        {
          id: 'claim_001',
          booking_id: 'booking_123',
          contractor_id: 'contractor_456',
          renter_id: 'renter_789',
          reason: 'Equipment malfunction caused project delay',
          claim_amount: 1200,
          status: 'pending',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'claim_002',
          booking_id: 'booking_456',
          contractor_id: 'contractor_789',
          renter_id: 'renter_123',
          reason: 'Minor damage to hydraulic system',
          photo_url: 'https://example.com/damage_photo.jpg',
          claim_amount: 800,
          status: 'approved',
          created_at: '2024-01-10T14:20:00Z',
          resolved_at: '2024-01-12T09:15:00Z',
          admin_notes: 'Claim approved - legitimate damage documented'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockClaims;
    } catch (error) {
      console.error('Error fetching guarantee claims:', error);
      return [];
    }
  }

  static async updateClaimStatus(
    claimId: string, 
    status: 'approved' | 'rejected' | 'resolved',
    adminNotes?: string
  ): Promise<boolean> {
    try {
      // Mock API call - would update claim status
      console.log(`Updating claim ${claimId} to status ${status}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error updating claim status:', error);
      return false;
    }
  }
}