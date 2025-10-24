import { supabase } from '@/app/lib/supabase';

export interface MaterialUsageData {
  catalogItemId: string;
  itemName: string;
  section: string;
  plannedQuantity: number;
  actualQuantity: number;
  unitRate: number;
  plannedCost: number;
  actualCost: number;
  variance: number;
  variancePercent: number;
  usageDate: string;
}

export interface ConsumptionPattern {
  date: string;
  quantity: number;
  cost: number;
  itemName: string;
}

export interface VarianceAnalysis {
  totalPlannedCost: number;
  totalActualCost: number;
  totalVariance: number;
  overageItems: MaterialUsageData[];
  shortageItems: MaterialUsageData[];
}

export class MaterialUsageAnalyticsService {
  static async getProjectMaterialUsage(projectId: string): Promise<MaterialUsageData[]> {
    try {
      const { data, error } = await supabase
        .from('site_log_catalog_items')
        .select(`
          *,
          catalog_items (
            id, name, section, unit_rate, planned_quantity
          ),
          site_logs (
            id, date, project_id
          )
        `)
        .eq('site_logs.project_id', projectId);

      if (error) throw error;

      return data?.map(item => ({
        catalogItemId: item.catalog_item_id,
        itemName: item.catalog_items?.name || '',
        section: item.catalog_items?.section || '',
        plannedQuantity: item.catalog_items?.planned_quantity || 0,
        actualQuantity: item.quantity_used || 0,
        unitRate: item.catalog_items?.unit_rate || 0,
        plannedCost: (item.catalog_items?.planned_quantity || 0) * (item.catalog_items?.unit_rate || 0),
        actualCost: (item.quantity_used || 0) * (item.catalog_items?.unit_rate || 0),
        variance: ((item.quantity_used || 0) - (item.catalog_items?.planned_quantity || 0)) * (item.catalog_items?.unit_rate || 0),
        variancePercent: item.catalog_items?.planned_quantity ? 
          (((item.quantity_used || 0) - (item.catalog_items?.planned_quantity || 0)) / (item.catalog_items?.planned_quantity || 0)) * 100 : 0,
        usageDate: item.site_logs?.date || ''
      })) || [];
    } catch (error) {
      console.error('Error fetching material usage:', error);
      return [];
    }
  }

  static async getConsumptionPatterns(projectId: string, days: number = 30): Promise<ConsumptionPattern[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('site_log_catalog_items')
        .select(`
          quantity_used,
          catalog_items (name, unit_rate),
          site_logs (date, project_id)
        `)
        .eq('site_logs.project_id', projectId)
        .gte('site_logs.date', startDate.toISOString())
        .order('site_logs.date', { ascending: true });

      if (error) throw error;

      return data?.map(item => ({
        date: item.site_logs?.date || '',
        quantity: item.quantity_used || 0,
        cost: (item.quantity_used || 0) * (item.catalog_items?.unit_rate || 0),
        itemName: item.catalog_items?.name || ''
      })) || [];
    } catch (error) {
      console.error('Error fetching consumption patterns:', error);
      return [];
    }
  }
}