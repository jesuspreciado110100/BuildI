import { LaborDemandForecast, Concept, Site } from '../types';

export class LaborForecastService {
  private static tradeRequirements: Record<string, string[]> = {
    'foundation': ['concrete_worker', 'rebar_worker', 'excavator_operator'],
    'framing': ['carpenter', 'framer', 'crane_operator'],
    'electrical': ['electrician', 'electrical_helper'],
    'plumbing': ['plumber', 'pipe_fitter'],
    'roofing': ['roofer', 'roofer_helper'],
    'drywall': ['drywall_installer', 'taper'],
    'flooring': ['flooring_installer', 'tile_setter'],
    'painting': ['painter', 'prep_worker']
  };

  private static laborMultipliers: Record<string, number> = {
    'planning': 0.8,
    'active': 1.2,
    'completed': 0.1
  };

  static async generateLaborForecasts(siteId: string, concepts: Concept[]): Promise<LaborDemandForecast[]> {
    const forecasts: LaborDemandForecast[] = [];
    
    for (const concept of concepts) {
      const conceptType = this.getConceptType(concept.name.toLowerCase());
      const requiredTrades = this.tradeRequirements[conceptType] || ['general_laborer'];
      
      for (const trade of requiredTrades) {
        const baseWorkers = this.calculateBaseWorkers(concept);
        const phaseMultiplier = this.laborMultipliers[concept.status] || 1;
        const predictedWorkers = Math.ceil(baseWorkers * phaseMultiplier);
        
        forecasts.push({
          id: `forecast_${concept.id}_${trade}`,
          site_id: siteId,
          concept_id: concept.id,
          trade_type: trade,
          predicted_workers: predictedWorkers,
          confidence_score: this.calculateConfidence(concept),
          forecast_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
    }
    
    return forecasts;
  }

  private static getConceptType(conceptName: string): string {
    if (conceptName.includes('foundation') || conceptName.includes('concrete')) return 'foundation';
    if (conceptName.includes('frame') || conceptName.includes('wall')) return 'framing';
    if (conceptName.includes('electric') || conceptName.includes('wire')) return 'electrical';
    if (conceptName.includes('plumb') || conceptName.includes('pipe')) return 'plumbing';
    if (conceptName.includes('roof')) return 'roofing';
    if (conceptName.includes('drywall') || conceptName.includes('sheetrock')) return 'drywall';
    if (conceptName.includes('floor') || conceptName.includes('tile')) return 'flooring';
    if (conceptName.includes('paint')) return 'painting';
    return 'foundation';
  }

  private static calculateBaseWorkers(concept: Concept): number {
    const quantity = concept.planned_quantity || 1;
    const complexity = concept.unit_price > 100 ? 1.5 : 1;
    return Math.max(1, Math.ceil(quantity / 100 * complexity));
  }

  private static calculateConfidence(concept: Concept): number {
    let confidence = 0.7;
    if (concept.start_date && concept.end_date) confidence += 0.2;
    if (concept.progress > 0) confidence += 0.1;
    return Math.min(0.95, confidence);
  }
}