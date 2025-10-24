import { CostComparison, ROIEstimate, CostForecast, Concept } from '../types';

export class CostAnalysisService {
  private static mockProgressLogs = [
    { concept_id: '1', actual_cost: 12000, logged_at: '2024-01-15' },
    { concept_id: '2', actual_cost: 8500, logged_at: '2024-01-16' },
    { concept_id: '3', actual_cost: 15000, logged_at: '2024-01-17' }
  ];

  private static mockCostForecasts: CostForecast[] = [
    {
      id: '1',
      site_id: 'site1',
      concept_id: '1',
      forecast_total_cost: 10000,
      confidence_score: 0.85,
      risk_level: 'medium',
      budgeted_cost: 10000,
      variance_percentage: 20,
      created_at: '2024-01-10'
    },
    {
      id: '2',
      site_id: 'site1',
      concept_id: '2',
      forecast_total_cost: 9000,
      confidence_score: 0.90,
      risk_level: 'low',
      budgeted_cost: 9000,
      variance_percentage: -5.6,
      created_at: '2024-01-11'
    },
    {
      id: '3',
      site_id: 'site1',
      concept_id: '3',
      forecast_total_cost: 14000,
      confidence_score: 0.75,
      risk_level: 'high',
      budgeted_cost: 14000,
      variance_percentage: 7.1,
      created_at: '2024-01-12'
    }
  ];

  static async getCostComparisons(siteId: string): Promise<CostComparison[]> {
    const forecasts = this.mockCostForecasts.filter(f => f.site_id === siteId);
    const progressLogs = this.mockProgressLogs;

    return forecasts.map(forecast => {
      const actualLog = progressLogs.find(log => log.concept_id === forecast.concept_id);
      const actualCost = actualLog?.actual_cost || 0;
      const forecastedCost = forecast.forecast_total_cost;
      const variance = actualCost - forecastedCost;
      const variancePercent = forecastedCost > 0 ? (variance / forecastedCost) * 100 : 0;

      return {
        concept_id: forecast.concept_id,
        actual_cost: actualCost,
        forecasted_cost: forecastedCost,
        variance,
        variance_percent: variancePercent
      };
    });
  }

  static async calculateROI(siteId: string, expectedRevenue: number): Promise<ROIEstimate> {
    const comparisons = await this.getCostComparisons(siteId);
    const totalCost = comparisons.reduce((sum, comp) => sum + comp.actual_cost, 0);
    const roiPercent = totalCost > 0 ? ((expectedRevenue - totalCost) / totalCost) * 100 : 0;

    return {
      site_id: siteId,
      total_cost: totalCost,
      expected_return: expectedRevenue,
      roi_percent: roiPercent
    };
  }

  static async getSiteSummary(siteId: string) {
    const comparisons = await this.getCostComparisons(siteId);
    const totalActual = comparisons.reduce((sum, comp) => sum + comp.actual_cost, 0);
    const totalForecasted = comparisons.reduce((sum, comp) => sum + comp.forecasted_cost, 0);
    const overBudgetCount = comparisons.filter(comp => comp.variance > 0).length;
    const underBudgetCount = comparisons.filter(comp => comp.variance < 0).length;

    return {
      totalActual,
      totalForecasted,
      totalVariance: totalActual - totalForecasted,
      overBudgetCount,
      underBudgetCount,
      conceptCount: comparisons.length
    };
  }
}