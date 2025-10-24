import { supabase } from '@/app/lib/supabase';

export class DatabaseService {
  static async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  }

  static async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    return { data, error };
  }

  static async getSites(contractorId: string) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('contractor_id', contractorId);
    return { data, error };
  }

  static async createSite(siteData: any) {
    const { data, error } = await supabase
      .from('sites')
      .insert(siteData)
      .select()
      .single();
    return { data, error };
  }

  static async getLaborRequests(siteId: string) {
    const { data, error } = await supabase
      .from('labor_requests')
      .select('*')
      .eq('site_id', siteId);
    return { data, error };
  }

  static async createLaborRequest(requestData: any) {
    const { data, error } = await supabase
      .from('labor_requests')
      .insert(requestData)
      .select()
      .single();
    return { data, error };
  }

  static async getMaterialOrders(siteId: string) {
    const { data, error } = await supabase
      .from('material_orders')
      .select('*')
      .eq('site_id', siteId);
    return { data, error };
  }

  static async createMaterialOrder(orderData: any) {
    const { data, error } = await supabase
      .from('material_orders')
      .insert(orderData)
      .select()
      .single();
    return { data, error };
  }
}