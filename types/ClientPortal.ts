export interface ClientPortal {
  id: string;
  site_id: string;
  invited_by_contractor_id: string;
  role: 'client' | 'investor';
  email: string;
  access_code: string;
  created_at: string;
  permissions: {
    view_photos: boolean;
    view_reports: boolean;
    view_costs: boolean;
    view_progress: boolean;
  };
  last_accessed?: string;
  access_count: number;
  is_active: boolean;
}

export interface PortalAccessLog {
  id: string;
  portal_id: string;
  accessed_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface PortalSiteData {
  site: {
    id: string;
    name: string;
    location: string;
    photo_url?: string;
    contractor_name: string;
    start_date: string;
    estimated_completion: string;
  };
  concepts: {
    id: string;
    name: string;
    progress_percent: number;
    status: string;
  }[];
  photos: {
    id: string;
    url: string;
    caption?: string;
    uploaded_at: string;
  }[];
  reports: {
    id: string;
    title: string;
    type: 'pdf' | 'excel';
    url: string;
    generated_at: string;
  }[];
  costs: {
    total_budget: number;
    spent_amount: number;
    remaining_budget: number;
    roi_estimate: number;
    cost_breakdown: {
      category: string;
      amount: number;
      percentage: number;
    }[];
  };
}