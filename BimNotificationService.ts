import { BimScheduleItem } from '../types';
import { BimSchedulerService } from './BimSchedulerService';
import { NotificationService } from './NotificationService';

export class BimNotificationService {
  // Check for schedule delays and send notifications
  static async checkScheduleDelays(siteId: string, contractorId: string): Promise<void> {
    try {
      const schedule = await BimSchedulerService.getConceptSchedule(siteId);
      const delayedItems = BimSchedulerService.checkScheduleDelays(schedule);
      
      for (const item of delayedItems) {
        const delayDays = BimSchedulerService.calculateDelayDays(item);
        
        await NotificationService.createNotification({
          user_id: contractorId,
          title: 'Schedule Delay Alert',
          message: `Concept "${item.concept_name}" is behind schedule by ${delayDays} days`,
          type: 'schedule_delay',
          related_id: item.concept_id,
          related_type: 'concept'
        });
      }
    } catch (error) {
      console.error('Failed to check schedule delays:', error);
    }
  }

  // Send daily task notifications
  static async sendDailyTaskNotifications(siteId: string, contractorId: string): Promise<void> {
    try {
      const schedule = await BimSchedulerService.getConceptSchedule(siteId);
      const todaysTasks = BimSchedulerService.getTodaysPlannedTasks(schedule);
      
      if (todaysTasks.length > 0) {
        const taskList = todaysTasks.map(task => task.concept_name).join(', ');
        
        await NotificationService.createNotification({
          user_id: contractorId,
          title: 'Today\'s Planned Tasks',
          message: `Tasks scheduled for today: ${taskList}`,
          type: 'daily_tasks',
          related_id: siteId,
          related_type: 'site'
        });
      }
    } catch (error) {
      console.error('Failed to send daily task notifications:', error);
    }
  }

  // Generate 4D snapshot report (mock implementation)
  static async generate4DSnapshotReport(siteId: string): Promise<string> {
    try {
      const schedule = await BimSchedulerService.getConceptSchedule(siteId);
      const delayedItems = BimSchedulerService.checkScheduleDelays(schedule);
      
      const report = {
        site_id: siteId,
        generated_at: new Date().toISOString(),
        total_concepts: schedule.length,
        completed_concepts: schedule.filter(item => item.status === 'completed').length,
        delayed_concepts: delayedItems.length,
        overall_progress: Math.round(
          schedule.reduce((sum, item) => sum + item.progress_percent, 0) / schedule.length
        ),
        timeline_data: schedule.map(item => ({
          concept_name: item.concept_name,
          trade: item.trade,
          planned_start: item.planned_start_date,
          planned_end: item.planned_end_date,
          progress: item.progress_percent,
          status: item.status,
          bim_objects_count: item.bim_object_ids.length
        }))
      };
      
      // Mock PDF generation - return report URL
      const reportUrl = `https://mock-reports.com/4d-snapshot-${siteId}-${Date.now()}.pdf`;
      console.log('Generated 4D snapshot report:', report);
      
      return reportUrl;
    } catch (error) {
      console.error('Failed to generate 4D snapshot report:', error);
      throw error;
    }
  }
}