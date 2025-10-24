import { supabase } from '@/app/lib/supabase';

// Use proper UUID instead of string
const DEMO_PROJECT_ID = '550e8400-e29b-41d4-a716-446655440000';
export interface BoQSection {
  name: string;
}


export interface BoQLabor {
  role: string;
  count: number;
  days: number;
  base_salary_per_day: number;
}

export interface BoQMaterial {
  name: string;
  quantity: number;
  unit: string;
  rate: number;
}

export interface BoQMachinery {
  name: string;
  duration_days: number;
  rate_per_day: number;
}

export interface BoQItem {
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  labor: BoQLabor[];
  materials: BoQMaterial[];
  machinery: BoQMachinery[];
}

export interface ParsedBoQ {
  section: BoQSection;
  items: BoQItem[];
}

export class BoQParsingService {
  private static readonly MEXICO_LABOR_FACTORS = {
    FSBC: 1.04986,
    TOTAL_FEES: 0.44604275,
    REAL_SALARY_FACTOR: 1.5186
  };

  static async parseAndStoreBoQ(
    fileData: string,
    fileName: string,
    projectId: string
  ): Promise<string> {
    try {
      // Call Supabase Edge Function for parsing
      const { data, error } = await supabase.functions.invoke('parse-boq-file', {
        body: {
          fileData,
          fileName,
          projectId
        }
      });

      if (error) {
        throw new Error(`Parsing failed: ${error.message}`);
      }

      return data.sectionId;
    } catch (error) {
      console.error('BoQ parsing error:', error);
      throw error;
    }
  }

  static async getBoQItems(projectId: string, userRole?: string, userId?: string) {
    try {
      let query = supabase
        .from('catalog_cost_comparison')
        .select('*')
        .eq('project_id', projectId);

      // Filter for workers to only see assigned items
      if (userRole === 'worker' && userId) {
        const { data: assignments } = await supabase
          .from('assignments')
          .select('item_id')
          .eq('assignee_id', userId)
          .eq('assignee_type', 'worker');
        
        const itemIds = assignments?.map(a => a.item_id) || [];
        if (itemIds.length > 0) {
          query = query.in('item_id', itemIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching BoQ items:', error);
      throw error;
    }
  }

  static async updateItemStatus(itemId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('catalog_items')
        .update({
          status,
          is_checked: status === 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('item_id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating item status:', error);
      throw error;
    }
  }

  static calculateLaborCost(
    count: number,
    days: number,
    baseSalaryPerDay: number
  ): number {
    return count * days * baseSalaryPerDay * this.MEXICO_LABOR_FACTORS.REAL_SALARY_FACTOR;
  }

  static calculateMaterialCost(quantity: number, rate: number): number {
    return quantity * rate;
  }

  static calculateMachineryCost(durationDays: number, ratePerDay: number): number {
    return durationDays * ratePerDay;
  }
}

export default BoQParsingService;