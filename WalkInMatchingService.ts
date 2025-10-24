import { JobBoardPost, WalkInApplication, WorkerProfile } from '../types';

export class WalkInMatchingService {
  static async matchWalkInWorkers(jobPost: JobBoardPost): Promise<WalkInApplication[]> {
    // Get all pending applications for this job
    const applications = jobPost.applications?.filter(app => app.status === 'pending') || [];
    
    // Score applications based on trade match and skill level
    const scoredApplications = applications.map(app => ({
      ...app,
      matchScore: this.calculateMatchScore(jobPost, app)
    }));
    
    // Sort by match score (highest first)
    return scoredApplications.sort((a, b) => b.matchScore - a.matchScore);
  }
  
  static calculateMatchScore(jobPost: JobBoardPost, application: WalkInApplication): number {
    let score = 0;
    
    // Trade type match (40 points)
    if (application.trade_type === jobPost.trade_type) {
      score += 40;
    } else if (application.trade_type === 'general') {
      score += 20; // General labor can work on any trade
    }
    
    // Skill level scoring (30 points)
    const skillPoints = {
      'beginner': 10,
      'intermediate': 20,
      'advanced': 25,
      'expert': 30
    };
    score += skillPoints[application.skill_level] || 0;
    
    // Has phone number (10 points)
    if (application.phone) {
      score += 10;
    }
    
    // Has referral (10 points)
    if (application.referred_by) {
      score += 10;
    }
    
    // Has photo (10 points)
    if (application.photo_url) {
      score += 10;
    }
    
    return score;
  }
  
  static async approveApplication(applicationId: string): Promise<boolean> {
    try {
      // In a real app, this would update the database
      console.log(`Approving application ${applicationId}`);
      return true;
    } catch (error) {
      console.error('Error approving application:', error);
      return false;
    }
  }
  
  static async rejectApplication(applicationId: string, reason?: string): Promise<boolean> {
    try {
      // In a real app, this would update the database
      console.log(`Rejecting application ${applicationId}`, reason);
      return true;
    } catch (error) {
      console.error('Error rejecting application:', error);
      return false;
    }
  }
  
  static async assignToCrew(applicationId: string, crewId: string): Promise<boolean> {
    try {
      // In a real app, this would:
      // 1. Update application status to 'approved'
      // 2. Create WorkerProfile with source = 'offline'
      // 3. Assign to crew
      // 4. Send notifications
      console.log(`Assigning application ${applicationId} to crew ${crewId}`);
      return true;
    } catch (error) {
      console.error('Error assigning to crew:', error);
      return false;
    }
  }
  
  static async createOfflineWorkerProfile(application: WalkInApplication): Promise<WorkerProfile> {
    // Create a worker profile from walk-in application
    const profile: WorkerProfile = {
      id: `offline-${Date.now()}`,
      user_id: `user-${Date.now()}`,
      hourly_rate: this.getDefaultHourlyRate(application.trade_type, application.skill_level),
      location: 'On-site',
      skills: [application.trade_type],
      skill_certifications: [],
      preferred_unit_type: 'hourly',
      created_at: new Date().toISOString(),
      source: 'offline'
    };
    
    return profile;
  }
  
  private static getDefaultHourlyRate(tradeType: string, skillLevel: string): number {
    const baseRates = {
      'general': 20,
      'concrete': 25,
      'electrical': 35,
      'plumbing': 30,
      'carpentry': 28,
      'welding': 32,
      'roofing': 26,
      'painting': 22
    };
    
    const skillMultipliers = {
      'beginner': 0.8,
      'intermediate': 1.0,
      'advanced': 1.2,
      'expert': 1.4
    };
    
    const baseRate = baseRates[tradeType] || baseRates['general'];
    const multiplier = skillMultipliers[skillLevel] || 1.0;
    
    return Math.round(baseRate * multiplier);
  }
  
  static async getMatchingSuggestions(jobPost: JobBoardPost): Promise<{
    bestMatches: WalkInApplication[];
    totalApplicants: number;
    averageSkillLevel: string;
  }> {
    const matches = await this.matchWalkInWorkers(jobPost);
    
    // Calculate average skill level
    const skillLevels = matches.map(app => app.skill_level);
    const skillValues = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    const avgSkillValue = skillLevels.reduce((sum, skill) => sum + skillValues[skill], 0) / skillLevels.length;
    
    let averageSkillLevel = 'beginner';
    if (avgSkillValue >= 3.5) averageSkillLevel = 'expert';
    else if (avgSkillValue >= 2.5) averageSkillLevel = 'advanced';
    else if (avgSkillValue >= 1.5) averageSkillLevel = 'intermediate';
    
    return {
      bestMatches: matches.slice(0, 5), // Top 5 matches
      totalApplicants: matches.length,
      averageSkillLevel
    };
  }
}