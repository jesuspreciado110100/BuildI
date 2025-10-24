export interface Site {
  id: string;
  name: string;
  location: string;
  contractor_id: string;
  status: 'active' | 'planning' | 'completed' | 'on_hold';
  timezone: string;
  country: string;
  region: string;
  currency: string;
  base_currency: string;
  language: string;
  unit_system: string;
  overall_progress: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt?: string;
  updatedAt?: string;
  documents?: Document[];
  concepts?: Concept[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  size?: number;
}

export interface Concept {
  id: string;
  name: string;
  trade: string;
  description?: string;
  status: 'pending' | 'active' | 'completed';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  onboarding_completed: boolean;
  created_at?: string;
}


export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  budget: number;
  startDate: string;
  endDate?: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed';
  contractorId: string;
  laborChiefId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  type: string;
  count: number;
}

export interface CrewRecommendation {
  labor_chief_id: string;
  labor_chief_name: string;
  match_score: number;
  expected_completion_time: number;
  ai_rationale: string;
  crew_size: number;
  rating: number;
  availability: boolean;
  distance_km: number;
}