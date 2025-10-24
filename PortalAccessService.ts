import { ClientPortal, PortalAccessLog, PortalSiteData } from '../types/ClientPortal';

export class PortalAccessService {
  static generatePortalLink(siteId: string, role: 'client' | 'investor'): {
    portalId: string;
    accessCode: string;
    portalLink: string;
  } {
    const portalId = `portal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const accessCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const portalLink = `https://app.example.com/portal/${portalId}?code=${accessCode}`;
    
    return { portalId, accessCode, portalLink };
  }

  static async verifyAccessCode(email: string, code: string): Promise<{
    isValid: boolean;
    portal?: ClientPortal;
    error?: string;
  }> {
    // Mock verification - in real app, check against database
    const mockPortals: ClientPortal[] = [
      {
        id: 'portal_1',
        site_id: 'site_1',
        invited_by_contractor_id: 'contractor_1',
        role: 'client',
        email: email,
        access_code: code,
        created_at: new Date().toISOString(),
        permissions: {
          view_photos: true,
          view_reports: true,
          view_costs: true,
          view_progress: true
        },
        access_count: 0,
        is_active: true
      }
    ];

    const portal = mockPortals.find(p => p.email === email && p.access_code === code);
    
    if (!portal) {
      return { isValid: false, error: 'Invalid access code or email' };
    }

    if (!portal.is_active) {
      return { isValid: false, error: 'Portal access has been revoked' };
    }

    return { isValid: true, portal };
  }

  static async getViewableSiteData(siteId: string, role: 'client' | 'investor'): Promise<PortalSiteData> {
    // Mock data - in real app, fetch from database based on permissions
    return {
      site: {
        id: siteId,
        name: 'Downtown Office Complex',
        location: 'New York, NY',
        photo_url: 'https://example.com/site-photo.jpg',
        contractor_name: 'BuildCorp Construction',
        start_date: '2024-01-15',
        estimated_completion: '2024-12-31'
      },
      concepts: [
        {
          id: 'concept_1',
          name: 'Foundation Work',
          progress_percent: 85,
          status: 'in_progress'
        },
        {
          id: 'concept_2',
          name: 'Structural Framework',
          progress_percent: 45,
          status: 'in_progress'
        },
        {
          id: 'concept_3',
          name: 'Electrical Installation',
          progress_percent: 0,
          status: 'pending'
        }
      ],
      photos: [
        {
          id: 'photo_1',
          url: 'https://example.com/progress1.jpg',
          caption: 'Foundation completion',
          uploaded_at: '2024-01-20T10:00:00Z'
        },
        {
          id: 'photo_2',
          url: 'https://example.com/progress2.jpg',
          caption: 'Steel framework installation',
          uploaded_at: '2024-02-15T14:30:00Z'
        }
      ],
      reports: [
        {
          id: 'report_1',
          title: 'Monthly Progress Report - January',
          type: 'pdf',
          url: 'https://example.com/report-jan.pdf',
          generated_at: '2024-01-31T23:59:59Z'
        },
        {
          id: 'report_2',
          title: 'Cost Analysis Spreadsheet',
          type: 'excel',
          url: 'https://example.com/costs.xlsx',
          generated_at: '2024-02-01T09:00:00Z'
        }
      ],
      costs: {
        total_budget: 2500000,
        spent_amount: 1200000,
        remaining_budget: 1300000,
        roi_estimate: 15.5,
        cost_breakdown: [
          { category: 'Labor', amount: 600000, percentage: 50 },
          { category: 'Materials', amount: 400000, percentage: 33.3 },
          { category: 'Equipment', amount: 150000, percentage: 12.5 },
          { category: 'Other', amount: 50000, percentage: 4.2 }
        ]
      }
    };
  }

  static async logPortalAccess(portalId: string, ipAddress?: string): Promise<void> {
    // Mock logging - in real app, save to database
    const accessLog: PortalAccessLog = {
      id: `log_${Date.now()}`,
      portal_id: portalId,
      accessed_at: new Date().toISOString(),
      ip_address: ipAddress || '127.0.0.1',
      user_agent: 'Mock User Agent'
    };
    
    console.log('Portal access logged:', accessLog);
  }
}