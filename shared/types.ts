// Shared types for frontend and backend
// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'contractor' | 'labor_chief' | 'machinery_renter' | 'material_supplier' | 'admin';
  company?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  is_active: boolean;
  last_login?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  role: string;
  avg_response_time?: number;
  response_score?: 'excellent' | 'good' | 'slow';
  boost_multiplier?: number;
  weekly_rank?: number;
  total_responses?: number;
  last_calculated?: string;
}

export interface Site {
  id: string;
  name: string;
  location: string;
  region: string;
  contractor_id: string;
  status: 'active' | 'completed' | 'on_hold';
  total_budget: number;
  spent_budget: number;
  start_date: string;
  end_date?: string;
  concepts: ConstructionConcept[];
  worker_count: number;
  created_at: string;
}

export interface ContractorProfile {
  id: string;
  user_id: string;
  company_name: string;
  license_number: string;
  specialties: string[];
  location: string;
  created_at: string;
  sites: Site[];
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  hourly_rate: number;
  location: string;
  skills: string[];
  skill_certifications: string[];
  preferred_unit_type: string;
  created_at: string;
  source?: 'online' | 'offline';
  avg_output_per_day?: number;
  avg_rating?: number;
  completed_jobs_count?: number;
  lateness_rate?: number;
  job_acceptance_rate?: number;
  material_waste_ratio?: number;
  top_concepts?: string[];
}

export interface LaborChiefProfile {
  id: string;
  user_id: string;
  crew_size: number;
  specialties: string[];
  hourly_rate: number;
  location: string;
  crew_availability: CalendarSlot[];
  skills: string[];
  skill_certifications: string[];
  preferred_unit_type: string;
  created_at: string;
  avg_output_per_day?: number;
  avg_rating?: number;
  completed_jobs_count?: number;
  lateness_rate?: number;
  job_acceptance_rate?: number;
  material_waste_ratio?: number;
  top_concepts?: string[];
}

export interface CalendarSlot {
  id: string;
  day: string;
  time_start: string;
  time_end: string;
  status: 'available' | 'unavailable' | 'booked';
  notes?: string;
  booking_id?: string;
}

export interface SkillMatch {
  labor_chief_id: string;
  score: number;
  matching_skills: string[];
  rating: number;
  availability_score: number;
  location_score: number;
  total_score: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Job Board Types
export interface JobBoardPost {
  id: string;
  concept_id?: string;
  site_id: string;
  trade_type: string;
  volume: number;
  unit: string;
  price_per_unit: number;
  deadline: string;
  contact_name: string;
  status: 'open' | 'closed';
  is_offline_post: boolean;
  created_at: string;
  applications?: WalkInApplication[];
}

export interface WalkInApplication {
  id: string;
  job_post_id: string;
  worker_name: string;
  phone?: string;
  trade_type: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  photo_url?: string;
  referred_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}