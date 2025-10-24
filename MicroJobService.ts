export interface MicroJob {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  budget: number;
  location: string;
  urgency: string;
  requirements: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  siteId?: string;
  createdAt: string;
  completedAt?: string;
  applicants?: number;
  assignedWorker?: {
    id: string;
    name: string;
    rating: number;
  };
}

export class MicroJobService {
  private static jobs: MicroJob[] = [
    {
      id: '1',
      title: 'Clean up construction debris',
      description: 'Remove debris from completed concrete pour area',
      category: 'Cleanup',
      duration: '2-4 hours',
      budget: 150.00,
      location: 'Site A - Building 1',
      urgency: 'Normal',
      requirements: 'Basic tools provided',
      status: 'completed',
      createdAt: '2024-01-10T09:00:00Z',
      completedAt: '2024-01-10T13:00:00Z',
      assignedWorker: {
        id: 'worker1',
        name: 'John Smith',
        rating: 4.8
      }
    },
    {
      id: '2',
      title: 'Move materials to storage',
      description: 'Transport lumber and supplies to warehouse',
      category: 'Moving',
      duration: '1-2 hours',
      budget: 80.00,
      location: 'Site B - Warehouse',
      urgency: 'High',
      requirements: 'Must be able to lift 50lbs',
      status: 'assigned',
      createdAt: '2024-01-12T14:00:00Z',
      applicants: 5,
      assignedWorker: {
        id: 'worker2',
        name: 'Mike Johnson',
        rating: 4.6
      }
    },
    {
      id: '3',
      title: 'Install door hardware',
      description: 'Install handles and locks on 5 doors',
      category: 'Installation',
      duration: '2-4 hours',
      budget: 200.00,
      location: 'Office Building - 3rd Floor',
      urgency: 'Normal',
      requirements: 'Basic hand tools required',
      status: 'open',
      createdAt: '2024-01-14T11:00:00Z',
      applicants: 3
    }
  ];

  static async createJob(job: Omit<MicroJob, 'id' | 'createdAt'>): Promise<MicroJob> {
    const newJob: MicroJob = {
      ...job,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    this.jobs.push(newJob);
    return newJob;
  }

  static async getUserJobs(userId: string): Promise<MicroJob[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.jobs;
  }

  static async getJobById(id: string): Promise<MicroJob | null> {
    return this.jobs.find(job => job.id === id) || null;
  }

  static async updateJob(id: string, updates: Partial<MicroJob>): Promise<MicroJob | null> {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return null;
    
    this.jobs[index] = { ...this.jobs[index], ...updates };
    return this.jobs[index];
  }

  static async deleteJob(id: string): Promise<boolean> {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return false;
    
    this.jobs.splice(index, 1);
    return true;
  }

  static async getJobsByStatus(status: string): Promise<MicroJob[]> {
    return this.jobs.filter(job => job.status === status);
  }

  static async getJobsBySite(siteId: string): Promise<MicroJob[]> {
    return this.jobs.filter(job => job.siteId === siteId);
  }

  static async getJobsByCategory(category: string): Promise<MicroJob[]> {
    return this.jobs.filter(job => job.category === category);
  }

  static async searchJobs(query: string): Promise<MicroJob[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.jobs.filter(job => 
      job.title.toLowerCase().includes(lowercaseQuery) ||
      job.description.toLowerCase().includes(lowercaseQuery) ||
      job.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  static async assignWorker(jobId: string, workerId: string, workerName: string, workerRating: number): Promise<boolean> {
    const job = await this.getJobById(jobId);
    if (!job || job.status !== 'open') return false;

    await this.updateJob(jobId, {
      status: 'assigned',
      assignedWorker: {
        id: workerId,
        name: workerName,
        rating: workerRating
      }
    });
    return true;
  }

  static async completeJob(jobId: string): Promise<boolean> {
    const job = await this.getJobById(jobId);
    if (!job || job.status !== 'in_progress') return false;

    await this.updateJob(jobId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    return true;
  }

  static getCategories(): string[] {
    return [
      'Cleanup', 'Moving', 'Delivery', 'Assembly', 'Painting',
      'Repair', 'Installation', 'Inspection', 'Documentation', 'Other'
    ];
  }

  static getDurations(): string[] {
    return [
      '< 1 hour', '1-2 hours', '2-4 hours', '4-8 hours', '1 day', '2-3 days'
    ];
  }

  static getUrgencyLevels(): string[] {
    return ['Low', 'Normal', 'High', 'Urgent'];
  }
}