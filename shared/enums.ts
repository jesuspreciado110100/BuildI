// Shared enums and constants
export enum UserRole {
  CONTRACTOR = 'contractor',
  LABOR_CHIEF = 'labor_chief',
  MACHINERY_RENTER = 'machinery_renter',
  MATERIAL_SUPPLIER = 'material_supplier',
  ADMIN = 'admin'
}

export enum JobStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  COMPLETED = 'completed'
}

export enum SiteStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold'
}

export enum ConceptStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum PhaseStatus {
  PENDING = 'pending',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum NotificationType {
  DELIVERY = 'delivery',
  INVENTORY = 'inventory',
  MATERIAL_QUOTE = 'material_quote',
  PRICING_INSIGHT = 'pricing_insight',
  RESPONSE_TIME = 'response_time',
  GUARANTEE_CONFIRMATION = 'guarantee_confirmation',
  GUARANTEE_CLAIM = 'guarantee_claim',
  RESPONSE_REPORT = 'response_report',
  CALENDAR_CONFLICT = 'calendar_conflict',
  JOB_REMINDER = 'job_reminder',
  SKILL_MATCH = 'skill_match',
  PHASE_READY = 'phase_ready',
  PHASE_TRANSITION = 'phase_transition',
  SAFETY_REMINDER = 'safety_reminder',
  SAFETY_ALERT = 'safety_alert',
  SAFETY_INCIDENT = 'safety_incident',
  OFFLINE_WORKER_MATCHED = 'offline_worker_matched',
  WALK_IN_SMS = 'walk_in_sms',
  CONTRACT_GENERATED = 'contract_generated',
  CONTRACT_REMINDER = 'contract_reminder',
  BENCHMARK_WEEKLY_DIGEST = 'benchmark_weekly_digest',
  BENCHMARK_RISK_ALERT = 'benchmark_risk_alert',
  TEAM_RANKING = 'team_ranking',
  WORKER_ACHIEVEMENT = 'worker_achievement',
  DELAY_ALERT = 'delay_alert',
  DELAY_RECOVERY = 'delay_recovery',
  PORTFOLIO_PERFORMANCE = 'portfolio_performance',
  SITE_FLAGGED = 'site_flagged'
}

export enum SkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum ResponseScore {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  SLOW = 'slow'
}

export enum PricingScore {
  LOW = 'low',
  FAIR = 'fair',
  HIGH = 'high'
}

// Common constants
export const TRADES = [
  'Concrete',
  'Masonry',
  'Steel',
  'Carpentry',
  'Roofing',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Painting',
  'Flooring',
  'Insulation',
  'Drywall'
];

export const DELAY_REASONS = [
  'Labor shortage',
  'Material delay',
  'Weather',
  'Crew absenteeism',
  'Design change'
];

export const REGIONS = [
  'North',
  'South',
  'East',
  'West',
  'Central'
];