import { NotificationService } from './NotificationService';
import { InvestorPayout } from '../types';

class InvestorNotificationService {
  private notificationService = new NotificationService();

  // Milestone payout received notification
  async notifyPayoutReceived(payout: InvestorPayout, siteName: string): Promise<void> {
    const message = `Milestone payout received: $${payout.amount_paid.toLocaleString()} from ${siteName}`;
    
    await this.notificationService.sendNotification({
      id: `payout_received_${payout.id}`,
      title: 'Payout Received',
      message,
      type: 'payout_received',
      userId: payout.investor_id,
      timestamp: new Date().toISOString(),
      data: {
        payout_id: payout.id,
        site_id: payout.site_id,
        amount: payout.amount_paid,
        milestone: payout.milestone_name
      }
    });
  }

  // Upcoming payout due notification
  async notifyUpcomingPayout(payout: InvestorPayout, daysUntilDue: number): Promise<void> {
    const message = `Upcoming payout due in ${daysUntilDue} days (${payout.milestone_name})`;
    
    await this.notificationService.sendNotification({
      id: `payout_due_${payout.id}`,
      title: 'Payout Due Soon',
      message,
      type: 'payout_due',
      userId: payout.investor_id,
      timestamp: new Date().toISOString(),
      data: {
        payout_id: payout.id,
        site_id: payout.site_id,
        amount: payout.amount_paid,
        milestone: payout.milestone_name,
        due_date: payout.payout_due_date,
        days_until_due: daysUntilDue
      }
    });
  }

  // Late payout notification
  async notifyLatePayment(payout: InvestorPayout, daysOverdue: number): Promise<void> {
    const message = `Payment overdue: ${payout.milestone_name} (${daysOverdue} days late)`;
    
    await this.notificationService.sendNotification({
      id: `payout_late_${payout.id}`,
      title: 'Payment Overdue',
      message,
      type: 'payout_late',
      userId: payout.investor_id,
      timestamp: new Date().toISOString(),
      priority: 'high',
      data: {
        payout_id: payout.id,
        site_id: payout.site_id,
        amount: payout.amount_paid,
        milestone: payout.milestone_name,
        due_date: payout.payout_due_date,
        days_overdue: daysOverdue
      }
    });
  }

  // Milestone completion notification
  async notifyMilestoneComplete(siteId: string, milestoneName: string, investorId: string): Promise<void> {
    const message = `Milestone reached: ${milestoneName} Complete`;
    
    await this.notificationService.sendNotification({
      id: `milestone_complete_${siteId}_${Date.now()}`,
      title: 'Milestone Completed',
      message,
      type: 'milestone_complete',
      userId: investorId,
      timestamp: new Date().toISOString(),
      data: {
        site_id: siteId,
        milestone: milestoneName
      }
    });
  }

  // Quarterly report available notification
  async notifyReportAvailable(investorId: string, reportType: string, period: string): Promise<void> {
    const message = `Your ${reportType} for ${period} is now available`;
    
    await this.notificationService.sendNotification({
      id: `report_available_${investorId}_${Date.now()}`,
      title: 'Report Available',
      message,
      type: 'report_available',
      userId: investorId,
      timestamp: new Date().toISOString(),
      data: {
        report_type: reportType,
        period: period
      }
    });
  }

  // Schedule automated notifications
  async schedulePayoutReminders(payouts: InvestorPayout[]): Promise<void> {
    const today = new Date();
    
    for (const payout of payouts) {
      if (payout.payout_status === 'pending') {
        const dueDate = new Date(payout.payout_due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Send reminder 5 days before due date
        if (daysUntilDue === 5) {
          await this.notifyUpcomingPayout(payout, daysUntilDue);
        }
        
        // Send overdue notification if payment is late
        if (daysUntilDue < 0) {
          await this.notifyLatePayment(payout, Math.abs(daysUntilDue));
        }
      }
    }
  }

  // Mock notification for demo purposes
  async sendDemoNotifications(investorId: string): Promise<void> {
    // Simulate milestone payout received
    await this.notificationService.sendNotification({
      id: `demo_payout_${Date.now()}`,
      title: 'Payout Received',
      message: 'Milestone payout received: $3,200 from Site #7',
      type: 'payout_received',
      userId: investorId,
      timestamp: new Date().toISOString(),
      data: {
        amount: 3200,
        site_id: 'site_7',
        milestone: 'Foundation Complete'
      }
    });

    // Simulate upcoming payout due
    setTimeout(async () => {
      await this.notificationService.sendNotification({
        id: `demo_due_${Date.now()}`,
        title: 'Payout Due Soon',
        message: 'Upcoming payout due in 5 days (Structure Phase)',
        type: 'payout_due',
        userId: investorId,
        timestamp: new Date().toISOString(),
        data: {
          amount: 25000,
          site_id: 'site_1',
          milestone: 'Structure Phase',
          days_until_due: 5
        }
      });
    }, 2000);
  }

  // Calculate notification frequency based on payout schedule
  getNotificationFrequency(payouts: InvestorPayout[]): string {
    const pendingPayouts = payouts.filter(p => p.payout_status === 'pending');
    
    if (pendingPayouts.length === 0) return 'monthly';
    if (pendingPayouts.length >= 3) return 'weekly';
    return 'bi-weekly';
  }
}

export const investorNotificationService = new InvestorNotificationService();