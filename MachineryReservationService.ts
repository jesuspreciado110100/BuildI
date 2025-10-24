import { supabase } from '@/app/lib/supabase';

export interface MachineryReservation {
  reservation_id: string;
  machinery_id: string;
  project_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export class MachineryReservationService {
  // Create a new reservation
  static async createReservation(data: {
    machinery_id: string;
    project_id: string;
    start_date: string;
    end_date: string;
    total_cost: number;
  }) {
    try {
      const { data: reservation, error } = await supabase
        .from('machinery_reservations')
        .insert({
          machinery_id: data.machinery_id,
          project_id: data.project_id,
          start_date: data.start_date,
          end_date: data.end_date,
          total_cost: data.total_cost,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data: reservation };
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      return { success: false, error: error.message };
    }
  }

  // Get reservations by project ID
  static async getReservationsByProject(projectId: string) {
    try {
      const { data, error } = await supabase
        .from('machinery_reservations')
        .select(`
          *,
          machinery:machinery_id (
            machinery_id,
            name,
            model,
            rate,
            daily_rate,
            hourly_rate,
            specifications
          )
        `)
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project reservations:', error);
      return [];
    }
  }

  // Get reservations by machinery ID
  static async getReservationsByMachinery(machineryId: string) {
    try {
      const { data, error } = await supabase
        .from('machinery_reservations')
        .select(`
          *,
          projects:project_id (
            project_id,
            name,
            location,
            status
          )
        `)
        .eq('machinery_id', machineryId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching machinery reservations:', error);
      return [];
    }
  }

  // Update reservation status
  static async updateReservationStatus(
    reservationId: string,
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  ) {
    try {
      const { data, error } = await supabase
        .from('machinery_reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('reservation_id', reservationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel reservation
  static async cancelReservation(reservationId: string) {
    return this.updateReservationStatus(reservationId, 'cancelled');
  }

  // Check machinery availability for date range
  static async checkAvailability(
    machineryId: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('machinery_reservations')
        .select('reservation_id')
        .eq('machinery_id', machineryId)
        .in('status', ['confirmed', 'active'])
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

      if (error) throw error;
      return (data || []).length === 0;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }
}
