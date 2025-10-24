import { supabase } from '@/app/lib/supabase';

export interface MachineryBooking {
  id: string;
  machinery_id: string;
  renter_id: string;
  contractor_id: string;
  contractor_name: string;
  contractor_company: string;
  contractor_phone: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  payment_date?: string;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  machinery?: any;
}

export class BookingService {
  static async getBookingsByRenter(renterId: string) {
    try {
      const { data, error } = await supabase
        .from('machinery_bookings')
        .select(`
          *,
          machinery:machinery_types(*)
        `)
        .eq('renter_id', renterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return { data: null, error };
    }
  }

  static async getBookingById(bookingId: string) {
    try {
      const { data, error } = await supabase
        .from('machinery_bookings')
        .select(`
          *,
          machinery:machinery_types(*)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching booking:', error);
      return { data: null, error };
    }
  }

  static async updateBookingStatus(
    bookingId: string,
    status: string,
    rejectionReason?: string
  ) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('machinery_bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating booking status:', error);
      return { data: null, error };
    }
  }

  static async createBooking(bookingData: Partial<MachineryBooking>) {
    try {
      const { data, error } = await supabase
        .from('machinery_bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { data: null, error };
    }
  }

  static async getBookingAnalytics(renterId: string) {
    try {
      const { data: bookings, error } = await supabase
        .from('machinery_bookings')
        .select('*')
        .eq('renter_id', renterId);

      if (error) throw error;

      const analytics = {
        totalBookings: bookings?.length || 0,
        pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
        activeBookings: bookings?.filter(b => b.status === 'active').length || 0,
        completedBookings: bookings?.filter(b => b.status === 'completed').length || 0,
        totalRevenue: bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
        averageBookingDuration: bookings?.reduce((sum, b) => sum + (b.total_days || 0), 0) / (bookings?.length || 1) || 0,
        utilizationRate: 0 // Will be calculated based on machinery availability
      };

      return { data: analytics, error: null };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { data: null, error };
    }
  }

  static async getRevenueByPeriod(renterId: string, period: 'daily' | 'weekly' | 'monthly') {
    try {
      const { data: bookings, error } = await supabase
        .from('machinery_bookings')
        .select('*')
        .eq('renter_id', renterId)
        .in('status', ['active', 'completed']);

      if (error) throw error;

      // Group bookings by period
      const revenueData = this.groupRevenueByPeriod(bookings || [], period);
      return { data: revenueData, error: null };
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return { data: null, error };
    }
  }

  private static groupRevenueByPeriod(bookings: any[], period: string) {
    const grouped: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.created_at);
      let key = '';
      
      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekNum = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        key = `${date.getFullYear()}-W${weekNum}`;
      } else if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      grouped[key] = (grouped[key] || 0) + (booking.total_amount || 0);
    });

    return Object.entries(grouped).map(([period, revenue]) => ({
      period,
      revenue
    }));
  }
}

export default BookingService;