import { CalendarSyncService } from './CalendarSyncService';
import { ProgressTrackingService } from './ProgressTrackingService';
import { NotificationService } from './NotificationService';
import { Milestone } from '../types';

export interface ConceptStatus {
  id: string;
  siteId: string;
  status: 'on_track' | 'delayed' | 'completed' | 'at_risk';
  progress_percent: number;
  lastUpdated: string;
  nextMilestone?: string;
}

export interface UpcomingMilestone {
  id: string;
  title: string;
  date: string;
  siteId: string;
  daysUntil: number;
  requiresSnapshot: boolean;
}

export interface SnapshotReminder {
  siteId: string;
  conceptId?: string;
  milestoneId?: string;
  reason: 'milestone_approaching' | 'concept_delayed' | 'overdue';
  lastSent: string;
}

export class ProgressSnapshotTriggerService {
  private static reminders: Map<string, SnapshotReminder> = new Map();
  private static readonly DEBOUNCE_HOURS = 4;
  private static readonly MILESTONE_WARNING_DAYS = 2;

  /**
   * Main method to watch site progress and send notifications
   */
  static async watchAndNotify(siteId: string): Promise<void> {
    try {
      console.log(`[ProgressSnapshotTrigger] Starting watch for site: ${siteId}`);
      
      // Fetch upcoming milestones
      const upcomingMilestones = await this.getUpcomingMilestones(siteId);
      console.log(`[ProgressSnapshotTrigger] Found ${upcomingMilestones.length} upcoming milestones`);
      
      // Check milestone proximity
      for (const milestone of upcomingMilestones) {
        if (milestone.daysUntil <= this.MILESTONE_WARNING_DAYS && milestone.requiresSnapshot) {
          await this.handleMilestoneReminder(siteId, milestone);
        }
      }
      
      // Monitor concept progress
      const conceptStatus = await this.getConceptStatus(siteId);
      console.log(`[ProgressSnapshotTrigger] Concept status: ${conceptStatus.status}`);
      
      if (conceptStatus.status === 'delayed' || conceptStatus.status === 'at_risk') {
        await this.handleDelayedConceptReminder(siteId, conceptStatus);
      }
      
      console.log(`[ProgressSnapshotTrigger] Watch completed for site: ${siteId}`);
    } catch (error) {
      console.error(`[ProgressSnapshotTrigger] Error in watchAndNotify:`, error);
    }
  }

  /**
   * Get upcoming milestones for a site
   */
  private static async getUpcomingMilestones(siteId: string): Promise<UpcomingMilestone[]> {
    try {
      // Mock implementation - in real app would use CalendarSyncService
      const mockMilestones: UpcomingMilestone[] = [
        {
          id: 'milestone_1',
          title: 'Foundation Completion',
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          siteId,
          daysUntil: 1,
          requiresSnapshot: true
        },
        {
          id: 'milestone_2',
          title: 'Framing Inspection',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          siteId,
          daysUntil: 5,
          requiresSnapshot: true
        }
      ];
      
      return mockMilestones;
    } catch (error) {
      console.error(`[ProgressSnapshotTrigger] Error fetching milestones:`, error);
      return [];
    }
  }

  /**
   * Get concept status for a site
   */
  private static async getConceptStatus(siteId: string): Promise<ConceptStatus> {
    try {
      // Mock implementation - in real app would use ProgressTrackingService
      return {
        id: `concept_${siteId}`,
        siteId,
        status: 'on_track',
        progress_percent: 75,
        lastUpdated: new Date().toISOString(),
        nextMilestone: 'Foundation Completion'
      };
    } catch (error) {
      console.error(`[ProgressSnapshotTrigger] Error fetching concept status:`, error);
      return {
        id: `concept_${siteId}`,
        siteId,
        status: 'on_track',
        progress_percent: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Handle milestone reminder with debouncing
   */
  private static async handleMilestoneReminder(
    siteId: string,
    milestone: UpcomingMilestone
  ): Promise<void> {
    const reminderKey = `milestone_${siteId}_${milestone.id}`;
    
    if (this.shouldDebounceReminder(reminderKey)) {
      console.log(`[ProgressSnapshotTrigger] Debouncing milestone reminder: ${reminderKey}`);
      return;
    }
    
    try {
      await this.sendToContractor(
        siteId,
        'Milestone Snapshot Reminder',
        `Milestone "${milestone.title}" is ${milestone.daysUntil} day(s) away. Please upload progress snapshots.`,
        'milestone_approaching',
        milestone.id
      );
      
      this.recordReminder(reminderKey, {
        siteId,
        milestoneId: milestone.id,
        reason: 'milestone_approaching',
        lastSent: new Date().toISOString()
      });
      
      console.log(`[ProgressSnapshotTrigger] Milestone reminder sent for: ${milestone.title}`);
    } catch (error) {
      console.error(`[ProgressSnapshotTrigger] Error sending milestone reminder:`, error);
    }
  }

  /**
   * Handle delayed concept reminder with debouncing
   */
  private static async handleDelayedConceptReminder(
    siteId: string,
    conceptStatus: ConceptStatus
  ): Promise<void> {
    const reminderKey = `concept_${siteId}_${conceptStatus.id}`;
    
    if (this.shouldDebounceReminder(reminderKey)) {
      console.log(`[ProgressSnapshotTrigger] Debouncing concept delay reminder: ${reminderKey}`);
      return;
    }
    
    try {
      await this.sendToContractor(
        siteId,
        'Delayed Progress Snapshot Required',
        `Concept progress is marked as "${conceptStatus.status}". Please upload current progress snapshots for review.`,
        'concept_delayed',
        conceptStatus.id
      );
      
      this.recordReminder(reminderKey, {
        siteId,
        conceptId: conceptStatus.id,
        reason: 'concept_delayed',
        lastSent: new Date().toISOString()
      });
      
      console.log(`[ProgressSnapshotTrigger] Delayed concept reminder sent for: ${conceptStatus.id}`);
    } catch (error) {
      console.error(`[ProgressSnapshotTrigger] Error sending delayed concept reminder:`, error);
    }
  }

  /**
   * Send notification to contractor
   */
  private static async sendToContractor(
    siteId: string,
    title: string,
    message: string,
    type: string,
    referenceId: string
  ): Promise<void> {
    try {
      // Mock contractor ID - in real app would fetch from site data
      const contractorId = `contractor_${siteId}`;
      
      await NotificationService.createNotification({
        title,
        message,
        type: 'progress',
        read: false,
        userId: contractorId,
        priority: 'high',
        actionUrl: `/contractor/sites/${siteId}/progress`
      });
      
      console.log(`[ProgressSnapshotTrigger] Notification sent to contractor: ${contractorId}`);
    } catch (error) {
      console.error(`[ProgressSnapshotTrigger] Error sending notification:`, error);
    }
  }

  /**
   * Check if reminder should be debounced
   */
  private static shouldDebounceReminder(reminderKey: string): boolean {
    const reminder = this.reminders.get(reminderKey);
    if (!reminder) return false;
    
    const lastSent = new Date(reminder.lastSent);
    const now = new Date();
    const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastSent < this.DEBOUNCE_HOURS;
  }

  /**
   * Record reminder to prevent spam
   */
  private static recordReminder(reminderKey: string, reminder: SnapshotReminder): void {
    this.reminders.set(reminderKey, reminder);
    console.log(`[ProgressSnapshotTrigger] Recorded reminder: ${reminderKey}`);
  }

  /**
   * Clear old reminders (cleanup method)
   */
  static clearOldReminders(): void {
    const now = new Date();
    const cutoffTime = now.getTime() - (24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, reminder] of this.reminders.entries()) {
      const reminderTime = new Date(reminder.lastSent).getTime();
      if (reminderTime < cutoffTime) {
        this.reminders.delete(key);
        console.log(`[ProgressSnapshotTrigger] Cleared old reminder: ${key}`);
      }
    }
  }

  /**
   * Get reminder statistics for debugging
   */
  static getReminderStats(): { total: number; byReason: Record<string, number> } {
    const stats = {
      total: this.reminders.size,
      byReason: {} as Record<string, number>
    };
    
    for (const reminder of this.reminders.values()) {
      stats.byReason[reminder.reason] = (stats.byReason[reminder.reason] || 0) + 1;
    }
    
    return stats;
  }
}

export default ProgressSnapshotTriggerService;