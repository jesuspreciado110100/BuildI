import { InvestorPayout, PayoutLedger, Site, SiteMilestone } from '../types';

class PayoutService {
  // Mock data for demonstration
  private mockPayouts: InvestorPayout[] = [
    {
      id: '1',
      site_id: 'site_1',
      investor_id: 'investor_1',
      milestone_name: 'Foundation Complete',
      amount_paid: 15000,
      payout_due_date: '2024-01-15',
      payout_status: 'paid',
      payment_method: 'stripe',
      transaction_id: 'txn_1234567890',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      site_id: 'site_1',
      investor_id: 'investor_1',
      milestone_name: 'Structure Phase',
      amount_paid: 25000,
      payout_due_date: '2024-02-20',
      payout_status: 'paid',
      payment_method: 'stripe',
      transaction_id: 'txn_0987654321',
      timestamp: '2024-02-20T14:15:00Z'
    },
    {
      id: '3',
      site_id: 'site_1',
      investor_id: 'investor_1',
      milestone_name: 'Roofing Complete',
      amount_paid: 18000,
      payout_due_date: '2024-03-25',
      payout_status: 'pending',
      payment_method: 'stripe',
      transaction_id: undefined,
      timestamp: '2024-03-25T09:00:00Z'
    },
    {
      id: '4',
      site_id: 'site_2',
      investor_id: 'investor_1',
      milestone_name: 'Excavation Complete',
      amount_paid: 12000,
      payout_due_date: '2024-01-10',
      payout_status: 'late',
      payment_method: 'stripe',
      transaction_id: undefined,
      timestamp: '2024-01-10T08:00:00Z'
    }
  ];

  private mockSites: Site[] = [
    {
      id: 'site_1',
      name: 'Downtown Office Complex',
      location: 'Downtown',
      contractor_id: 'contractor_1',
      status: 'active',
      total_investment: 500000,
      investor_ids: ['investor_1']
    },
    {
      id: 'site_2',
      name: 'Residential Tower',
      location: 'Uptown',
      contractor_id: 'contractor_2',
      status: 'active',
      total_investment: 750000,
      investor_ids: ['investor_1']
    }
  ];

  async calculatePayouts(siteId: string, investorId: string): Promise<InvestorPayout[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return this.mockPayouts.filter(payout => 
      payout.site_id === siteId && payout.investor_id === investorId
    );
  }

  async getPayoutLedger(investorId: string): Promise<PayoutLedger> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const investorPayouts = this.mockPayouts.filter(payout => 
      payout.investor_id === investorId
    );
    
    const totalReceived = investorPayouts
      .filter(payout => payout.payout_status === 'paid')
      .reduce((sum, payout) => sum + payout.amount_paid, 0);
    
    const nextDuePayout = investorPayouts
      .filter(payout => payout.payout_status === 'pending')
      .sort((a, b) => new Date(a.payout_due_date).getTime() - new Date(b.payout_due_date).getTime())[0];
    
    const totalPayouts = investorPayouts.length;
    const completedPayouts = investorPayouts.filter(p => p.payout_status === 'paid').length;
    
    return {
      investor_id: investorId,
      total_received: totalReceived,
      next_due_amount: nextDuePayout?.amount_paid || 0,
      next_due_date: nextDuePayout?.payout_due_date || '',
      completion_percentage: totalPayouts > 0 ? (completedPayouts / totalPayouts) * 100 : 0,
      payouts: investorPayouts.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    };
  }

  async processPayment(payoutId: string): Promise<{ success: boolean; transactionId?: string }> {
    // Simulate Stripe payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockTransactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update payout status in mock data
    const payout = this.mockPayouts.find(p => p.id === payoutId);
    if (payout) {
      payout.payout_status = 'paid';
      payout.transaction_id = mockTransactionId;
      payout.timestamp = new Date().toISOString();
    }
    
    return {
      success: true,
      transactionId: mockTransactionId
    };
  }

  async getPayoutById(payoutId: string): Promise<InvestorPayout | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockPayouts.find(payout => payout.id === payoutId) || null;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'paid': return '✅';
      case 'pending': return '⏳';
      case 'late': return '⚠️';
      default: return '❓';
    }
  }
}

export const payoutService = new PayoutService();