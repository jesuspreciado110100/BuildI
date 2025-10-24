import { WorkerFeedback, WorkerProfile } from '../types';

class WorkerFeedbackService {
  private feedbackData: WorkerFeedback[] = [];
  private workerProfiles: WorkerProfile[] = [];

  // Submit feedback for a worker
  async submitFeedback(feedback: Omit<WorkerFeedback, 'id' | 'timestamp'>): Promise<WorkerFeedback> {
    const newFeedback: WorkerFeedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    this.feedbackData.push(newFeedback);
    await this.updateWorkerRating(feedback.worker_id);
    return newFeedback;
  }

  // Get all feedback for a specific worker
  async getFeedbackByWorker(workerId: string): Promise<WorkerFeedback[]> {
    return this.feedbackData.filter(feedback => feedback.worker_id === workerId);
  }

  // Get all feedback for a specific request
  async getFeedbackByRequest(requestId: string): Promise<WorkerFeedback[]> {
    return this.feedbackData.filter(feedback => feedback.request_id === requestId);
  }

  // Get all feedback for a specific concept
  async getFeedbackByConcept(conceptId: string): Promise<WorkerFeedback[]> {
    return this.feedbackData.filter(feedback => feedback.concept_id === conceptId);
  }

  // Check if feedback exists for a worker on a specific request
  async hasFeedback(requestId: string, workerId: string): Promise<boolean> {
    return this.feedbackData.some(
      feedback => feedback.request_id === requestId && feedback.worker_id === workerId
    );
  }

  // Update worker's average rating and completed jobs count
  private async updateWorkerRating(workerId: string): Promise<void> {
    const workerFeedback = await this.getFeedbackByWorker(workerId);
    
    if (workerFeedback.length === 0) return;

    const totalRating = workerFeedback.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = totalRating / workerFeedback.length;
    const completedJobsCount = new Set(workerFeedback.map(f => f.request_id)).size;

    // Update worker profile (mock implementation)
    const workerIndex = this.workerProfiles.findIndex(w => w.id === workerId);
    if (workerIndex !== -1) {
      this.workerProfiles[workerIndex] = {
        ...this.workerProfiles[workerIndex],
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        completed_jobs_count: completedJobsCount,
      };
    }
  }

  // Get worker statistics
  async getWorkerStats(workerId: string): Promise<{
    averageRating: number;
    totalFeedback: number;
    completedJobs: number;
    ratingDistribution: Record<number, number>;
  }> {
    const feedback = await this.getFeedbackByWorker(workerId);
    
    if (feedback.length === 0) {
      return {
        averageRating: 0,
        totalFeedback: 0,
        completedJobs: 0,
        ratingDistribution: {},
      };
    }

    const totalRating = feedback.reduce((sum, f) => f.rating + sum, 0);
    const averageRating = totalRating / feedback.length;
    const completedJobs = new Set(feedback.map(f => f.request_id)).size;
    
    const ratingDistribution: Record<number, number> = {};
    feedback.forEach(f => {
      ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalFeedback: feedback.length,
      completedJobs,
      ratingDistribution,
    };
  }
}

export const workerFeedbackService = new WorkerFeedbackService();