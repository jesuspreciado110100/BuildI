import { SkillMatch, LaborChiefProfile, Concept } from '../types';

class SkillMatrixService {
  // Mock data for demonstration
  private mockLaborChiefs: LaborChiefProfile[] = [
    {
      id: 'chief1',
      user_id: 'user1',
      crew_size: 5,
      specialties: ['Concrete', 'Formwork'],
      hourly_rate: 45,
      location: 'Downtown',
      crew_availability: [],
      skills: ['Formwork', 'Concrete Pouring', 'Rebar Installation'],
      skill_certifications: ['OSHA 30', 'Concrete Specialist'],
      preferred_unit_type: 'm³',
      created_at: '2024-01-01'
    },
    {
      id: 'chief2',
      user_id: 'user2',
      crew_size: 8,
      specialties: ['Welding', 'Steel'],
      hourly_rate: 55,
      location: 'Industrial Zone',
      crew_availability: [],
      skills: ['Welding', 'Steel Fabrication', 'Scaffolding'],
      skill_certifications: ['AWS Certified', 'Scaffolding License'],
      preferred_unit_type: 'hr',
      created_at: '2024-01-01'
    },
    {
      id: 'chief3',
      user_id: 'user3',
      crew_size: 6,
      specialties: ['Electrical', 'Plumbing'],
      hourly_rate: 50,
      location: 'Midtown',
      crew_availability: [],
      skills: ['Electrical Installation', 'Plumbing', 'HVAC'],
      skill_certifications: ['Licensed Electrician', 'Master Plumber'],
      preferred_unit_type: 'm²',
      created_at: '2024-01-01'
    }
  ];

  private mockRatings: Record<string, number> = {
    'chief1': 4.8,
    'chief2': 4.6,
    'chief3': 4.9
  };

  async getSkillMatches(concept: Concept, contractorLocation?: string): Promise<SkillMatch[]> {
    const matches: SkillMatch[] = [];

    for (const chief of this.mockLaborChiefs) {
      const skillScore = this.calculateSkillScore(concept, chief);
      const rating = this.mockRatings[chief.id] || 4.0;
      const availabilityScore = this.calculateAvailabilityScore(chief);
      const locationScore = this.calculateLocationScore(chief.location, contractorLocation);
      
      const totalScore = Math.round(
        (skillScore * 0.4) + 
        (rating * 20 * 0.3) + 
        (availabilityScore * 0.2) + 
        (locationScore * 0.1)
      );

      matches.push({
        labor_chief_id: chief.id,
        score: skillScore,
        matching_skills: this.getMatchingSkills(concept, chief),
        rating,
        availability_score: availabilityScore,
        location_score: locationScore,
        total_score: Math.min(100, totalScore)
      });
    }

    return matches.sort((a, b) => b.total_score - a.total_score);
  }

  private calculateSkillScore(concept: Concept, chief: LaborChiefProfile): number {
    const conceptKeywords = [...concept.tags, concept.trade, ...concept.description.toLowerCase().split(' ')];
    const chiefSkills = chief.skills.map(s => s.toLowerCase());
    
    let matches = 0;
    let totalKeywords = 0;

    for (const keyword of conceptKeywords) {
      if (keyword.length > 2) {
        totalKeywords++;
        if (chiefSkills.some(skill => skill.includes(keyword.toLowerCase()))) {
          matches++;
        }
      }
    }

    return totalKeywords > 0 ? Math.round((matches / totalKeywords) * 100) : 0;
  }

  private getMatchingSkills(concept: Concept, chief: LaborChiefProfile): string[] {
    const conceptKeywords = [...concept.tags, concept.trade];
    const matching: string[] = [];

    for (const skill of chief.skills) {
      if (conceptKeywords.some(keyword => 
        skill.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(skill.toLowerCase())
      )) {
        matching.push(skill);
      }
    }

    return matching;
  }

  private calculateAvailabilityScore(chief: LaborChiefProfile): number {
    // Mock availability calculation
    const availableSlots = chief.crew_availability.filter(slot => slot.status === 'available').length;
    const totalSlots = chief.crew_availability.length || 10;
    return Math.round((availableSlots / totalSlots) * 100);
  }

  private calculateLocationScore(chiefLocation: string, contractorLocation?: string): number {
    if (!contractorLocation) return 50;
    
    // Mock location scoring
    const locationScores: Record<string, Record<string, number>> = {
      'Downtown': { 'Downtown': 100, 'Midtown': 80, 'Industrial Zone': 60 },
      'Midtown': { 'Downtown': 80, 'Midtown': 100, 'Industrial Zone': 70 },
      'Industrial Zone': { 'Downtown': 60, 'Midtown': 70, 'Industrial Zone': 100 }
    };

    return locationScores[chiefLocation]?.[contractorLocation] || 50;
  }

  async getTopMatches(concept: Concept, limit: number = 3): Promise<SkillMatch[]> {
    const matches = await this.getSkillMatches(concept);
    return matches.slice(0, limit);
  }

  getLaborChiefById(id: string): LaborChiefProfile | null {
    return this.mockLaborChiefs.find(chief => chief.id === id) || null;
  }

  formatMatchBadge(match: SkillMatch): string {
    if (match.total_score >= 90) {
      return `🎯 ${match.total_score}% match`;
    } else if (match.total_score >= 80) {
      return `⭐ ${match.rating} rating`;
    } else {
      return `📍 ${match.total_score}% match`;
    }
  }
}

export default new SkillMatrixService();