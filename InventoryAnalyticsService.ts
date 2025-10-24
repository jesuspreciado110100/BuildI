import { MaterialItem, MaterialQuoteRequest } from '../types';

export interface InventoryAnalysis {
  material_id: string;
  current_stock: number;
  reorder_status: 'safe' | 'low' | 'urgent';
  predicted_days_left: number;
  avg_weekly_demand: number;
  reorder_prediction: string;
}

export class InventoryAnalyticsService {
  // Mock data for demonstration
  private static mockQuoteHistory: MaterialQuoteRequest[] = [
    {
      id: '1',
      contractor_id: 'c1',
      material_id: 'm1',
      supplier_id: 's1',
      site_id: 'site1',
      quantity: 100,
      status: 'accepted',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      material_name: 'Concrete',
      requested_by_contractor_id: 'c1'
    },
    {
      id: '2',
      contractor_id: 'c2',
      material_id: 'm1',
      supplier_id: 's1',
      site_id: 'site2',
      quantity: 150,
      status: 'accepted',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      material_name: 'Concrete',
      requested_by_contractor_id: 'c2'
    }
  ];

  static async analyzeInventory(supplierId: string): Promise<InventoryAnalysis[]> {
    // Mock analysis - in real app would query database
    const materials = await this.getMaterialsBySupplier(supplierId);
    const analyses: InventoryAnalysis[] = [];

    for (const material of materials) {
      const analysis = await this.analyzeMaterial(material);
      analyses.push(analysis);
    }

    return analyses;
  }

  private static async analyzeMaterial(material: MaterialItem): Promise<InventoryAnalysis> {
    // Calculate demand over past 30/60/90 days
    const demand30 = this.calculateDemand(material.id, 30);
    const demand60 = this.calculateDemand(material.id, 60);
    const demand90 = this.calculateDemand(material.id, 90);

    // Calculate average weekly demand
    const avgWeeklyDemand = (demand30 + demand60 + demand90) / 3 / 7;
    
    // Calculate days left of stock
    const avgDailyDemand = avgWeeklyDemand / 7;
    const predictedDaysLeft = avgDailyDemand > 0 ? material.stock_quantity / avgDailyDemand : 999;

    // Determine reorder status
    let reorderStatus: 'safe' | 'low' | 'urgent';
    if (material.stock_quantity <= material.reorder_threshold) {
      reorderStatus = 'urgent';
    } else if (predictedDaysLeft <= material.lead_time_days + 7) {
      reorderStatus = 'low';
    } else {
      reorderStatus = 'safe';
    }

    // Generate prediction text
    const prediction = this.generatePrediction(material, avgWeeklyDemand, predictedDaysLeft, reorderStatus);

    return {
      material_id: material.id,
      current_stock: material.stock_quantity,
      reorder_status: reorderStatus,
      predicted_days_left: Math.round(predictedDaysLeft),
      avg_weekly_demand: Math.round(avgWeeklyDemand * 10) / 10,
      reorder_prediction: prediction
    };
  }

  private static calculateDemand(materialId: string, days: number): number {
    // Mock calculation - in real app would query actual orders
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.mockQuoteHistory
      .filter(q => q.material_id === materialId && 
                  new Date(q.created_at) >= cutoffDate &&
                  q.status === 'accepted')
      .reduce((sum, q) => sum + q.quantity, 0);
  }

  private static generatePrediction(material: MaterialItem, weeklyDemand: number, daysLeft: number, status: 'safe' | 'low' | 'urgent'): string {
    if (status === 'urgent') {
      return `Critical: Stock below threshold (${material.reorder_threshold}). Immediate reorder needed.`;
    } else if (status === 'low') {
      return `Warning: With ${weeklyDemand.toFixed(1)} weekly demand, you'll run out in ${daysLeft} days. Consider reordering soon.`;
    } else {
      return `Safe: Current stock sufficient for ${daysLeft} days at current demand rate.`;
    }
  }

  private static async getMaterialsBySupplier(supplierId: string): Promise<MaterialItem[]> {
    // Mock data - in real app would query database
    return [
      {
        id: 'm1',
        supplier_id: supplierId,
        name: 'Concrete Mix',
        category: 'Building Materials',
        unit_price: 50,
        unit_type: 'cubic_yard',
        stock_quantity: 500,
        perishable: false,
        lead_time_days: 7,
        rating: 4.5,
        created_at: '2024-01-01T00:00:00Z',
        reorder_threshold: 100,
        auto_reorder_enabled: true,
        reorder_prediction: '',
        reorder_status: 'safe'
      },
      {
        id: 'm2',
        supplier_id: supplierId,
        name: 'Steel Rebar',
        category: 'Structural',
        unit_price: 2.5,
        unit_type: 'pound',
        stock_quantity: 50,
        perishable: false,
        lead_time_days: 14,
        rating: 4.8,
        created_at: '2024-01-01T00:00:00Z',
        reorder_threshold: 200,
        auto_reorder_enabled: false,
        reorder_prediction: '',
        reorder_status: 'urgent'
      }
    ];
  }

  static async updateReorderStatus(materialId: string, analysis: InventoryAnalysis): Promise<void> {
    // Mock update - in real app would update database
    console.log(`Updated reorder status for ${materialId}:`, analysis);
  }
}