import { CrewRecommendation } from '../types';

export class CrewOptimizerService {
  static async getRecommendedCrews(conceptId: string): Promise<CrewRecommendation[]> {
    // Mock data - in real app would call AI service
    const mockCrews: CrewRecommendation[] = [
      {
        labor_chief_id: '1',
        labor_chief_name: 'Luis Rodriguez',
        match_score: 95,
        expected_completion_time: 7,
        ai_rationale: 'High rating on similar foundation tasks, excellent concrete experience',
        crew_size: 8,
        rating: 4.8,
        availability: true,
        distance_km: 12
      },
      {
        labor_chief_id: '2',
        labor_chief_name: 'Maria Santos',
        match_score: 88,
        expected_completion_time: 8,
        ai_rationale: 'Strong track record with residential foundations, reliable team',
        crew_size: 6,
        rating: 4.6,
        availability: true,
        distance_km: 18
      },
      {
        labor_chief_id: '3',
        labor_chief_name: 'David Kim',
        match_score: 82,
        expected_completion_time: 9,
        ai_rationale: 'Good experience with similar volume projects, competitive pricing',
        crew_size: 7,
        rating: 4.4,
        availability: false,
        distance_km: 25
      },
      {
        labor_chief_id: '4',
        labor_chief_name: 'Carlos Mendez',
        match_score: 78,
        expected_completion_time: 10,
        ai_rationale: 'Specialized in commercial foundations, larger crew capacity',
        crew_size: 12,
        rating: 4.3,
        availability: true,
        distance_km: 35
      },
      {
        labor_chief_id: '5',
        labor_chief_name: 'Jennifer Wu',
        match_score: 75,
        expected_completion_time: 11,
        ai_rationale: 'Consistent performance, good safety record',
        crew_size: 5,
        rating: 4.2,
        availability: true,
        distance_km: 28
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCrews.sort((a, b) => b.match_score - a.match_score);
  }

  static calculateMatchScore(
    conceptType: string,
    requiredVolume: number,
    plannedDates: { start: string; end: string },
    crewRating: number,
    crewAvailability: boolean
  ): number {
    let score = 0;
    
    // Base score from rating (0-40 points)
    score += crewRating * 8;
    
    // Availability bonus (0-20 points)
    score += crewAvailability ? 20 : 0;
    
    // Experience with concept type (0-25 points)
    const experienceBonus = Math.random() * 25;
    score += experienceBonus;
    
    // Volume capacity match (0-15 points)
    const volumeMatch = Math.min(15, requiredVolume / 100 * 15);
    score += volumeMatch;
    
    return Math.min(100, Math.round(score));
  }

  static getAIRationale(score: number, conceptType: string): string {
    if (score >= 90) {
      return `Excellent match for ${conceptType} - top performer with proven track record`;
    } else if (score >= 80) {
      return `Strong candidate for ${conceptType} - reliable with good experience`;
    } else if (score >= 70) {
      return `Good option for ${conceptType} - meets requirements with solid performance`;
    } else {
      return `Potential match for ${conceptType} - consider for backup or less critical tasks`;
    }
  }
}