import { NotificationService } from './NotificationService';

export class ClientNotificationService {
  private static instance: ClientNotificationService;
  
  static getInstance(): ClientNotificationService {
    if (!this.instance) {
      this.instance = new ClientNotificationService();
    }
    return this.instance;
  }

  // Progress update notifications
  async sendProgressUpdate(userId: string, siteId: string, siteName: string, trade: string, progress: number) {
    const message = `Progress update available for ${siteName} (${trade}: ${progress}%)`;
    
    await NotificationService.sendNotification({
      userId,
      title: 'Progress Update',
      message,
      type: 'progress_update',
      data: {
        siteId,
        siteName,
        trade,
        progress
      }
    });
  }

  // Milestone notifications
  async sendMilestoneReached(userId: string, siteId: string, siteName: string, milestone: string) {
    const message = `Milestone reached: ${milestone} Complete`;
    
    await NotificationService.sendNotification({
      userId,
      title: 'Milestone Reached! 🎉',
      message,
      type: 'milestone',
      data: {
        siteId,
        siteName,
        milestone
      }
    });
  }

  // Phase completion notifications
  async sendPhaseComplete(userId: string, siteId: string, siteName: string, phase: string) {
    const message = `${phase} Phase Complete at ${siteName}`;
    
    await NotificationService.sendNotification({
      userId,
      title: 'Phase Complete',
      message,
      type: 'phase_complete',
      data: {
        siteId,
        siteName,
        phase
      }
    });
  }

  // Invoice notifications
  async sendInvoiceReady(userId: string, invoiceNumber: string, amount: number, siteName: string) {
    const message = `Invoice ${invoiceNumber} is ready for ${siteName} - $${amount.toLocaleString()}`;
    
    await NotificationService.sendNotification({
      userId,
      title: 'New Invoice Available',
      message,
      type: 'invoice_ready',
      data: {
        invoiceNumber,
        amount,
        siteName
      }
    });
  }

  // Report notifications
  async sendReportReady(userId: string, reportType: string, siteName?: string) {
    const message = siteName 
      ? `${reportType} report is ready for ${siteName}`
      : `${reportType} report is ready for download`;
    
    await NotificationService.sendNotification({
      userId,
      title: 'Report Ready',
      message,
      type: 'report_ready',
      data: {
        reportType,
        siteName
      }
    });
  }

  // Delay notifications
  async sendDelayAlert(userId: string, siteId: string, siteName: string, delayReason: string, estimatedDelay: number) {
    const message = `Potential delay at ${siteName}: ${delayReason} (Est. ${estimatedDelay} days)`;
    
    await NotificationService.sendNotification({
      userId,
      title: 'Project Delay Alert',
      message,
      type: 'delay_alert',
      data: {
        siteId,
        siteName,
        delayReason,
        estimatedDelay
      }
    });
  }

  // Photo upload notifications
  async sendPhotosUploaded(userId: string, siteId: string, siteName: string, photoCount: number, trade: string) {
    const message = `${photoCount} new progress photo${photoCount > 1 ? 's' : ''} uploaded for ${siteName} (${trade})`;
    
    await NotificationService.sendNotification({
      userId,
      title: 'New Progress Photos',
      message,
      type: 'photos_uploaded',
      data: {
        siteId,
        siteName,
        photoCount,
        trade
      }
    });
  }

  // Schedule regular progress updates
  async scheduleProgressUpdates(userId: string, siteIds: string[]) {
    // Mock implementation - in real app would integrate with scheduling service
    console.log(`Scheduling progress updates for user ${userId} on sites:`, siteIds);
    
    // Simulate sending updates for demo
    setTimeout(() => {
      this.sendProgressUpdate(userId, siteIds[0], 'Downtown Office Complex', 'Foundations', 78);
    }, 5000);
    
    setTimeout(() => {
      this.sendMilestoneReached(userId, siteIds[0], 'Downtown Office Complex', 'Foundation Phase');
    }, 10000);
  }

  // Get notification preferences for client
  getClientNotificationPreferences(userId: string) {
    return {
      progress_updates: true,
      milestones: true,
      phase_completion: true,
      invoices: true,
      reports: true,
      delays: true,
      photos: false, // Optional - might be too frequent
      frequency: 'daily' // daily, weekly, immediate
    };
  }

  // Update notification preferences
  async updateNotificationPreferences(userId: string, preferences: any) {
    // Mock implementation - would save to database
    console.log(`Updated notification preferences for user ${userId}:`, preferences);
    return true;
  }
}