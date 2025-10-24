import { LaborPerformanceMetrics, WorkerProfile, LaborChiefProfile } from '../types';

export class LaborPerformanceService {
  // Mock data for demonstration
  private static mockJobs = [
    { worker_id: '1', trade: 'Masonry', output: 25, rating: 4.5, on_time: true, accepted: true, waste: 0.05, concept: 'Brick Wall' },
    { worker_id: '1', trade: 'Masonry', output: 30, rating: 4.8, on_time: true, accepted: true, waste: 0.03, concept: 'Stone Foundation' },
    { worker_id: '2', trade: 'Electrical', output: 15, rating: 4.2, on_time: false, accepted: true, waste: 0.08, concept: 'Wiring Installation' },
    { worker_id: '3', trade: 'Plumbing', output: 20, rating: 4.9, on_time: true, accepted: true, waste: 0.02, concept: 'Pipe Installation' },
  ];

  static async calculateWorkerMetrics(workerId: string): Promise<LaborPerformanceMetrics> {
    const jobs = this.mockJobs.filter(job => job.worker_id === workerId);
    
    if (jobs.length === 0) {
      return {
        worker_id: workerId,
        trade: 'Unknown',
        avg_output_per_day: 0,
        avg_rating: 0,
        completed_jobs_count: 0,
        lateness_rate: 0,
        job_acceptance_rate: 0,
        material_waste_ratio: 0,
        top_concepts: [],
        rank_percentile: 0,
        badges: []
      };
    }

    const trade = jobs[0].trade;
    const avgOutput = jobs.reduce((sum, job) => sum + job.output, 0) / jobs.length;
    const avgRating = jobs.reduce((sum, job) => sum + job.rating, 0) / jobs.length;
    const onTimeJobs = jobs.filter(job => job.on_time).length;
    const acceptedJobs = jobs.filter(job => job.accepted).length;
    const avgWaste = jobs.reduce((sum, job) => sum + job.waste, 0) / jobs.length;
    
    // Calculate top concepts
    const conceptCounts = jobs.reduce((acc, job) => {
      acc[job.concept] = (acc[job.concept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topConcepts = Object.entries(conceptCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([concept]) => concept);

    // Calculate rank percentile (mock calculation)
    const rankPercentile = Math.min(95, Math.max(5, avgRating * 20));
    
    // Assign badges
    const badges = [];
    if (rankPercentile >= 95) badges.push('🏆 Top 5%');
    if (avgOutput > 25) badges.push('🧱 Most Efficient');
    if (avgRating >= 4.5) badges.push('💬 Best Rated');

    return {
      worker_id: workerId,
      trade,
      avg_output_per_day: avgOutput,
      avg_rating: avgRating,
      completed_jobs_count: jobs.length,
      lateness_rate: ((jobs.length - onTimeJobs) / jobs.length) * 100,
      job_acceptance_rate: (acceptedJobs / jobs.length) * 100,
      material_waste_ratio: avgWaste * 100,
      top_concepts: topConcepts,
      rank_percentile: rankPercentile,
      badges
    };
  }

  static async getAllWorkerMetrics(trade?: string): Promise<LaborPerformanceMetrics[]> {
    const workerIds = [...new Set(this.mockJobs.map(job => job.worker_id))];
    const metrics = await Promise.all(
      workerIds.map(id => this.calculateWorkerMetrics(id))
    );
    
    return trade ? metrics.filter(m => m.trade === trade) : metrics;
  }

  static async updateWorkerProfile(workerId: string): Promise<void> {
    const metrics = await this.calculateWorkerMetrics(workerId);
    
    // In a real app, this would update the database
    console.log(`Updating worker ${workerId} profile with metrics:`, metrics);
  }

  static async getTradeRankings(trade: string): Promise<LaborPerformanceMetrics[]> {
    const metrics = await this.getAllWorkerMetrics(trade);
    return metrics.sort((a, b) => b.rank_percentile - a.rank_percentile);
  }

  static async sendRankingNotifications(): Promise<void> {
    const trades = ['Masonry', 'Electrical', 'Plumbing'];
    
    for (const trade of trades) {
      const rankings = await this.getTradeRankings(trade);
      
      rankings.forEach((worker, index) => {
        if (index === 0) {
          // Top performer notification
          console.log(`Notification: Worker ${worker.worker_id} has highest rating in ${trade}`);
        }
        
        if (worker.rank_percentile >= 95) {
          console.log(`Notification: Worker ${worker.worker_id} is in top 5% for ${trade}`);
        }
      });
    }
  }
}