import { CalendarSlot, LaborChiefProfile } from '../types';

export interface LaborMatchingCriteria {
  required_date: string;
  required_time_start: string;
  required_time_end: string;
  crew_size_needed: number;
  specialties_required: string[];
  location: string;
}

export interface LaborMatchResult {
  labor_chief_id: string;
  labor_chief_name: string;
  crew_size: number;
  hourly_rate: number;
  availability_score: number;
  distance_km: number;
  specialties_match: string[];
  is_available: boolean;
}

class LaborMatchingService {
  async findAvailableLaborChiefs(criteria: LaborMatchingCriteria): Promise<LaborMatchResult[]> {
    // Mock data - in real app, this would query the database
    const mockLaborChiefs: LaborChiefProfile[] = [
      {
        id: '1',
        user_id: 'user1',
        crew_size: 5,
        specialties: ['excavation', 'concrete'],
        hourly_rate: 45,
        location: 'Downtown',
        crew_availability: [
          {
            id: '1',
            day: criteria.required_date,
            time_start: '08:00',
            time_end: '17:00',
            status: 'available'
          }
        ],
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        user_id: 'user2',
        crew_size: 8,
        specialties: ['framing', 'roofing'],
        hourly_rate: 50,
        location: 'Midtown',
        crew_availability: [
          {
            id: '2',
            day: criteria.required_date,
            time_start: '08:00',
            time_end: '12:00',
            status: 'unavailable',
            notes: 'Booked at Site B'
          }
        ],
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    const results: LaborMatchResult[] = [];

    for (const chief of mockLaborChiefs) {
      const isAvailable = this.checkAvailability(chief.crew_availability, criteria);
      const availabilityScore = this.calculateAvailabilityScore(chief.crew_availability, criteria);
      const specialtiesMatch = chief.specialties.filter(s => criteria.specialties_required.includes(s));
      
      results.push({
        labor_chief_id: chief.id,
        labor_chief_name: `Chief ${chief.id}`,
        crew_size: chief.crew_size,
        hourly_rate: chief.hourly_rate,
        availability_score: availabilityScore,
        distance_km: Math.random() * 20, // Mock distance
        specialties_match: specialtiesMatch,
        is_available: isAvailable
      });
    }

    // Filter out unavailable crews and sort by availability score
    return results
      .filter(result => result.is_available)
      .sort((a, b) => b.availability_score - a.availability_score);
  }

  private checkAvailability(availability: CalendarSlot[], criteria: LaborMatchingCriteria): boolean {
    const requiredSlot = availability.find(slot => 
      slot.day === criteria.required_date &&
      slot.time_start <= criteria.required_time_start &&
      slot.time_end >= criteria.required_time_end
    );

    return requiredSlot ? requiredSlot.status === 'available' : true;
  }

  private calculateAvailabilityScore(availability: CalendarSlot[], criteria: LaborMatchingCriteria): number {
    // Calculate score based on how well the availability matches the request
    const matchingSlots = availability.filter(slot => 
      slot.day === criteria.required_date &&
      slot.status === 'available'
    );

    if (matchingSlots.length === 0) return 0;

    // Higher score for better time overlap
    const timeOverlap = this.calculateTimeOverlap(matchingSlots, criteria);
    return Math.min(100, timeOverlap * 100);
  }

  private calculateTimeOverlap(slots: CalendarSlot[], criteria: LaborMatchingCriteria): number {
    // Simplified overlap calculation
    const hasFullDaySlot = slots.some(slot => 
      slot.time_start <= criteria.required_time_start &&
      slot.time_end >= criteria.required_time_end
    );
    
    return hasFullDaySlot ? 1.0 : 0.5;
  }

  async getAvailabilityHeatmap(laborChiefIds: string[], startDate: string, endDate: string): Promise<Record<string, CalendarSlot[]>> {
    // Mock heatmap data
    const heatmap: Record<string, CalendarSlot[]> = {};
    
    laborChiefIds.forEach(id => {
      heatmap[id] = [
        {
          id: `${id}-1`,
          day: startDate,
          time_start: '08:00',
          time_end: '17:00',
          status: Math.random() > 0.5 ? 'available' : 'unavailable'
        }
      ];
    });

    return heatmap;
  }

  async prioritizeProposalsByAvailability(proposals: any[], requestDate: string): Promise<any[]> {
    // Sort proposals by availability score
    const scoredProposals = await Promise.all(
      proposals.map(async (proposal) => {
        const criteria: LaborMatchingCriteria = {
          required_date: requestDate,
          required_time_start: '08:00',
          required_time_end: '17:00',
          crew_size_needed: 5,
          specialties_required: [],
          location: 'Downtown'
        };
        
        const matches = await this.findAvailableLaborChiefs(criteria);
        const match = matches.find(m => m.labor_chief_id === proposal.labor_chief_id);
        
        return {
          ...proposal,
          availability_score: match?.availability_score || 0
        };
      })
    );

    return scoredProposals.sort((a, b) => b.availability_score - a.availability_score);
  }
}

export const laborMatchingService = new LaborMatchingService();