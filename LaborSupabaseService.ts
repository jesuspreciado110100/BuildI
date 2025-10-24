import { supabase } from '@/app/lib/supabase';

export interface LaborRequest {
  id: string;
  title: string;
  description: string;
  trade: string;
  workers_needed: number;
  duration_days: number;
  location: string;
  budget: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  site_id: string | null;
  contractor_id: string;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: string;
  name: string;
  trade: string;
  skill_level: number;
  hourly_rate: number;
  location: string;
  availability_status: 'available' | 'busy' | 'offline';
  rating: number;
  image_url: string | null;
  created_at: string;
}

export class LaborSupabaseService {
  // Get all open labor requests
  static async getLaborRequests() {
    try {
      const { data, error } = await supabase
        .from('labor_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching labor requests:', error);
      return [];
    }
  }

  // Get available workers by trade
  static async getWorkersByTrade(trade: string) {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('trade', trade)
        .eq('availability_status', 'available')
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workers by trade:', error);
      return [];
    }
  }

  // Subscribe to real-time labor request updates
  static subscribeLaborRequests(callback: (data: LaborRequest[]) => void) {
    const subscription = supabase
      .channel('labor_requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'labor_requests' },
        async () => {
          const data = await this.getLaborRequests();
          callback(data);
        }
      )
      .subscribe();

    return subscription;
  }

  // Search labor requests
  static async searchLaborRequests(query: string) {
    try {
      const { data, error } = await supabase
        .from('labor_requests')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,trade.ilike.%${query}%`)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching labor requests:', error);
      return [];
    }
  }
}