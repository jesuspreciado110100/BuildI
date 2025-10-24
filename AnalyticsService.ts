import { WorkerAnalytics, WorkerProfile, WorkerFeedback, MicroJobRequest, LaborRequest, AssignedWorker, BIMConcept } from '../types';

class AnalyticsService {
  private static instance: AnalyticsService;
  private mockWorkers: WorkerProfile[] = [];
  private mockFeedback: WorkerFeedback[] = [];
  private mockMicroJobs: MicroJobRequest[] = [];
  private mockLaborRequests: LaborRequest[] = [];
  private mockConcepts: BIMConcept[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock concepts
    this.mockConcepts = [
      { id: '1', name: 'Foundation Work', description: '', category: 'Structure', progress: 100, status: 'completed', dependencies: [], tags: [], created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: '2', name: 'Framing', description: '', category: 'Structure', progress: 80, status: 'in_progress', dependencies: [], tags: [], created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: '3', name: 'Electrical Rough-in', description: '', category: 'MEP', progress: 60, status: 'in_progress', dependencies: [], tags: [], created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: '4', name: 'Plumbing Installation', description: '', category: 'MEP', progress: 40, status: 'in_progress', dependencies: [], tags: [], created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: '5', name: 'Roofing', description: '', category: 'Exterior', progress: 90, status: 'in_progress', dependencies: [], tags: [], created_at: '2024-01-01', updated_at: '2024-01-01' }
    ];

    // Mock workers
    this.mockWorkers = [
      { id: '1', name: 'John Smith', trade_type: 'Foundations (Concrete Pouring, Footings)', hourly_rate: 45, experience_years: 8, rating: 4.8, availability: true, skills: ['Concrete', 'Footings'], assigned_job_ids: [], completed_jobs_count: 24 },
      { id: '2', name: 'Maria Garcia', trade_type: 'Electrical Installation', hourly_rate: 50, experience_years: 6, rating: 4.9, availability: true, skills: ['Wiring', 'Panels'], assigned_job_ids: [], completed_jobs_count: 18 },
      { id: '3', name: 'David Chen', trade_type: 'Carpentry / Rough Framing', hourly_rate: 42, experience_years: 10, rating: 4.7, availability: false, skills: ['Framing', 'Trim'], assigned_job_ids: [], completed_jobs_count: 31 },
      { id: '4', name: 'Sarah Johnson', trade_type: 'Plumbing & Sanitary Installation', hourly_rate: 48, experience_years: 7, rating: 4.6, availability: true, skills: ['Pipes', 'Fixtures'], assigned_job_ids: [], completed_jobs_count: 22 }
    ];

    // Mock feedback
    this.mockFeedback = [
      { id: '1', request_id: 'req1', concept_id: '1', contractor_id: 'c1', worker_id: '1', rating: 5, comment: 'Excellent foundation work, very professional', timestamp: '2024-01-15' },
      { id: '2', request_id: 'req2', concept_id: '2', contractor_id: 'c1', worker_id: '1', rating: 4, comment: 'Good quality work', timestamp: '2024-01-20' },
      { id: '3', request_id: 'req3', concept_id: '3', contractor_id: 'c2', worker_id: '2', rating: 5, comment: 'Outstanding electrical work, ahead of schedule', timestamp: '2024-01-18' },
      { id: '4', request_id: 'req4', concept_id: '2', contractor_id: 'c1', worker_id: '3', rating: 5, comment: 'Perfect framing work, very detailed', timestamp: '2024-01-22' },
      { id: '5', request_id: 'req5', concept_id: '4', contractor_id: 'c2', worker_id: '4', rating: 4, comment: 'Solid plumbing installation', timestamp: '2024-01-25' }
    ];
  }

  async getWorkerAnalytics(tradeType?: string, conceptId?: string): Promise<WorkerAnalytics[]> {
    let filteredWorkers = this.mockWorkers;
    
    if (tradeType) {
      filteredWorkers = filteredWorkers.filter(w => w.trade_type === tradeType);
    }

    return filteredWorkers.map(worker => {
      const workerFeedback = this.mockFeedback.filter(f => f.worker_id === worker.id);
      const conceptFeedback = conceptId ? workerFeedback.filter(f => f.concept_id === conceptId) : workerFeedback;
      
      const jobsByConcept: { [concept_name: string]: number } = {};
      conceptFeedback.forEach(feedback => {
        const concept = this.mockConcepts.find(c => c.id === feedback.concept_id);
        if (concept) {
          jobsByConcept[concept.name] = (jobsByConcept[concept.name] || 0) + 1;
        }
      });

      const avgRating = conceptFeedback.length > 0 
        ? conceptFeedback.reduce((sum, f) => sum + f.rating, 0) / conceptFeedback.length 
        : worker.rating;

      const topReview = conceptFeedback
        .filter(f => f.comment && f.comment.length > 0)
        .sort((a, b) => b.rating - a.rating)[0];

      return {
        worker_id: worker.id,
        trade_type: worker.trade_type,
        avg_rating: avgRating,
        completed_jobs: worker.completed_jobs_count,
        jobs_by_concept: jobsByConcept,
        feedback_stats: {
          avg_stars: avgRating,
          total_reviews: conceptFeedback.length
        },
        last_active: '2024-01-' + (Math.floor(Math.random() * 30) + 1).toString().padStart(2, '0'),
        top_review_comment: topReview?.comment
      };
    });
  }

  async getTradeTypes(): Promise<string[]> {
    return [
      'Excavation / Earthworks',
      'Foundations (Concrete Pouring, Footings)',
      'Rebar / Steel Fixing',
      'Formwork / Shuttering',
      'Concrete Finishing',
      'Structural Masonry (Block, Brick)',
      'Structural Steel Erection',
      'Carpentry / Rough Framing',
      'Roofing (Waterproofing + Structure)',
      'Windows / Glazing + Metalwork',
      'Plumbing & Sanitary Installation',
      'Electrical Installation',
      'HVAC / Ventilation',
      'Fire Protection Systems',
      'Drywall / Partition Systems',
      'Tile & Stone Installation',
      'Painting & Surface Coating',
      'Ceilings (Suspended, Decorative)',
      'Finish Carpentry / Millwork',
      'Landscaping / Site Works'
    ];
  }

  async getConceptsForAnalytics(): Promise<BIMConcept[]> {
    return this.mockConcepts;
  }

  async getWorkerProfile(workerId: string): Promise<WorkerProfile | null> {
    return this.mockWorkers.find(w => w.id === workerId) || null;
  }
}

export default AnalyticsService.getInstance();