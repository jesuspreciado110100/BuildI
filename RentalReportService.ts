export interface RentalSummary {
  totalHoursRented: number;
  totalSpent: number;
  totalRentals: number;
  averageRating: number;
  mostUsedMachineTypes: MachineTypeUsage[];
  topRenterPartners: RenterPartner[];
  monthlySpending: MonthlySpending[];
  recentActivity: RecentActivity[];
}

export interface MachineTypeUsage {
  category: string;
  hoursUsed: number;
  timesRented: number;
  totalSpent: number;
}

export interface RenterPartner {
  id: string;
  name: string;
  totalRentals: number;
  totalSpent: number;
  averageRating: number;
  lastRental: string;
  preferredMachines: string[];
}

export interface MonthlySpending {
  month: string;
  amount: number;
  rentals: number;
}

export interface RecentActivity {
  id: string;
  type: 'rental_completed' | 'payment_made' | 'rating_given';
  description: string;
  date: string;
  amount?: number;
}

export class RentalReportService {
  static async getRentalSummary(contractorId: string): Promise<RentalSummary> {
    try {
      // Mock data - in real app, this would come from API
      const mockSummary: RentalSummary = {
        totalHoursRented: 1247,
        totalSpent: 89650,
        totalRentals: 34,
        averageRating: 4.7,
        mostUsedMachineTypes: [
          {
            category: 'Excavator',
            hoursUsed: 456,
            timesRented: 12,
            totalSpent: 32400
          },
          {
            category: 'Loader',
            hoursUsed: 324,
            timesRented: 8,
            totalSpent: 18900
          },
          {
            category: 'Bulldozer',
            hoursUsed: 267,
            timesRented: 6,
            totalSpent: 21300
          },
          {
            category: 'Crane',
            hoursUsed: 200,
            timesRented: 8,
            totalSpent: 17050
          }
        ],
        topRenterPartners: [
          {
            id: 'renter1',
            name: 'Heavy Equipment Co.',
            totalRentals: 8,
            totalSpent: 28500,
            averageRating: 4.9,
            lastRental: '2024-01-15T00:00:00Z',
            preferredMachines: ['Excavator', 'Bulldozer']
          },
          {
            id: 'renter2',
            name: 'Construction Masters',
            totalRentals: 6,
            totalSpent: 19200,
            averageRating: 4.6,
            lastRental: '2024-01-10T00:00:00Z',
            preferredMachines: ['Loader', 'Crane']
          },
          {
            id: 'renter3',
            name: 'Metro Machinery',
            totalRentals: 5,
            totalSpent: 15800,
            averageRating: 4.8,
            lastRental: '2024-01-08T00:00:00Z',
            preferredMachines: ['Compactor', 'Grader']
          }
        ],
        monthlySpending: [
          { month: 'Jan 2024', amount: 12500, rentals: 4 },
          { month: 'Dec 2023', amount: 18200, rentals: 6 },
          { month: 'Nov 2023', amount: 15800, rentals: 5 },
          { month: 'Oct 2023', amount: 21300, rentals: 7 },
          { month: 'Sep 2023', amount: 9800, rentals: 3 },
          { month: 'Aug 2023', amount: 11850, rentals: 4 }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'rental_completed',
            description: 'Excavator rental completed at Downtown Site',
            date: '2024-01-15T14:30:00Z',
            amount: 2400
          },
          {
            id: '2',
            type: 'payment_made',
            description: 'Payment processed for Loader rental',
            date: '2024-01-14T10:15:00Z',
            amount: 1800
          },
          {
            id: '3',
            type: 'rating_given',
            description: 'Rated Heavy Equipment Co. - 5 stars',
            date: '2024-01-13T16:45:00Z'
          }
        ]
      };
      
      return mockSummary;
    } catch (error) {
      console.error('Error fetching rental summary:', error);
      throw error;
    }
  }

  static async getMonthlyReport(contractorId: string, month: string): Promise<any> {
    try {
      // Mock monthly report data
      return {
        month,
        totalSpent: 12500,
        totalRentals: 4,
        totalHours: 156,
        averageRating: 4.8,
        topCategory: 'Excavator',
        rentals: [
          {
            id: 'rental1',
            category: 'Excavator',
            renterName: 'Heavy Equipment Co.',
            startDate: '2024-01-05',
            endDate: '2024-01-07',
            totalCost: 3600,
            rating: 5
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      throw error;
    }
  }

  static async exportReport(contractorId: string, format: 'pdf' | 'csv'): Promise<string> {
    try {
      console.log('Exporting report for contractor:', contractorId, 'format:', format);
      // Mock export URL
      return `https://api.example.com/reports/${contractorId}/export.${format}`;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  static async getCostAnalysis(contractorId: string): Promise<any> {
    try {
      return {
        averageCostPerHour: 72,
        mostEfficientCategory: 'Loader',
        leastEfficientCategory: 'Crane',
        potentialSavings: 2400,
        recommendations: [
          'Consider bulk booking discounts for Excavator rentals',
          'Explore alternative suppliers for Crane rentals',
          'Schedule rentals during off-peak hours for better rates'
        ]
      };
    } catch (error) {
      console.error('Error fetching cost analysis:', error);
      throw error;
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  static formatHours(hours: number): string {
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }

  static getActivityIcon(type: RecentActivity['type']): string {
    switch (type) {
      case 'rental_completed':
        return '✅';
      case 'payment_made':
        return '💳';
      case 'rating_given':
        return '⭐';
      default:
        return '📋';
    }
  }
}