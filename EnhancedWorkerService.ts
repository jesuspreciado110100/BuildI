import { supabase } from '../lib/supabase';

export interface WorkerSkill {
  id: string;
  skill_name: string;
  proficiency_level: number; // 1-5
  years_experience: number;
  is_certified: boolean;
  certification_name?: string;
}

export interface WorkerAvailability {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface EnhancedWorker {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  trade_type: string;
  skill_level: 'Beginner' | 'Mid' | 'Expert';
  skills: WorkerSkill[];
  hourly_rate: number;
  location: string;
  availability_status: 'Available' | 'Busy' | 'Offline';
  available_from?: string;
  available_until?: string;
  rating: number;
  completed_jobs: number;
  profile_image_url?: string;
  experience_years: number;
  is_verified: boolean;
  availability_schedule: WorkerAvailability[];
}

export interface SkillMatchResult {
  worker: EnhancedWorker;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
}

export class EnhancedWorkerService {
  // Skill matching algorithm
  static calculateSkillMatch(worker: EnhancedWorker, requiredSkills: string[]): SkillMatchResult {
    const workerSkillNames = worker.skills.map(s => s.skill_name.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());
    
    const matchingSkills = requiredSkillsLower.filter(skill => 
      workerSkillNames.includes(skill)
    );
    
    const missingSkills = requiredSkillsLower.filter(skill => 
      !workerSkillNames.includes(skill)
    );
    
    const match_score = matchingSkills.length / requiredSkills.length;
    
    return {
      worker,
      match_score,
      matching_skills: matchingSkills,
      missing_skills: missingSkills
    };
  }

  // Check availability for specific date range
  static checkAvailability(worker: EnhancedWorker, startDate: string, endDate: string): boolean {
    if (worker.availability_status !== 'Available') return false;
    
    // Check if worker is available in the date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (worker.available_from && new Date(worker.available_from) > start) return false;
    if (worker.available_until && new Date(worker.available_until) < end) return false;
    
    return true;
  }

  // Find best matching workers
  static async findMatchingWorkers(
    requiredSkills: string[],
    tradeType: string,
    startDate: string,
    endDate: string,
    maxResults: number = 10
  ): Promise<SkillMatchResult[]> {
    // In a real implementation, this would query Supabase
    const mockWorkers = await this.getMockWorkers();
    
    const results: SkillMatchResult[] = [];
    
    for (const worker of mockWorkers) {
      // Filter by trade type
      if (worker.trade_type !== tradeType) continue;
      
      // Check availability
      if (!this.checkAvailability(worker, startDate, endDate)) continue;
      
      // Calculate skill match
      const matchResult = this.calculateSkillMatch(worker, requiredSkills);
      
      // Only include workers with some skill match
      if (matchResult.match_score > 0) {
        results.push(matchResult);
      }
    }
    
    // Sort by match score (descending) and rating
    results.sort((a, b) => {
      if (a.match_score !== b.match_score) {
        return b.match_score - a.match_score;
      }
      return b.worker.rating - a.worker.rating;
    });
    
    return results.slice(0, maxResults);
  }

  // Get mock workers data
  static async getMockWorkers(): Promise<EnhancedWorker[]> {
    return [
      {
        id: '1',
        name: 'John Martinez',
        trade_type: 'Masonry',
        skill_level: 'Expert',
        skills: [
          { id: '1', skill_name: 'Bricklaying', proficiency_level: 5, years_experience: 8, is_certified: true, certification_name: 'Master Mason' },
          { id: '2', skill_name: 'Stone Work', proficiency_level: 4, years_experience: 6, is_certified: true },
          { id: '3', skill_name: 'Concrete Block', proficiency_level: 5, years_experience: 8, is_certified: false }
        ],
        hourly_rate: 45,
        location: 'North Region',
        availability_status: 'Available',
        rating: 4.8,
        completed_jobs: 127,
        experience_years: 8,
        is_verified: true,
        availability_schedule: []
      },
      {
        id: '2',
        name: 'Sarah Chen',
        trade_type: 'Carpentry',
        skill_level: 'Expert',
        skills: [
          { id: '4', skill_name: 'Framing', proficiency_level: 5, years_experience: 12, is_certified: true, certification_name: 'Licensed Carpenter' },
          { id: '5', skill_name: 'Finish Work', proficiency_level: 5, years_experience: 10, is_certified: true },
          { id: '6', skill_name: 'Cabinet Installation', proficiency_level: 4, years_experience: 8, is_certified: false }
        ],
        hourly_rate: 42,
        location: 'South Region',
        availability_status: 'Available',
        rating: 4.9,
        completed_jobs: 98,
        experience_years: 12,
        is_verified: true,
        availability_schedule: []
      }
    ];
  }
}