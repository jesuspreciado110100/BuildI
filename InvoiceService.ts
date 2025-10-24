import { Invoice, TradeOffer } from '../types';

class InvoiceService {
  private invoices: Invoice[] = [];

  generateInvoiceOnAcceptance(tradeOffer: TradeOffer): Invoice {
    const invoice: Invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trade_offer_id: tradeOffer.id,
      contractor_id: tradeOffer.contractor_id,
      subcontractor_id: tradeOffer.subcontractor_id,
      amount: tradeOffer.total_price,
      status: 'pending',
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      created_at: new Date().toISOString()
    };

    this.invoices.push(invoice);
    return invoice;
  }

  updatePaymentStatus(invoiceId: string, status: Invoice['status'], paymentDate?: string): Invoice | null {
    const invoice = this.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return null;

    invoice.status = status;
    if (status === 'paid' && paymentDate) {
      invoice.payment_date = paymentDate;
    }

    return invoice;
  }

  getInvoicesByContractor(contractorId: string): Invoice[] {
    return this.invoices.filter(inv => inv.contractor_id === contractorId);
  }

  getInvoicesBySubcontractor(subcontractorId: string): Invoice[] {
    return this.invoices.filter(inv => inv.subcontractor_id === subcontractorId);
  }

  getAllInvoices(): Invoice[] {
    return [...this.invoices];
  }

  getInvoiceById(id: string): Invoice | null {
    return this.invoices.find(inv => inv.id === id) || null;
  }

  // Mock Stripe payment processing
  async processPayment(invoiceId: string): Promise<boolean> {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) return false;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock 90% success rate
    const success = Math.random() > 0.1;
    
    if (success) {
      this.updatePaymentStatus(invoiceId, 'paid', new Date().toISOString());
    }

    return success;
  }

  getPaymentHistory(filters?: {
    startDate?: string;
    endDate?: string;
    status?: Invoice['status'];
    userId?: string;
  }): Invoice[] {
    let filtered = this.invoices;

    if (filters?.startDate) {
      filtered = filtered.filter(inv => inv.issue_date >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter(inv => inv.issue_date <= filters.endDate!);
    }

    if (filters?.status) {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }

    if (filters?.userId) {
      filtered = filtered.filter(inv => 
        inv.contractor_id === filters.userId || inv.subcontractor_id === filters.userId
      );
    }

    return filtered;
  }
}

export default new InvoiceService();