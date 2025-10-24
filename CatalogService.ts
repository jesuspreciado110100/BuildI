import { supabase } from '@/app/lib/supabase';

export interface CatalogSection {
  section_id: string;
  project_id: string;
  section_code: string;
  name: string;
  description: string;
}

export interface CatalogItem {
  item_id: string;
  section_id: string;
  item_code: string;
  name: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  direct_costs: {
    machinery?: number;
    tools?: number;
    consumables?: number;
    materials?: number;
    labor?: number;
  };
  indirect_costs: {
    sureties?: number;
    office?: number;
    transportation?: number;
    consulting?: number;
    salaries?: number;
  };
}

export interface CatalogSectionWithItems extends CatalogSection {
  items: CatalogItem[];
}

export class CatalogService {
  static async getCatalogSections(projectId?: string): Promise<CatalogSection[]> {
    try {
      let query = supabase.from('catalog_sections').select('*');
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching catalog sections:', error);
      return [];
    }
  }

  static async getCatalogItems(sectionId: string): Promise<CatalogItem[]> {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('section_id', sectionId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching catalog items:', error);
      return [];
    }
  }

  static async getCatalogSectionsWithItems(projectId?: string): Promise<CatalogSectionWithItems[]> {
    try {
      const sections = await this.getCatalogSections(projectId);
      const sectionsWithItems: CatalogSectionWithItems[] = [];
      
      for (const section of sections) {
        const items = await this.getCatalogItems(section.section_id);
        sectionsWithItems.push({
          ...section,
          items
        });
      }
      
      return sectionsWithItems;
    } catch (error) {
      console.error('Error fetching catalog sections with items:', error);
      return [];
    }
  }
}