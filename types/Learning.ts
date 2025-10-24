// Learning Center and Onboarding Types
export interface LearningModule {
  id: string;
  title: string;
  role: 'contractor' | 'labor_chief' | 'machinery_renter' | 'material_supplier' | 'admin';
  content_type: 'video' | 'tip' | 'quiz' | 'faq';
  completed: boolean;
  order: number;
  description: string;
  content: string;
  video_url?: string;
  duration_minutes?: number;
  quiz_questions?: QuizQuestion[];
  created_at: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  role: 'contractor' | 'labor_chief' | 'machinery_renter' | 'material_supplier' | 'admin';
  content_type: 'video' | 'tip' | 'quiz' | 'walkthrough';
  completed: boolean;
  order: number;
  description: string;
  content: string;
  target_element?: string;
  action_required?: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface LearningProgress {
  user_id: string;
  role: string;
  completed_modules: string[];
  completed_steps: string[];
  total_modules: number;
  total_steps: number;
  progress_percent: number;
  last_updated: string;
  onboarding_completed: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  role?: string;
  tags: string[];
  helpful_count: number;
  created_at: string;
}

export interface HelpTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  resolved_at?: string;
  admin_response?: string;
}

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  target_element: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action_text: string;
  order: number;
}