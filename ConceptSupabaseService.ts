import { supabase } from '@/app/lib/supabase';

export interface Concept {
  id: string;
  site_id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  group?: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export class ConceptSupabaseService {
  static async getConceptsBySite(siteId: string): Promise<Concept[]> {
    try {
      const { data, error } = await supabase
        .from('concepts')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching concepts:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        site_id: item.site_id,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        group: item.group,
        progress: item.progress || 0,
        status: item.status || 'not_started',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error('Error in getConceptsBySite:', error);
      return [];
    }
  }

  static async updateConceptProgress(conceptId: string, progress: number): Promise<Concept | null> {
    try {
      const status = progress === 0 ? 'not_started' : 
                    progress === 100 ? 'completed' : 'in_progress';

      const { data, error } = await supabase
        .from('concepts')
        .update({ 
          progress, 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', conceptId)
        .select()
        .single();

      if (error) {
        console.error('Error updating concept:', error);
        return null;
      }

      return {
        id: data.id,
        site_id: data.site_id,
        description: data.description,
        unit: data.unit,
        quantity: data.quantity,
        unitPrice: data.unit_price,
        group: data.group,
        progress: data.progress,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error in updateConceptProgress:', error);
      return null;
    }
  }

  static async createConcept(concept: Omit<Concept, 'id' | 'createdAt' | 'updatedAt'>): Promise<Concept | null> {
    try {
      const { data, error } = await supabase
        .from('concepts')
        .insert({
          site_id: concept.site_id,
          description: concept.description,
          unit: concept.unit,
          quantity: concept.quantity,
          unit_price: concept.unitPrice,
          group: concept.group,
          progress: concept.progress,
          status: concept.status
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating concept:', error);
        return null;
      }

      return {
        id: data.id,
        site_id: data.site_id,
        description: data.description,
        unit: data.unit,
        quantity: data.quantity,
        unitPrice: data.unit_price,
        group: data.group,
        progress: data.progress,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error in createConcept:', error);
      return null;
    }
  }
}