import { AdminUser, AdminOrder, AdminPayment, AdminDispute, AdminKPI, AdminActivityLog } from '../types';

export class AdminService {
  // Mock data for development
  private static mockUsers: AdminUser[] = [
    {
      id: '1',
      email: 'john@contractor.com',
      name: 'John Smith',
      role: 'contractor',
      company: 'Smith Construction',
      phone: '+1-555-0101',
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      last_login: '2024-01-20T14:30:00Z',
      activity_summary: {
        total_orders: 25,
        total_spent: 125000,
        last_activity: '2024-01-20T14:30:00Z'
      }
    },
    {
      id: '2',
      email: 'mike@labor.com',
      name: 'Mike Johnson',
      role: 'labor_chief',
      company: 'Johnson Crew',
      phone: '+1-555-0102',
      is_active: true,
      created_at: '2024-01-10T09:00:00Z',
      last_login: '2024-01-19T16:45:00Z',
      activity_summary: {
        total_orders: 18,
        total_spent: 0,
        last_activity: '2024-01-19T16:45:00Z'
      }
    }
  ];

  private static mockOrders: AdminOrder[] = [
    {
      id: 'ord_001',
      type: 'material',
      contractor_id: '1',
      contractor_name: 'John Smith',
      provider_id: '3',
      provider_name: 'ABC Materials',
      amount: 15000,
      status: 'completed',
      created_at: '2024-01-18T10:00:00Z',
      updated_at: '2024-01-20T15:00:00Z'
    },
    {
      id: 'ord_002',
      type: 'labor',
      contractor_id: '1',
      contractor_name: 'John Smith',
      provider_id: '2',
      provider_name: 'Mike Johnson',
      amount: 8500,
      status: 'pending',
      created_at: '2024-01-19T14:00:00Z',
      updated_at: '2024-01-19T14:00:00Z'
    }
  ];

  private static mockPayments: AdminPayment[] = [
    {
      id: 'pay_001',
      order_id: 'ord_001',
      contractor_id: '1',
      provider_id: '3',
      amount: 15000,
      escrow_status: 'released',
      payment_date: '2024-01-18T12:00:00Z',
      release_date: '2024-01-20T15:00:00Z',
      region: 'Northeast'
    }
  ];

  private static mockDisputes: AdminDispute[] = [
    {
      id: 'disp_001',
      order_id: 'ord_002',
      type: 'labor',
      contractor_id: '1',
      provider_id: '2',
      description: 'Work quality did not meet specifications',
      status: 'open',
      created_at: '2024-01-19T16:00:00Z',
      resolution_notes: '',
      admin_comments: ''
    }
  ];

  private static mockKPIs: AdminKPI = {
    daily_active_users: 1247,
    total_bookings: {
      labor: 156,
      machinery: 89,
      material: 203
    },
    revenue: {
      total: 2847500,
      by_vertical: {
        labor: 1125000,
        machinery: 892500,
        material: 830000
      }
    },
    user_counts: {
      contractors: 342,
      suppliers: 156,
      labor_crews: 89
    }
  };

  private static mockActivityLogs: AdminActivityLog[] = [
    {
      id: 'log_001',
      user_id: '1',
      user_name: 'John Smith',
      action: 'Created material order',
      entity_type: 'booking',
      entity_id: 'ord_001',
      timestamp: '2024-01-18T10:00:00Z',
      details: 'Ordered 500 tons of concrete from ABC Materials'
    },
    {
      id: 'log_002',
      user_id: '1',
      user_name: 'John Smith',
      action: 'Submitted payment',
      entity_type: 'payment',
      entity_id: 'pay_001',
      timestamp: '2024-01-18T12:00:00Z',
      details: 'Payment of $15,000 submitted for order ord_001'
    }
  ];

  static async getAllUsers(): Promise<AdminUser[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockUsers;
  }

  static async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const userIndex = this.mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.mockUsers[userIndex].is_active = isActive;
    }
  }

  static async getAllOrders(): Promise<AdminOrder[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockOrders;
  }

  static async getAllPayments(): Promise<AdminPayment[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockPayments;
  }

  static async getAllDisputes(): Promise<AdminDispute[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockDisputes;
  }

  static async updateDisputeStatus(
    disputeId: string, 
    action: 'resolve' | 'escalate' | 'refund', 
    notes: string
  ): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const disputeIndex = this.mockDisputes.findIndex(d => d.id === disputeId);
    if (disputeIndex !== -1) {
      this.mockDisputes[disputeIndex].status = action === 'resolve' ? 'resolved' : 'escalated';
      this.mockDisputes[disputeIndex].resolution_notes = notes;
    }
  }

  static async getKPIs(timeRange: 'week' | 'month' | 'quarter'): Promise<AdminKPI> {
    // Simulate API call with different data based on time range
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock different values based on time range
    const multiplier = timeRange === 'week' ? 0.25 : timeRange === 'month' ? 1 : 3;
    
    return {
      daily_active_users: Math.floor(this.mockKPIs.daily_active_users * multiplier),
      total_bookings: {
        labor: Math.floor(this.mockKPIs.total_bookings.labor * multiplier),
        machinery: Math.floor(this.mockKPIs.total_bookings.machinery * multiplier),
        material: Math.floor(this.mockKPIs.total_bookings.material * multiplier)
      },
      revenue: {
        total: Math.floor(this.mockKPIs.revenue.total * multiplier),
        by_vertical: {
          labor: Math.floor(this.mockKPIs.revenue.by_vertical.labor * multiplier),
          machinery: Math.floor(this.mockKPIs.revenue.by_vertical.machinery * multiplier),
          material: Math.floor(this.mockKPIs.revenue.by_vertical.material * multiplier)
        }
      },
      user_counts: this.mockKPIs.user_counts // User counts don't change with time range
    };
  }

  static async getActivityLogs(): Promise<AdminActivityLog[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockActivityLogs;
  }

  static async sendAdminNotification(type: 'dispute' | 'flagged_behavior', data: any): Promise<void> {
    // Simulate sending notification to admin
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`Admin notification sent: ${type}`, data);
  }
}