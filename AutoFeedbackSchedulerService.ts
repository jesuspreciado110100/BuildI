import { MicroJobService } from './MicroJobService';
import { WorkerFeedbackService } from './WorkerFeedbackService';
import { NotificationService } from './NotificationService';
import { MicroJobRequest } from '../types';

export class AutoFeedbackSchedulerService {
  private static checkInterval: NodeJS.Timeout | null = null;
  private static readonly CHECK_INTERVAL_MS = 60000; // Check every minute
  private static readonly AUTO_FEEDBACK_DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours

  static startScheduler() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkForAutoFeedback();
    }, this.CHECK_INTERVAL_MS);
  }

  static stopScheduler() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private static async checkForAutoFeedback() {
    try {
      const completedJobs = await MicroJobService.getCompletedJobs();
      const now = new Date();

      for (const job of completedJobs) {
        if (this.shouldAutoSubmitFeedback(job, now)) {
          await this.submitAutoFeedback(job);
        }
      }
    } catch (error) {
      console.error('Error in auto feedback scheduler:', error);
    }
  }

  private static shouldAutoSubmitFeedback(job: MicroJobRequest, now: Date): boolean {
    if (!job.completed_at || 
        job.contractor_feedback_status !== 'pending' || 
        job.auto_feedback_generated) {
      return false;
    }

    const completedTime = new Date(job.completed_at);
    const timeDiff = now.getTime() - completedTime.getTime();
    
    return timeDiff >= this.AUTO_FEEDBACK_DELAY_MS;
  }

  private static async submitAutoFeedback(job: MicroJobRequest) {
    try {
      if (!job.selected_worker_id) return;

      // Submit 5-star auto feedback
      await WorkerFeedbackService.submitFeedback({
        request_id: job.id,
        concept_id: job.concept_id,
        contractor_id: job.contractor_id,
        worker_id: job.selected_worker_id,
        rating: 5,
        comment: 'Auto-verified by system - No contractor response within 24 hours'
      });

      // Mark job as auto-feedback generated
      await MicroJobService.approveCompletion(job.id);
      
      // Update the job to mark auto feedback as generated
      // In a real implementation, this would update the database
      console.log(`Auto feedback submitted for job ${job.id}`);

      // Notify worker
      await NotificationService.sendNotification({
        user_id: job.selected_worker_id,
        title: 'Job Auto-Approved',
        message: `Your work on "${job.job_description}" has been auto-approved with 5-star rating`,
        type: 'micro_job',
        related_id: job.id
      });

    } catch (error) {
      console.error(`Failed to submit auto feedback for job ${job.id}:`, error);
    }
  }

  // Mock method to simulate checking if auto feedback should be triggered
  static async triggerAutoFeedbackCheck() {
    await this.checkForAutoFeedback();
  }

  // Utility method to get jobs pending auto feedback
  static async getJobsPendingAutoFeedback(): Promise<MicroJobRequest[]> {
    const completedJobs = await MicroJobService.getCompletedJobs();
    const now = new Date();
    
    return completedJobs.filter(job => this.shouldAutoSubmitFeedback(job, now));
  }
}