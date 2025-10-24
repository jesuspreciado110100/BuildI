import { WorkerProfile, AssignedWorker } from '../types';

// Mock worker data
const mockWorkers: WorkerProfile[] = [
  {
    id: '1',
    name: 'John Martinez',
    trade_type: 'Masonry',
    skill_level: 'Expert',
    unit_price: 45,
    location: 'North Region',
    is_featured: true,
    photos: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
    rating: 4.8,
    completed_jobs_count: 127,
    availability_status: 'Available now',
    assigned_job_ids: [],
    hourly_rate: 45,
    experience_years: 8,
    availability: true,
    skills: ['Masonry', 'Bricklaying', 'Stone Work'],
    skill_certifications: ['OSHA 30', 'Masonry Specialist']
  },
  {
    id: '2',
    name: 'Sarah Chen',
    trade_type: 'Carpentry',
    skill_level: 'Expert',
    unit_price: 42,
    location: 'South Region',
    is_featured: true,
    photos: ['https://via.placeholder.com/150'],
    rating: 4.9,
    completed_jobs_count: 98,
    availability_status: 'Available now',
    assigned_job_ids: [],
    hourly_rate: 42,
    experience_years: 12,
    availability: true,
    skills: ['Carpentry', 'Framing', 'Finish Work'],
    skill_certifications: ['Licensed Carpenter', 'OSHA 10']
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    trade_type: 'Steelwork',
    skill_level: 'Mid',
    unit_price: 38,
    location: 'East Region',
    is_featured: false,
    photos: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
    rating: 4.5,
    completed_jobs_count: 67,
    availability_status: 'Soon',
    assigned_job_ids: [],
    hourly_rate: 38,
    experience_years: 5,
    availability: false,
    skills: ['Steelwork', 'Welding', 'Structural'],
    skill_certifications: ['Certified Welder']
  },
  {
    id: '4',
    name: 'Lisa Thompson',
    trade_type: 'Concrete',
    skill_level: 'Expert',
    unit_price: 48,
    location: 'West Region',
    is_featured: false,
    photos: ['https://via.placeholder.com/150'],
    rating: 4.7,
    completed_jobs_count: 89,
    availability_status: 'Available now',
    assigned_job_ids: [],
    hourly_rate: 48,
    experience_years: 10,
    availability: true,
    skills: ['Concrete', 'Pouring', 'Finishing'],
    skill_certifications: ['Concrete Specialist', 'OSHA 30']
  },
  {
    id: '5',
    name: 'David Kim',
    trade_type: 'Formwork',
    skill_level: 'Beginner',
    unit_price: 28,
    location: 'North Region',
    is_featured: false,
    photos: ['https://via.placeholder.com/150'],
    rating: 4.2,
    completed_jobs_count: 23,
    availability_status: 'Busy',
    assigned_job_ids: [],
    hourly_rate: 28,
    experience_years: 2,
    availability: false,
    skills: ['Formwork', 'Basic Construction'],
    skill_certifications: ['OSHA 10']
  },
  {
    id: '6',
    name: 'Anna Kowalski',
    trade_type: 'Masonry',
    skill_level: 'Mid',
    unit_price: 35,
    location: 'South Region',
    is_featured: false,
    photos: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
    rating: 4.6,
    completed_jobs_count: 54,
    availability_status: 'Available now',
    assigned_job_ids: [],
    hourly_rate: 35,
    experience_years: 6,
    availability: true,
    skills: ['Masonry', 'Stonework', 'Repair'],
    skill_certifications: ['OSHA 10', 'Masonry Certification']
  }
];

export interface WorkerFilters {
  trade_type?: string;
  skill_level?: string;
  min_price?: number;
  max_price?: number;
  availability_status?: string;
  search?: string;
}

export interface WorkerSortOptions {
  sort_by: 'rating' | 'price' | 'proximity' | 'featured';
  order: 'asc' | 'desc';
}

export class WorkerService {
  static async getWorkers(filters?: WorkerFilters, sort?: WorkerSortOptions): Promise<WorkerProfile[]> {
    let filteredWorkers = [...mockWorkers];

    // Apply filters
    if (filters) {
      if (filters.trade_type) {
        filteredWorkers = filteredWorkers.filter(w => w.trade_type === filters.trade_type);
      }
      if (filters.skill_level) {
        filteredWorkers = filteredWorkers.filter(w => w.skill_level === filters.skill_level);
      }
      if (filters.min_price !== undefined) {
        filteredWorkers = filteredWorkers.filter(w => w.unit_price >= filters.min_price!);
      }
      if (filters.max_price !== undefined) {
        filteredWorkers = filteredWorkers.filter(w => w.unit_price <= filters.max_price!);
      }
      if (filters.availability_status) {
        filteredWorkers = filteredWorkers.filter(w => w.availability_status === filters.availability_status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredWorkers = filteredWorkers.filter(w => 
          w.name.toLowerCase().includes(searchLower) ||
          w.trade_type.toLowerCase().includes(searchLower)
        );
      }
    }

    // Apply sorting
    if (sort) {
      filteredWorkers.sort((a, b) => {
        let comparison = 0;
        switch (sort.sort_by) {
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'price':
            comparison = a.unit_price - b.unit_price;
            break;
          case 'proximity':
            // Mock proximity sorting
            comparison = Math.random() - 0.5;
            break;
          case 'featured':
            comparison = (a.is_featured ? 1 : 0) - (b.is_featured ? 1 : 0);
            break;
        }
        return sort.order === 'desc' ? -comparison : comparison;
      });
    } else {
      // Default sort: featured first, then by rating
      filteredWorkers.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return b.rating - a.rating;
      });
    }

    return filteredWorkers;
  }

  static async getWorkerById(id: string): Promise<WorkerProfile | null> {
    return mockWorkers.find(w => w.id === id) || null;
  }

  static async getAvailableWorkers(tradeType: string, startDate: string, durationDays: number): Promise<WorkerProfile[]> {
    // Filter workers by trade type and availability
    const availableWorkers = mockWorkers.filter(worker => {
      // Match trade type
      if (worker.trade_type !== tradeType) return false;
      
      // Check if worker is not busy
      if (worker.availability_status === 'Busy') return false;
      
      // Check for overlapping assignments (simplified logic)
      const hasOverlappingAssignment = worker.assigned_job_ids.length > 0;
      
      return !hasOverlappingAssignment;
    });

    return availableWorkers;
  }

  static async assignWorkerToJob(workerId: string, jobId: string): Promise<void> {
    const worker = mockWorkers.find(w => w.id === workerId);
    if (worker && !worker.assigned_job_ids.includes(jobId)) {
      worker.assigned_job_ids.push(jobId);
    }
  }

  static async unassignWorkerFromJob(workerId: string, jobId: string): Promise<void> {
    const worker = mockWorkers.find(w => w.id === workerId);
    if (worker) {
      worker.assigned_job_ids = worker.assigned_job_ids.filter(id => id !== jobId);
    }
  }

  static getTradeTypes(): string[] {
    return ['Masonry', 'Carpentry', 'Steelwork', 'Concrete', 'Formwork', 'Rebar', 'Plumbing', 'Electrical'];
  }

  static getSkillLevels(): string[] {
    return ['Beginner', 'Mid', 'Expert'];
  }

  static getAvailabilityStatuses(): string[] {
    return ['Available now', 'Soon', 'Busy'];
  }
}