import { CostPrediction, DelaySimulation, ConstructionConcept, SiteBudget } from '../types';

class CostForecastService {
  private mockHistoricalData = {
    'foundation': { avgCostPerUnit: 150, variance: 0.15, delayMultiplier: 1.2 },
    'framing': { avgCostPerUnit: 80, variance: 0.12, delayMultiplier: 1.1 },
    'roofing': { avgCostPerUnit: 120, variance: 0.18, delayMultiplier: 1.15 },
    'electrical': { avgCostPerUnit: 200, variance: 0.20, delayMultiplier: 1.25 },
    'plumbing': { avgCostPerUnit: 180, variance: 0.16, delayMultiplier: 1.18 }
  };

  async getPredictedCost(site_id: string): Promise<CostPrediction[]> {
    // Mock data for demonstration
    const concepts = this.getMockConcepts(site_id);
    const predictions: CostPrediction[] = [];

    for (const concept of concepts) {
      const conceptType = this.getConceptType(concept.name);
      const historicalData = this.mockHistoricalData[conceptType] || { avgCostPerUnit: 100, variance: 0.15, delayMultiplier: 1.1 };
      
      // Calculate prediction factors
      const progressImpact = this.calculateProgressImpact(concept.progress_percentage);
      const laborCostTrend = Math.random() * 0.2 - 0.1; // -10% to +10%
      const materialPriceTrend = Math.random() * 0.3 - 0.15; // -15% to +15%
      const machineryCostTrend = Math.random() * 0.15 - 0.075; // -7.5% to +7.5%
      const delayImpact = Math.random() * 0.25; // 0% to +25%
      
      // Calculate predicted cost
      const baseCost = concept.total_cost;
      const totalImpact = progressImpact + laborCostTrend + materialPriceTrend + machineryCostTrend + delayImpact;
      const predictedCost = baseCost * (1 + totalImpact);
      
      // Calculate confidence and risk
      const confidence = Math.max(60, 100 - (historicalData.variance * 100));
      const overrunPercentage = ((predictedCost - baseCost) / baseCost) * 100;
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      let riskReason = 'Project tracking within expected parameters';
      
      if (overrunPercentage > 20) {
        riskLevel = 'high';
        riskReason = 'Significant cost overrun predicted due to delays and price increases';
      } else if (overrunPercentage > 10) {
        riskLevel = 'medium';
        riskReason = 'Moderate cost increase expected from market trends';
      }

      predictions.push({
        site_id,
        concept_id: concept.id,
        predicted_cost: Math.round(predictedCost),
        confidence_percentage: Math.round(confidence),
        risk_level: riskLevel,
        overrun_percentage: Math.round(overrunPercentage * 100) / 100,
        risk_reason: riskReason,
        factors: {
          progress_impact: Math.round(progressImpact * 100),
          labor_cost_trend: Math.round(laborCostTrend * 100),
          material_price_trend: Math.round(materialPriceTrend * 100),
          machinery_cost_trend: Math.round(machineryCostTrend * 100),
          delay_impact: Math.round(delayImpact * 100)
        }
      });
    }

    return predictions;
  }

  async simulateTradeDelay(concept_id: string, delay_days: number): Promise<DelaySimulation> {
    const concept = this.getMockConcept(concept_id);
    const conceptType = this.getConceptType(concept.name);
    const historicalData = this.mockHistoricalData[conceptType] || { avgCostPerUnit: 100, variance: 0.15, delayMultiplier: 1.1 };
    
    // Calculate cost delta from delay
    const baseCost = concept.total_cost;
    const delayMultiplier = Math.pow(historicalData.delayMultiplier, delay_days / 7); // Compound weekly
    const costDelta = baseCost * (delayMultiplier - 1);
    
    // Calculate timeline impact
    const timelineImpact = delay_days * 1.2; // Delays often cascade
    
    // Mock affected trades and cascade effects
    const affectedTrades = this.getAffectedTrades(conceptType);
    const cascadeEffects = affectedTrades.map(trade => ({
      trade,
      additional_delay: Math.round(delay_days * 0.3 * Math.random()),
      cost_impact: Math.round(costDelta * 0.2 * Math.random())
    }));

    return {
      concept_id,
      delay_days,
      cost_delta: Math.round(costDelta),
      timeline_impact: Math.round(timelineImpact),
      affected_trades: affectedTrades,
      cascade_effects: cascadeEffects
    };
  }

  private calculateProgressImpact(progressPercentage: number): number {
    // Early stages have higher uncertainty
    if (progressPercentage < 25) return 0.15;
    if (progressPercentage < 50) return 0.10;
    if (progressPercentage < 75) return 0.05;
    return 0.02;
  }

  private getConceptType(conceptName: string): string {
    const name = conceptName.toLowerCase();
    if (name.includes('foundation') || name.includes('concrete')) return 'foundation';
    if (name.includes('frame') || name.includes('wall')) return 'framing';
    if (name.includes('roof')) return 'roofing';
    if (name.includes('electric')) return 'electrical';
    if (name.includes('plumb')) return 'plumbing';
    return 'foundation';
  }

  private getAffectedTrades(conceptType: string): string[] {
    const tradeMap = {
      'foundation': ['Framing', 'Plumbing', 'Electrical'],
      'framing': ['Roofing', 'Electrical', 'Plumbing'],
      'roofing': ['HVAC', 'Insulation'],
      'electrical': ['Drywall', 'Flooring'],
      'plumbing': ['Drywall', 'Flooring']
    };
    return tradeMap[conceptType] || ['General'];
  }

  private getMockConcepts(site_id: string): ConstructionConcept[] {
    return [
      { id: '1', site_id, name: 'Foundation', description: 'Concrete foundation', planned_quantity: 100, unit_price: 150, total_cost: 15000, progress_percentage: 75, status: 'in_progress' },
      { id: '2', site_id, name: 'Framing', description: 'Wood framing', planned_quantity: 200, unit_price: 80, total_cost: 16000, progress_percentage: 45, status: 'in_progress' },
      { id: '3', site_id, name: 'Roofing', description: 'Asphalt shingles', planned_quantity: 150, unit_price: 120, total_cost: 18000, progress_percentage: 20, status: 'not_started' }
    ];
  }

  private getMockConcept(concept_id: string): ConstructionConcept {
    return { id: concept_id, site_id: 'site1', name: 'Foundation', description: 'Concrete foundation', planned_quantity: 100, unit_price: 150, total_cost: 15000, progress_percentage: 75, status: 'in_progress' };
  }
}

export default new CostForecastService();