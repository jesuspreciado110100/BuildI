export interface GuaranteeInfo {
  fee: number;
  coverage: number;
  maxCoverage: number;
}

export interface GuaranteeClaim {
  id: string;
  rentalId: string;
  contractorId: string;
  renterId: string;
  claimAmount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submittedAt: string;
  processedAt?: string;
  photos?: string[];
}

export class RentalGuaranteeService {
  private static readonly GUARANTEE_RATE = 0.02; // 2%
  private static readonly MAX_COVERAGE = 5000; // $5,000 cap

  static calculateGuaranteeFee(budget: number): GuaranteeInfo {
    const fee = budget * this.GUARANTEE_RATE;
    const coverage = Math.min(budget, this.MAX_COVERAGE);
    
    return {
      fee,
      coverage,
      maxCoverage: this.MAX_COVERAGE
    };
  }

  static async enableGuarantee(rentalId: string, contractorId: string): Promise<boolean> {
    try {
      // Mock API call to enable guarantee
      console.log('Enabling guarantee for rental:', rentalId);
      return true;
    } catch (error) {
      console.error('Error enabling guarantee:', error);
      return false;
    }
  }

  static async getGuaranteeStatus(rentalId: string): Promise<boolean> {
    try {
      // Mock API call to check guarantee status
      return Math.random() > 0.5; // Random for demo
    } catch (error) {
      console.error('Error checking guarantee status:', error);
      return false;
    }
  }

  static async submitClaim(claim: Omit<GuaranteeClaim, 'id' | 'submittedAt' | 'status'>): Promise<GuaranteeClaim> {
    try {
      const newClaim: GuaranteeClaim = {
        ...claim,
        id: Date.now().toString(),
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      
      console.log('Submitting guarantee claim:', newClaim);
      return newClaim;
    } catch (error) {
      console.error('Error submitting claim:', error);
      throw error;
    }
  }

  static async getClaims(contractorId: string): Promise<GuaranteeClaim[]> {
    try {
      // Mock claims data
      return [
        {
          id: '1',
          rentalId: 'rental1',
          contractorId,
          renterId: 'renter1',
          claimAmount: 1200,
          description: 'Hydraulic damage to excavator',
          status: 'approved',
          submittedAt: '2024-01-15T10:00:00Z',
          processedAt: '2024-01-16T14:30:00Z'
        },
        {
          id: '2',
          rentalId: 'rental2',
          contractorId,
          renterId: 'renter2',
          claimAmount: 800,
          description: 'Minor scratches on loader',
          status: 'pending',
          submittedAt: '2024-01-20T09:15:00Z'
        }
      ];
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  }

  static async processClaimPayment(claimId: string): Promise<boolean> {
    try {
      console.log('Processing payment for claim:', claimId);
      return true;
    } catch (error) {
      console.error('Error processing claim payment:', error);
      return false;
    }
  }

  static getClaimStatusColor(status: GuaranteeClaim['status']): string {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'paid':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  }

  static getClaimStatusText(status: GuaranteeClaim['status']): string {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'paid':
        return 'Paid';
      default:
        return 'Unknown';
    }
  }
}