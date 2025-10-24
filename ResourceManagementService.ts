import { supabase } from '@/app/lib/supabase';

export interface Site {
  id: string;
  name: string;
  contractor_id: string;
  location: string;
  status: string;
  created_at: string;
}

export interface Machinery {
  id: string;
  name: string;
  type: string;
  model?: string;
  provider_id: string;
  site_id?: string;
  status: string;
  hourly_rate?: number;
  daily_rate?: number;
  specifications?: any;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  supplier_id: string;
  site_id?: string;
  quantity_available: number;
  unit_price?: number;
  specifications?: any;
}

export interface Worker {
  id: string;
  user_id: string;
  provider_id: string;
  site_id?: string;
  trade: string;
  skill_level: string;
  hourly_rate?: number;
  status: string;
  certifications?: any;
}

export class ResourceManagementService {
  // Site Management
  static async getSites(contractorId: string): Promise<Site[]> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('contractor_id', contractorId);
    
    if (error) throw error;
    return data || [];
  }

  static async getSite(siteId: string): Promise<Site | null> {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Machinery Management
  static async getMachinery(siteId?: string): Promise<Machinery[]> {
    let query = supabase.from('machinery').select('*');
    
    if (siteId) {
      query = query.eq('site_id', siteId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async assignMachineryToSite(machineryId: string, siteId: string): Promise<void> {
    const { error } = await supabase
      .from('machinery')
      .update({ site_id: siteId, status: 'assigned' })
      .eq('id', machineryId);
    
    if (error) throw error;
  }

  // Material Management
  static async getMaterials(siteId?: string): Promise<Material[]> {
    let query = supabase.from('materials').select('*');
    
    if (siteId) {
      query = query.eq('site_id', siteId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async assignMaterialToSite(materialId: string, siteId: string): Promise<void> {
    const { error } = await supabase
      .from('materials')
      .update({ site_id: siteId })
      .eq('id', materialId);
    
    if (error) throw error;
  }

  // Worker Management
  static async getWorkers(siteId?: string): Promise<Worker[]> {
    let query = supabase.from('workers').select('*');
    
    if (siteId) {
      query = query.eq('site_id', siteId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async assignWorkerToSite(workerId: string, siteId: string): Promise<void> {
    const { error } = await supabase
      .from('workers')
      .update({ site_id: siteId, status: 'assigned' })
      .eq('id', workerId);
    
    if (error) throw error;
  }
}