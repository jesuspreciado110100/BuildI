import { MaterialForecast, MaterialItem, MaterialOrder } from '../types';

class MaterialForecastService {
  private conceptMaterialMap: Record<string, Array<{materialType: string, baseQty: number}>> = {
    'foundation': [
      { materialType: 'concrete', baseQty: 50 },
      { materialType: 'rebar', baseQty: 20 },
      { materialType: 'gravel', baseQty: 30 }
    ],
    'framing': [
      { materialType: 'lumber', baseQty: 100 },
      { materialType: 'nails', baseQty: 5 },
      { materialType: 'brackets', baseQty: 25 }
    ],
    'roofing': [
      { materialType: 'shingles', baseQty: 40 },
      { materialType: 'underlayment', baseQty: 35 },
      { materialType: 'flashing', baseQty: 15 }
    ]
  };

  async analyzeUsage(siteId: string): Promise<MaterialForecast[]> {
    try {
      // Simulate fetching data
      const materials = await this.getMaterialsForSite(siteId);
      const deliveryLogs = await this.getDeliveryLogs(siteId);
      const concepts = await this.getActiveConcepts(siteId);
      
      const forecasts: MaterialForecast[] = [];
      
      materials.forEach(material => {
        const usageRate = this.calculateDailyUsageRate(material, deliveryLogs);
        const depletionDate = this.calculateDepletionDate(material.current_stock, usageRate);
        const daysUntilDepletion = this.getDaysUntilDepletion(depletionDate);
        const alertLevel = this.getAlertLevel(daysUntilDepletion);
        const relatedConcepts = this.getRelatedConcepts(material, concepts);
        
        forecasts.push({
          material_id: material.id,
          material_name: material.name,
          current_stock: material.current_stock,
          daily_usage_rate: usageRate,
          predicted_depletion_date: depletionDate,
          days_until_depletion: daysUntilDepletion,
          reorder_suggestion: daysUntilDepletion <= 3,
          forecast_confidence: this.calculateConfidence(material, deliveryLogs),
          alert_level: alertLevel,
          suggested_reorder_quantity: this.calculateReorderQuantity(material, usageRate),
          related_concepts: relatedConcepts
        });
      });
      
      return forecasts.sort((a, b) => a.days_until_depletion - b.days_until_depletion);
    } catch (error) {
      console.error('Error analyzing material usage:', error);
      return [];
    }
  }

  private async getMaterialsForSite(siteId: string): Promise<MaterialItem[]> {
    // Simulate API call
    return [
      {
        id: '1',
        name: 'Concrete Mix',
        category: 'Building Materials',
        unit: 'tons',
        current_stock: 25,
        min_threshold: 10,
        supplier_id: 'sup1',
        price_per_unit: 150
      },
      {
        id: '2',
        name: 'Gravel',
        category: 'Aggregates',
        unit: 'tons',
        current_stock: 8,
        min_threshold: 5,
        supplier_id: 'sup2',
        price_per_unit: 45
      }
    ];
  }

  private async getDeliveryLogs(siteId: string): Promise<any[]> {
    // Simulate delivery history
    return [
      { material_id: '1', quantity: 10, date: '2024-01-15' },
      { material_id: '2', quantity: 15, date: '2024-01-10' }
    ];
  }

  private async getActiveConcepts(siteId: string): Promise<string[]> {
    return ['Foundation Work', 'Site Preparation'];
  }

  private calculateDailyUsageRate(material: MaterialItem, logs: any[]): number {
    // Simple calculation based on recent usage
    const baseRate = material.current_stock * 0.05; // 5% per day baseline
    return Math.max(1, baseRate + Math.random() * 2);
  }

  private calculateDepletionDate(currentStock: number, dailyRate: number): string {
    const daysRemaining = Math.floor(currentStock / dailyRate);
    const depletionDate = new Date();
    depletionDate.setDate(depletionDate.getDate() + daysRemaining);
    return depletionDate.toISOString().split('T')[0];
  }

  private getDaysUntilDepletion(depletionDate: string): number {
    const today = new Date();
    const depletion = new Date(depletionDate);
    return Math.ceil((depletion.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  private getAlertLevel(daysUntilDepletion: number): 'low' | 'medium' | 'high' | 'critical' {
    if (daysUntilDepletion <= 1) return 'critical';
    if (daysUntilDepletion <= 3) return 'high';
    if (daysUntilDepletion <= 7) return 'medium';
    return 'low';
  }

  private getRelatedConcepts(material: MaterialItem, concepts: string[]): string[] {
    const materialName = material.name.toLowerCase();
    return concepts.filter(concept => {
      const conceptName = concept.toLowerCase();
      if (materialName.includes('concrete') || materialName.includes('gravel')) {
        return conceptName.includes('foundation') || conceptName.includes('site');
      }
      return false;
    });
  }

  private calculateConfidence(material: MaterialItem, logs: any[]): number {
    const hasRecentData = logs.some(log => log.material_id === material.id);
    return hasRecentData ? 0.85 + Math.random() * 0.1 : 0.65 + Math.random() * 0.1;
  }

  private calculateReorderQuantity(material: MaterialItem, dailyRate: number): number {
    // Suggest 2 weeks worth of material
    return Math.ceil(dailyRate * 14);
  }
}

export default new MaterialForecastService();