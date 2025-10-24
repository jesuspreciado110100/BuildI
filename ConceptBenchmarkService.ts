import { ConstructionConcept, BenchmarkingMetrics, WorkerProfile, LaborRequest } from '../types';

export class ConceptBenchmarkService {
  // Mock data for demonstration
  private static mockProgressLogs = [
    { concept_id: '1', date: '2024-01-15', progress_percent: 25, workers_present: 4 },
    { concept_id: '1', date: '2024-01-20', progress_percent: 50, workers_present: 5 },
    { concept_id: '1', date: '2024-01-25', progress_percent: 75, workers_present: 4 },
    { concept_id: '1', date: '2024-01-30', progress_percent: 100, workers_present: 3 }
  ];

  private static mockMaterialUsage = [
    { concept_id: '1', material_type: 'concrete', ordered: 100, used: 95, wasted: 5 },
    { concept_id: '1', material_type: 'steel', ordered: 50, used: 48, wasted: 2 }
  ];

  private static mockFeedback = [
    { concept_id: '1', rating: 4.5, comment: 'Good work quality' },
    { concept_id: '1', rating: 4.0, comment: 'On time delivery' }
  ];

  static async calculateBenchmarkingMetrics(
    concept: ConstructionConcept,
    assignedWorkers: WorkerProfile[],
    laborRequests: LaborRequest[]
  ): Promise<BenchmarkingMetrics> {
    const startDate = new Date(concept.created_at);
    const endDate = concept.status === 'completed' ? new Date() : new Date();
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate unit output rate
    const unitOutputRate = durationDays > 0 ? concept.total_volume / durationDays : 0;

    // Calculate average worker count
    const progressLogs = this.mockProgressLogs.filter(log => log.concept_id === concept.id);
    const avgWorkerCount = progressLogs.length > 0 
      ? progressLogs.reduce((sum, log) => sum + log.workers_present, 0) / progressLogs.length
      : assignedWorkers.length;

    // Calculate cost per unit
    const totalLaborCost = laborRequests
      .filter(req => req.concept_id === concept.id)
      .reduce((sum, req) => sum + req.offered_price, 0);
    const costPerUnit = concept.total_volume > 0 ? totalLaborCost / concept.total_volume : 0;

    // Calculate material waste percentage
    const materialUsage = this.mockMaterialUsage.filter(usage => usage.concept_id === concept.id);
    const totalOrdered = materialUsage.reduce((sum, usage) => sum + usage.ordered, 0);
    const totalWasted = materialUsage.reduce((sum, usage) => sum + usage.wasted, 0);
    const materialWastePct = totalOrdered > 0 ? (totalWasted / totalOrdered) * 100 : 0;

    // Calculate satisfaction score
    const feedback = this.mockFeedback.filter(fb => fb.concept_id === concept.id);
    const satisfactionScore = feedback.length > 0
      ? feedback.reduce((sum, fb) => sum + fb.rating, 0) / feedback.length
      : 0;

    return {
      unit_output_rate: Math.round(unitOutputRate * 100) / 100,
      avg_worker_count: Math.round(avgWorkerCount * 100) / 100,
      cost_per_unit: Math.round(costPerUnit * 100) / 100,
      material_waste_pct: Math.round(materialWastePct * 100) / 100,
      completion_duration: durationDays,
      satisfaction_score: Math.round(satisfactionScore * 100) / 100
    };
  }

  static async updateConceptBenchmarks(concept: ConstructionConcept): Promise<ConstructionConcept> {
    // Mock assigned workers and labor requests
    const assignedWorkers: WorkerProfile[] = [];
    const laborRequests: LaborRequest[] = [];

    const metrics = await this.calculateBenchmarkingMetrics(concept, assignedWorkers, laborRequests);
    
    return {
      ...concept,
      benchmarking_metrics: metrics
    };
  }

  static getBenchmarkBadges(concept: ConstructionConcept): string[] {
    const badges: string[] = [];
    const metrics = concept.benchmarking_metrics;
    
    if (!metrics) return badges;

    // Fast badge - if output rate is above average
    if (metrics.unit_output_rate > 10) { // Mock threshold
      badges.push('🚀 Fast');
    }

    // Overbudget badge - if cost per unit is high
    if (metrics.cost_per_unit > 100) { // Mock threshold
      badges.push('⚠️ Overbudget');
    }

    // Material waste badge - if waste percentage is high
    if (metrics.material_waste_pct > 10) {
      badges.push('🧱 Material Waste High');
    }

    return badges;
  }

  static async getIndustryAverages(trade: string): Promise<BenchmarkingMetrics> {
    // Mock industry averages
    const averages: Record<string, BenchmarkingMetrics> = {
      'concrete': {
        unit_output_rate: 8.5,
        avg_worker_count: 4.2,
        cost_per_unit: 85.0,
        material_waste_pct: 8.5,
        completion_duration: 12,
        satisfaction_score: 4.1
      },
      'framing': {
        unit_output_rate: 12.0,
        avg_worker_count: 3.8,
        cost_per_unit: 95.0,
        material_waste_pct: 6.2,
        completion_duration: 8,
        satisfaction_score: 4.3
      }
    };

    return averages[trade] || averages['concrete'];
  }
}