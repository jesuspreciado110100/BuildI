import { supabase, TABLES, USER_ROLES, SITE_STATUS } from '../lib/supabase-config';

// User management service
export class UserService {
  static async createUser(userData: any) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([userData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }
}

// Site management service
export class SiteService {
  static async createSite(siteData: any) {
    const { data, error } = await supabase
      .from(TABLES.SITES)
      .insert([siteData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  static async getSitesByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from(TABLES.SITES)
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async updateSiteStatus(siteId: string, status: string) {
    const { data, error } = await supabase
      .from(TABLES.SITES)
      .update({ status })
      .eq('id', siteId)
      .select();
    
    if (error) throw error;
    return data[0];
  }
}

// Worker management service
export class WorkerService {
  static async getAllWorkers() {
    const { data, error } = await supabase
      .from(TABLES.WORKERS)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async getWorkersByTrade(trade: string) {
    const { data, error } = await supabase
      .from(TABLES.WORKERS)
      .select('*')
      .eq('trade', trade)
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async createWorker(workerData: any) {
    const { data, error } = await supabase
      .from(TABLES.WORKERS)
      .insert([workerData])
      .select();
    
    if (error) throw error;
    return data[0];
  }
}