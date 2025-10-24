import { MaterialQuoteRequest } from '../types';
import { NotificationService } from './NotificationService';

interface EscrowFundingResult {
  success: boolean;
  payment_tx_id?: string;
  error?: string;
}

class EscrowService {
  private orders: MaterialQuoteRequest[] = [];
  private notificationService = new NotificationService();

  async fundEscrow(order_id: string, contractor_id: string): Promise<EscrowFundingResult> {
    try {
      const order = this.orders.find(o => o.id === order_id);
      if (!order) {
        throw new Error('Order not found');
      }

      // Mock Stripe payment integration
      const payment_tx_id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update order with escrow funding
      order.is_paid = true;
      order.escrow_status = 'funded';
      order.payment_tx_id = payment_tx_id;
      order.payment_date = new Date().toISOString();
      order.auto_release_timer = 72; // 72 hours default

      // Notify supplier
      await this.notificationService.sendNotification({
        user_id: order.supplier_id,
        title: 'Payment Received',
        message: `Escrow funding received for order ${order.id}`,
        type: 'escrow'
      });

      // Start auto-release timer
      this.scheduleAutoRelease(order_id, 72);

      return {
        success: true,
        payment_tx_id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async releaseFunds(order_id: string): Promise<boolean> {
    try {
      const order = this.orders.find(o => o.id === order_id);
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.escrow_status !== 'funded') {
        throw new Error('Order not in funded state');
      }

      // Release funds
      order.escrow_status = 'released';
      order.release_date = new Date().toISOString();

      // Notify supplier
      await this.notificationService.sendNotification({
        user_id: order.supplier_id,
        title: 'Funds Released',
        message: `Payment has been released for order ${order.id}`,
        type: 'escrow'
      });

      return true;
    } catch (error) {
      console.error('Error releasing funds:', error);
      return false;
    }
  }

  async autoReleaseFunds(order_id: string, hours: number): Promise<boolean> {
    // In a real app, this would be handled by a background job
    setTimeout(async () => {
      const order = this.orders.find(o => o.id === order_id);
      if (order && order.escrow_status === 'funded') {
        await this.releaseFunds(order_id);
        
        // Notify contractor about auto-release
        await this.notificationService.sendNotification({
          user_id: order.contractor_id,
          title: 'Funds Auto-Released',
          message: `Funds automatically released for order ${order.id} after ${hours} hours`,
          type: 'escrow'
        });
      }
    }, hours * 60 * 60 * 1000);

    return true;
  }

  async flagDispute(order_id: string): Promise<boolean> {
    try {
      const order = this.orders.find(o => o.id === order_id);
      if (!order) {
        throw new Error('Order not found');
      }

      order.escrow_status = 'disputed';

      // Notify both parties
      await this.notificationService.sendNotification({
        user_id: order.contractor_id,
        title: 'Dispute Flagged',
        message: `Dispute has been flagged for order ${order.id}`,
        type: 'escrow'
      });

      await this.notificationService.sendNotification({
        user_id: order.supplier_id,
        title: 'Dispute Flagged',
        message: `Dispute has been flagged for order ${order.id}`,
        type: 'escrow'
      });

      return true;
    } catch (error) {
      console.error('Error flagging dispute:', error);
      return false;
    }
  }

  private scheduleAutoRelease(order_id: string, hours: number): void {
    this.autoReleaseFunds(order_id, hours);
  }

  // Helper methods for managing orders
  addOrder(order: MaterialQuoteRequest): void {
    this.orders.push(order);
  }

  getOrder(order_id: string): MaterialQuoteRequest | undefined {
    return this.orders.find(o => o.id === order_id);
  }

  updateOrder(order: MaterialQuoteRequest): void {
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      this.orders[index] = order;
    }
  }

  getOrdersByContractor(contractor_id: string): MaterialQuoteRequest[] {
    return this.orders.filter(o => o.contractor_id === contractor_id);
  }

  getOrdersBySupplier(supplier_id: string): MaterialQuoteRequest[] {
    return this.orders.filter(o => o.supplier_id === supplier_id);
  }

  getRemainingReleaseTime(order_id: string): number {
    const order = this.orders.find(o => o.id === order_id);
    if (!order || !order.payment_date || !order.auto_release_timer) {
      return 0;
    }

    const paymentTime = new Date(order.payment_date).getTime();
    const releaseTime = paymentTime + (order.auto_release_timer * 60 * 60 * 1000);
    const now = Date.now();
    
    return Math.max(0, Math.floor((releaseTime - now) / (60 * 60 * 1000)));
  }
}

export const escrowService = new EscrowService();