import { Site, Concept, ProgressLog, User } from '../types';

export class ClientPortalService {
  // Mock data for demonstration
  private static mockSites: Site[] = [
    {
      id: '1',
      name: 'Downtown Office Complex',
      location: 'Downtown District',
      address: '123 Main St, Downtown',
      contractor_id: 'contractor1',
      status: 'active',
      overall_progress: 65,
      last_updated: '2024-01-15T10:30:00Z'
    },
    {
      id: '2', 
      name: 'Residential Tower A',
      location: 'North Side',
      address: '456 Oak Ave, North Side',
      contractor_id: 'contractor2',
      status: 'active',
      overall_progress: 32,
      last_updated: '2024-01-14T16:45:00Z'
    }
  ];

  private static mockConcepts: Concept[] = [
    {
      id: '1',
      site_id: '1',
      trade: 'Foundations',
      planned_progress: 80,
      actual_progress: 75,
      photos: ['foundation1.jpg', 'foundation2.jpg'],
      ai_forecast: {
        predicted_completion: '2024-02-01',
        confidence: 85,
        factors: ['Weather conditions', 'Material availability']
      },
      last_updated: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      site_id: '1', 
      trade: 'Framing',
      planned_progress: 40,
      actual_progress: 45,
      photos: ['framing1.jpg'],
      last_updated: '2024-01-14T14:20:00Z'
    }
  ];

  private static mockProgressLogs: ProgressLog[] = [
    {
      id: '1',
      concept_id: '1',
      date: '2024-01-15',
      progress_percentage: 75,
      photos: ['progress1.jpg', 'progress2.jpg'],
      notes: 'Foundation work progressing well',
      created_by: 'contractor1'
    }
  ];

  static async getClientSites(userId: string): Promise<Site[]> {
    // In real implementation, filter by user's assigned_sites
    return this.mockSites;
  }

  static async getSiteConcepts(siteId: string): Promise<Concept[]> {
    return this.mockConcepts.filter(c => c.site_id === siteId);
  }

  static async getConceptProgressLogs(conceptId: string): Promise<ProgressLog[]> {
    return this.mockProgressLogs.filter(log => log.concept_id === conceptId);
  }

  static async getProgressPhotos(siteId: string): Promise<ProgressLog[]> {
    const concepts = await this.getSiteConcepts(siteId);
    const allLogs: ProgressLog[] = [];
    
    for (const concept of concepts) {
      const logs = await this.getConceptProgressLogs(concept.id);
      allLogs.push(...logs.filter(log => log.photos && log.photos.length > 0));
    }
    
    return allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static formatLastUpdated(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  }

  static getProgressColor(progress: number): string {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 60) return '#FF9800';
    if (progress >= 40) return '#FFC107';
    return '#F44336';
  }
}