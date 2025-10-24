import { MachineryRequest, UserProfile } from '../types';
import { ResponseTimeService } from './ResponseTimeService';

export class BookingMatchingService {
  private static instance: BookingMatchingService;
  private responseTimeService = ResponseTimeService.getInstance();

  static getInstance(): BookingMatchingService {
    if (!BookingMatchingService.instance) {
      BookingMatchingService.instance = new BookingMatchingService();
    }
    return BookingMatchingService.instance;
  }

  async findBestMatches(request: MachineryRequest, availableRenters: string[]): Promise<string[]> {
    const renterScores: { renterId: string; score: number }[] = [];

    for (const renterId of availableRenters) {
      const profile = await this.responseTimeService.getRenterProfile(renterId);
      const score = this.calculateMatchScore(request, profile);
      renterScores.push({ renterId, score });
    }

    // Sort by score (highest first) and return renter IDs
    return renterScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.renterId);
  }

  private calculateMatchScore(request: MachineryRequest, profile: UserProfile | null): number {
    let baseScore = 100; // Base matching score

    if (!profile) return baseScore;

    // Apply response time boost
    if (profile.response_score === 'excellent' || profile.response_score === 'good') {
      baseScore *= (profile.boost_multiplier || 1.0);
    }

    // Additional factors could include:
    // - Distance from request location
    // - Renter rating
    // - Equipment availability
    // - Historical performance

    return Math.round(baseScore);
  }

  async prioritizeRenters(renters: string[]): Promise<string[]> {
    const prioritized: { renterId: string; priority: number }[] = [];

    for (const renterId of renters) {
      const profile = await this.responseTimeService.getRenterProfile(renterId);
      let priority = 0;

      if (profile?.response_score === 'excellent') {
        priority = 3;
      } else if (profile?.response_score === 'good') {
        priority = 2;
      } else {
        priority = 1;
      }

      prioritized.push({ renterId, priority });
    }

    return prioritized
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.renterId);
  }
}