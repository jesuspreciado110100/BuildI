import { SafetyChecklistItem } from '../types';

export class SafetyService {
  // Predefined safety checklist items by trade type
  private static readonly PREDEFINED_ITEMS: Record<string, Omit<SafetyChecklistItem, 'id' | 'phase_id' | 'is_completed' | 'completed_by' | 'timestamp' | 'photo_url'>[]> = {
    'concrete': [
      { trade_type: 'concrete', item: 'PPE: Hard hat, safety glasses, steel-toed boots', is_required: true },
      { trade_type: 'concrete', item: 'Formwork inspection completed', is_required: true },
      { trade_type: 'concrete', item: 'Rebar placement verified', is_required: true },
      { trade_type: 'concrete', item: 'Concrete pump safety check', is_required: false },
      { trade_type: 'concrete', item: 'Weather conditions assessed', is_required: true },
    ],
    'electrical': [
      { trade_type: 'electrical', item: 'PPE: Hard hat, safety glasses, insulated gloves', is_required: true },
      { trade_type: 'electrical', item: 'Electrical lockout/tagout (LOTO) completed', is_required: true },
      { trade_type: 'electrical', item: 'Circuit testing completed', is_required: true },
      { trade_type: 'electrical', item: 'Ground fault protection verified', is_required: true },
      { trade_type: 'electrical', item: 'Fire extinguisher accessible', is_required: true },
    ],
    'scaffolding': [
      { trade_type: 'scaffolding', item: 'PPE: Hard hat, safety harness, non-slip boots', is_required: true },
      { trade_type: 'scaffolding', item: 'Scaffolding inspection completed', is_required: true },
      { trade_type: 'scaffolding', item: 'Fall protection systems in place', is_required: true },
      { trade_type: 'scaffolding', item: 'Load capacity verified', is_required: true },
      { trade_type: 'scaffolding', item: 'Weather conditions assessed', is_required: true },
    ],
    'welding': [
      { trade_type: 'welding', item: 'PPE: Welding helmet, leather gloves, fire-resistant clothing', is_required: true },
      { trade_type: 'welding', item: 'Fire watch assigned', is_required: true },
      { trade_type: 'welding', item: 'Ventilation system operational', is_required: true },
      { trade_type: 'welding', item: 'Hot work permit obtained', is_required: true },
      { trade_type: 'welding', item: 'Fire extinguisher within 35 feet', is_required: true },
    ],
    'excavation': [
      { trade_type: 'excavation', item: 'PPE: Hard hat, high-visibility vest, steel-toed boots', is_required: true },
      { trade_type: 'excavation', item: 'Utility locating completed (811 call)', is_required: true },
      { trade_type: 'excavation', item: 'Soil conditions assessed', is_required: true },
      { trade_type: 'excavation', item: 'Shoring/sloping plan implemented', is_required: true },
      { trade_type: 'excavation', item: 'Emergency evacuation plan reviewed', is_required: true },
    ],
  };

  static async getChecklistItems(phaseId: string, tradeType: string): Promise<SafetyChecklistItem[]> {
    // In a real app, this would fetch from database
    // For now, return predefined items with generated IDs
    const predefinedItems = this.PREDEFINED_ITEMS[tradeType.toLowerCase()] || [];
    
    return predefinedItems.map((item, index) => ({
      id: `${phaseId}-${tradeType}-${index}`,
      phase_id: phaseId,
      ...item,
      is_completed: false,
    }));
  }

  static async completeChecklistItem(itemId: string, completedBy: string): Promise<void> {
    // In a real app, this would update the database
    console.log(`Completing checklist item ${itemId} by ${completedBy}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  static async addPhotoToChecklistItem(itemId: string, photoUrl: string): Promise<void> {
    // In a real app, this would update the database
    console.log(`Adding photo ${photoUrl} to checklist item ${itemId}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  static async getPhaseChecklistProgress(phaseId: string): Promise<{ completed: number; total: number; overdue: number }> {
    // In a real app, this would query the database
    // For now, return mock data
    return {
      completed: 3,
      total: 5,
      overdue: 1,
    };
  }

  static async getConceptSafetyStatus(conceptId: string): Promise<{
    phases: Array<{
      phase_id: string;
      phase_name: string;
      status: 'incomplete' | 'flagged' | 'photo_verified' | 'completed';
      completed_items: number;
      total_items: number;
      overdue_items: number;
    }>;
  }> {
    // In a real app, this would query the database
    // For now, return mock data
    return {
      phases: [
        {
          phase_id: '1',
          phase_name: 'Foundation',
          status: 'completed',
          completed_items: 5,
          total_items: 5,
          overdue_items: 0,
        },
        {
          phase_id: '2',
          phase_name: 'Framing',
          status: 'flagged',
          completed_items: 3,
          total_items: 5,
          overdue_items: 1,
        },
      ],
    };
  }

  static async getFlaggedJobs(): Promise<Array<{
    job_id: string;
    site_name: string;
    concept_name: string;
    crew_name: string;
    flagged_items: number;
    last_updated: string;
  }>> {
    // In a real app, this would query the database
    // For now, return mock data
    return [
      {
        job_id: '1',
        site_name: 'Downtown Office Complex',
        concept_name: 'Electrical Installation',
        crew_name: 'Elite Electric Crew',
        flagged_items: 2,
        last_updated: new Date().toISOString(),
      },
    ];
  }

  static async checkForOverdueItems(phaseId: string): Promise<boolean> {
    // In a real app, this would check database for overdue items
    // For now, return mock data
    return Math.random() > 0.7; // 30% chance of overdue items
  }

  static async logSafetyIncident(phaseId: string, description: string): Promise<void> {
    // In a real app, this would log to database
    console.log(`Safety incident logged for phase ${phaseId}: ${description}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}