import { ConstructionConcept } from '../types';
import { DelayTrackerService } from './DelayTrackerService';
import { notificationService } from './NotificationService';

export class DelayNotificationScheduler {
  private static instance: DelayNotificationScheduler;
  private scheduledChecks: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  static getInstance(): DelayNotificationScheduler {
    if (!DelayNotificationScheduler.instance) {
      DelayNotificationScheduler.instance = new DelayNotificationScheduler();
    }
    return DelayNotificationScheduler.instance;
  }

  startMonitoring(contractorId: string, concepts: ConstructionConcept[]): void {
    if (this.isRunning) {
      this.stopMonitoring();
    }

    this.isRunning = true;
    console.log(`Starting delay monitoring for contractor ${contractorId}`);

    // Check immediately
    this.checkForDelays(contractorId, concepts);

    // Schedule regular checks every 4 hours
    const intervalId = setInterval(() => {
      this.checkForDelays(contractorId, concepts);
    }, 4 * 60 * 60 * 1000); // 4 hours

    this.scheduledChecks.set(contractorId, intervalId);

    // Schedule daily digest at 8 AM
    this.scheduleDailyDigest(contractorId, concepts);
  }

  stopMonitoring(): void {
    this.scheduledChecks.forEach((intervalId, contractorId) => {
      clearInterval(intervalId);
      console.log(`Stopped delay monitoring for contractor ${contractorId}`);
    });
    this.scheduledChecks.clear();
    this.isRunning = false;
  }

  private async checkForDelays(contractorId: string, concepts: ConstructionConcept[]): Promise<void> {
    try {
      const delayedConcepts = DelayTrackerService.getDelayedConcepts(concepts);
      
      for (const concept of delayedConcepts) {
        const delayInfo = concept.delay_info || DelayTrackerService.calculateDelayStatus(concept);
        
        if (delayInfo.is_delayed && delayInfo.delay_days && delayInfo.delay_days > 0) {
          // Send delay alert for new or worsening delays
          await notificationService.sendDelayAlert(
            contractorId,
            concept.name,
            'Site A', // Mock site name
            delayInfo.delay_days,
            concept.id
          );

          // Send specific notifications based on delay reasons
          if (delayInfo.delay_reason.includes('Material delay')) {
            await notificationService.sendMaterialDelayNotification(
              contractorId,
              concept.name,
              '48h',
              concept.id
            );
          }

          // Send recovery recommendations for significant delays
          if (delayInfo.delay_days >= 3 && delayInfo.recovery_actions && delayInfo.recovery_actions.length > 0) {
            const primaryAction = delayInfo.recovery_actions[0];
            await notificationService.sendRecoveryRecommendation(
              contractorId,
              concept.name,
              primaryAction,
              concept.id
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking for delays:', error);
    }
  }

  private scheduleDailyDigest(contractorId: string, concepts: ConstructionConcept[]): void {
    const now = new Date();
    const tomorrow8AM = new Date(now);
    tomorrow8AM.setDate(tomorrow8AM.getDate() + 1);
    tomorrow8AM.setHours(8, 0, 0, 0);

    const msUntil8AM = tomorrow8AM.getTime() - now.getTime();

    setTimeout(() => {
      this.sendDailyDelayDigest(contractorId, concepts);
      
      // Schedule recurring daily digest
      setInterval(() => {
        this.sendDailyDelayDigest(contractorId, concepts);
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, msUntil8AM);
  }

  private async sendDailyDelayDigest(contractorId: string, concepts: ConstructionConcept[]): Promise<void> {
    try {
      const delayedConcepts = DelayTrackerService.getDelayedConcepts(concepts);
      const delayTrends = DelayTrackerService.getDelayTrendsByTrade(concepts);
      const reasonDistribution = DelayTrackerService.getDelayReasonDistribution(concepts);

      if (delayedConcepts.length > 0) {
        const criticalDelays = delayedConcepts.filter(c => (c.delay_info?.delay_days || 0) >= 7);
        const topReason = Object.entries(reasonDistribution)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

        const message = `Daily Delay Summary: ${delayedConcepts.length} concepts delayed, ` +
          `${criticalDelays.length} critical. Top cause: ${topReason}.`;

        await notificationService.sendNotification({
          user_id: contractorId,
          title: 'Daily Delay Digest',
          message,
          type: 'delay_alert',
          status: 'unread',
          related_id: contractorId,
          related_type: 'contractor'
        });
      }
    } catch (error) {
      console.error('Error sending daily delay digest:', error);
    }
  }

  // Manual trigger for testing
  async triggerDelayCheck(contractorId: string, concepts: ConstructionConcept[]): Promise<void> {
    await this.checkForDelays(contractorId, concepts);
  }

  // Get monitoring status
  isMonitoring(contractorId: string): boolean {
    return this.scheduledChecks.has(contractorId);
  }

  // Update concepts being monitored
  updateConcepts(contractorId: string, concepts: ConstructionConcept[]): void {
    if (this.isMonitoring(contractorId)) {
      // Restart monitoring with updated concepts
      this.startMonitoring(contractorId, concepts);
    }
  }
}

export const delayNotificationScheduler = DelayNotificationScheduler.getInstance();