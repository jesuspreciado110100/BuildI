import { ResponseTimeMetrics, MachineryRequest, UserProfile, ResponseTimeLeaderboard } from '../types';

export class ResponseTimeService {
  private static instance: ResponseTimeService;
  private mockRequests: MachineryRequest[] = [];
  private mockProfiles: UserProfile[] = [];

  static getInstance(): ResponseTimeService {
    if (!ResponseTimeService.instance) {
      ResponseTimeService.instance = new ResponseTimeService();
    }
    return ResponseTimeService.instance;
  }

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock machinery requests with response times
    this.mockRequests = [
      {
        id: '1',
        machinery_id: 'mach1',
        contractor_id: 'cont1',
        renter_id: 'rent1',
        start_date: '2024-01-15',
        end_date: '2024-01-20',
        status: 'accepted',
        total_cost: 1500,
        created_at: '2024-01-10T10:00:00Z',
        response_time_seconds: 90,
        responded_at: '2024-01-10T10:01:30Z'
      },
      {
        id: '2',
        machinery_id: 'mach2',
        contractor_id: 'cont2',
        renter_id: 'rent2',
        start_date: '2024-01-12',
        end_date: '2024-01-18',
        status: 'accepted',
        total_cost: 2000,
        created_at: '2024-01-08T14:00:00Z',
        response_time_seconds: 300,
        responded_at: '2024-01-08T14:05:00Z'
      }
    ];

    this.calculateAllMetrics();
  }

  async recordResponse(requestId: string): Promise<number> {
    const request = this.mockRequests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');

    const now = new Date();
    const createdAt = new Date(request.created_at);
    const responseTimeSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

    request.responded_at = now.toISOString();
    request.response_time_seconds = responseTimeSeconds;
    request.status = 'accepted';

    this.recalculateRenterMetrics(request.renter_id);
    return responseTimeSeconds;
  }

  async getRenterProfile(renterId: string): Promise<UserProfile | null> {
    return this.mockProfiles.find(p => p.user_id === renterId) || null;
  }

  async getLeaderboard(region?: string): Promise<ResponseTimeLeaderboard[]> {
    const leaderboard: ResponseTimeLeaderboard[] = [
      {
        renter_id: 'rent1',
        renter_name: 'FastRent Co',
        company: 'FastRent Equipment',
        avg_response_time: 85,
        response_score: 'excellent',
        rank: 1,
        previous_rank: 2,
        weekly_movement: 'up',
        total_responses: 45,
        region: 'North'
      },
      {
        renter_id: 'rent2',
        renter_name: 'QuickMachinery',
        company: 'Quick Machinery LLC',
        avg_response_time: 180,
        response_score: 'good',
        rank: 2,
        previous_rank: 1,
        weekly_movement: 'down',
        total_responses: 32,
        region: 'North'
      }
    ];

    return region ? leaderboard.filter(l => l.region === region) : leaderboard;
  }

  private recalculateRenterMetrics(renterId: string) {
    const renterRequests = this.mockRequests.filter(r => r.renter_id === renterId && r.response_time_seconds);
    
    if (renterRequests.length === 0) return;

    const totalResponseTime = renterRequests.reduce((sum, r) => sum + (r.response_time_seconds || 0), 0);
    const avgResponseTime = totalResponseTime / renterRequests.length;
    
    const responseScore = this.categorizeResponseTime(avgResponseTime);
    const boostMultiplier = this.calculateBoostMultiplier(responseScore);

    let profile = this.mockProfiles.find(p => p.user_id === renterId);
    if (!profile) {
      profile = {
        id: `profile_${renterId}`,
        user_id: renterId,
        role: 'machinery_renter'
      };
      this.mockProfiles.push(profile);
    }

    profile.avg_response_time = avgResponseTime;
    profile.response_score = responseScore;
    profile.boost_multiplier = boostMultiplier;
    profile.total_responses = renterRequests.length;
    profile.last_calculated = new Date().toISOString();
  }

  private calculateAllMetrics() {
    const renterIds = [...new Set(this.mockRequests.map(r => r.renter_id))];
    renterIds.forEach(renterId => this.recalculateRenterMetrics(renterId));
  }

  categorizeResponseTime(avgSeconds: number): 'excellent' | 'good' | 'slow' {
    if (avgSeconds < 120) return 'excellent'; // < 2 min
    if (avgSeconds <= 600) return 'good'; // 2-10 min
    return 'slow'; // > 10 min
  }

  private calculateBoostMultiplier(score: 'excellent' | 'good' | 'slow'): number {
    switch (score) {
      case 'excellent': return 1.2;
      case 'good': return 1.1;
      case 'slow': return 1.0;
    }
  }

  formatResponseTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  getResponseBadge(score: 'excellent' | 'good' | 'slow'): { emoji: string; text: string } {
    switch (score) {
      case 'excellent': return { emoji: '⚡', text: 'Fast Responder' };
      case 'good': return { emoji: '✓', text: 'Good Response' };
      case 'slow': return { emoji: '⏱️', text: 'Needs Improvement' };
    }
  }

  async recalculateWeeklyMetrics(): Promise<void> {
    // Simulate weekly recalculation
    this.calculateAllMetrics();
  }
}