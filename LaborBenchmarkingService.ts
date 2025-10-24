import { LaborPerformanceService } from './LaborPerformanceService';
import { notificationService } from './NotificationService';

export class LaborBenchmarkingService {
  static async initializeBenchmarking(): Promise<void> {
    // Update all worker profiles with performance metrics
    const workerIds = ['1', '2', '3'];
    
    for (const workerId of workerIds) {
      await LaborPerformanceService.updateWorkerProfile(workerId);
    }
    
    // Send performance notifications
    await LaborPerformanceService.sendRankingNotifications();
    await notificationService.sendLaborPerformanceNotifications();
  }

  static async scheduleDailyUpdates(): Promise<void> {
    // In a real app, this would be scheduled
    console.log('Scheduling daily labor benchmarking updates');
    
    // Mock daily update
    setTimeout(async () => {
      await this.initializeBenchmarking();
    }, 5000);
  }
}

// Auto-initialize on service load (commented out to prevent build errors)
// LaborBenchmarkingService.initializeBenchmarking();
// LaborBenchmarkingService.scheduleDailyUpdates();